import { PrismaClient } from '@prisma/client';
import { FrameKnowledgeEngine, FrameStructure, ClimateContextInput } from '../frames/frameEngine';
import { ClimateRuleEngine, RuleEvaluationResult } from '../climate/climateRules';
import { PreferenceConflictEngine, ConflictResolutionResult, ConflictStrategy, UserPreferenceInput } from '../conflicts/conflictEngine';
import { IoTDeviceSimulator } from '../devices/iotSimulator';

export interface ReasoningStep {
  stepNumber: number;
  title: string;
  stage: 'COLLECT_CONTEXT' | 'BUILD_FRAME' | 'EVALUATE_RULES' | 'DETECT_CONFLICT' | 'RESOLVE_CONFLICT' | 'DETERMINE_ACTION' | 'UPDATE_IOT';
  description: string;
  data: any;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
}

export interface AnalysisPipelineOutput {
  decisionId: string;
  roomId: string;
  timestamp: string;
  steps: ReasoningStep[];
  primaryMode: 'COOLING' | 'HEATING' | 'COMFORT' | 'ECO';
  targetTemp: number;
  acAction: 'ON' | 'OFF';
  heaterAction: 'ON' | 'OFF';
  fanAction: 'HIGH' | 'MEDIUM' | 'LOW' | 'OFF';
  confidenceScore: number;
  explanation: {
    title: string;
    contextSummary: string;
    thermalRationale: string;
    conflictRationale: string;
    finalDecision: string;
    fullText: string;
  };
  situationFrame: FrameStructure;
  ruleEvaluation: RuleEvaluationResult;
  conflictResolution: ConflictResolutionResult;
}

export class AIDecisionEngine {
  private prisma: PrismaClient;
  private iotSimulator: IoTDeviceSimulator;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
    this.iotSimulator = new IoTDeviceSimulator(prismaClient);
  }

  /**
   * Calculates a deterministic confidence score derived from context completeness and alignment
   */
  private calculateConfidenceScore(
    context: ClimateContextInput,
    hasConflict: boolean,
    delta: number
  ): number {
    let baseConfidence = 95.0;

    // Penalty for empty sensor readings or extreme volatility
    if (context.humidity < 15 || context.humidity > 95) baseConfidence -= 3.0;
    if (context.temperature < 5 || context.temperature > 45) baseConfidence -= 2.0;

    // Deduct slightly for large human preference conflict variance
    if (hasConflict) {
      const conflictDeduction = Math.min(6.0, delta * 1.0);
      baseConfidence -= conflictDeduction;
    }

    // Boost if consistent multi-sensor correlation
    if (context.occupancy > 0 && context.temperature > 20) {
      baseConfidence += 2.0;
    }

    return Math.min(99.0, Math.max(85.0, parseFloat(baseConfidence.toFixed(1))));
  }

  /**
   * Executes the full 7-step Sense-Reason-Act intelligence pipeline
   */
  public async runAnalysis(
    roomId: string,
    forcedStrategy?: ConflictStrategy,
    manualTargetOverride?: number
  ): Promise<AnalysisPipelineOutput> {
    const steps: ReasoningStep[] = [];

    // Step 1: Collect Context
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        devices: true,
        preferences: {
          include: { user: true }
        }
      }
    });

    if (!room) throw new Error(`Room not found for id: ${roomId}`);

    // Fetch system settings
    const settings = await this.prisma.systemSetting.findMany();
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
    const coolingThreshold = parseFloat(settingsMap['coolingThreshold'] || '28.0');
    const heatingThreshold = parseFloat(settingsMap['heatingThreshold'] || '18.0');
    const defaultStrategy = (forcedStrategy || settingsMap['defaultConflictStrategy'] || 'AVERAGE') as ConflictStrategy;

    // Collect active user preferences
    const candidatePrefs: UserPreferenceInput[] = room.preferences.map(p => ({
      userName: p.user.name,
      preferredTemp: p.preferredTemp,
      priority: p.priority,
      priorityWeight: p.priorityWeight,
      role: p.user.role
    }));

    const climateContext: ClimateContextInput = {
      roomId: room.id,
      roomName: room.name,
      temperature: room.currentTemp,
      humidity: room.currentHumidity,
      occupancy: room.currentOccupancy,
      weather: room.weather,
      timeOfDay: room.timeOfDay,
      isNight: room.isNight,
      userPreferences: candidatePrefs.map(p => ({
        userName: p.userName,
        preferredTemp: p.preferredTemp,
        priority: p.priority,
        weight: p.priorityWeight
      }))
    };

    steps.push({
      stepNumber: 1,
      title: 'Collect Context',
      stage: 'COLLECT_CONTEXT',
      description: `Harvested sensor telemetry: Indoor ${room.currentTemp}°C, Humidity ${room.currentHumidity}%, Occupancy ${room.currentOccupancy}, Weather '${room.weather}', Clock ${room.timeOfDay}.`,
      data: climateContext,
      status: 'COMPLETED'
    });

    // Step 2: Build Situation Frame
    steps.push({
      stepNumber: 2,
      title: 'Build Situation Frame',
      stage: 'BUILD_FRAME',
      description: `Instantiated CLIMATE_SITUATION_FRAME inheriting baseline boundaries from HOME_FRAME and physical actuators from ROOM_FRAME.`,
      data: { parentFrame: 'ROOM_FRAME', frameType: 'CLIMATE_SITUATION_FRAME' },
      status: 'COMPLETED'
    });

    // Step 3: Evaluate Rules
    const ruleEvaluation = ClimateRuleEngine.evaluateRules(
      {
        temperature: room.currentTemp,
        humidity: room.currentHumidity,
        occupancy: room.currentOccupancy,
        weather: room.weather,
        isNight: room.isNight,
        timeOfDay: room.timeOfDay
      },
      coolingThreshold,
      heatingThreshold
    );

    steps.push({
      stepNumber: 3,
      title: 'Evaluate Rules',
      stage: 'EVALUATE_RULES',
      description: `Evaluated declarative inference rules. Primary demand: ${ruleEvaluation.primaryMode}. Fired ${ruleEvaluation.firedRules.length} rules.`,
      data: ruleEvaluation.firedRules,
      status: 'COMPLETED'
    });

    // Step 4: Detect Preference Conflict
    const conflictResolution = PreferenceConflictEngine.resolve(
      candidatePrefs,
      defaultStrategy,
      manualTargetOverride,
      room.name
    );

    steps.push({
      stepNumber: 4,
      title: 'Detect Preference Conflict',
      stage: 'DETECT_CONFLICT',
      description: conflictResolution.hasConflict
        ? `Preference Conflict Detected: Divergence of ${conflictResolution.delta}°C between active occupants (${conflictResolution.usersInvolved.join(' vs ')}).`
        : `No thermal conflict detected across current occupants.`,
      data: {
        hasConflict: conflictResolution.hasConflict,
        delta: conflictResolution.delta,
        usersInvolved: conflictResolution.usersInvolved
      },
      status: 'COMPLETED'
    });

    // Step 5: Resolve Conflict
    steps.push({
      stepNumber: 5,
      title: 'Resolve Conflict',
      stage: 'RESOLVE_CONFLICT',
      description: `Executed '${conflictResolution.strategyUsed}' resolution strategy. ${conflictResolution.calculationBreakdown}. Target set to ${conflictResolution.resolvedTargetTemp}°C.`,
      data: {
        strategy: conflictResolution.strategyUsed,
        resolvedTargetTemp: conflictResolution.resolvedTargetTemp,
        calculation: conflictResolution.calculationBreakdown
      },
      status: 'COMPLETED'
    });

    // Step 6: Determine HVAC Action
    let finalTargetTemp = conflictResolution.resolvedTargetTemp;
    if (ruleEvaluation.targetTempAdjustment !== 0) {
      finalTargetTemp += ruleEvaluation.targetTempAdjustment;
    }

    if (ruleEvaluation.primaryMode === 'ECO') {
      finalTargetTemp = room.defaultTemp + 3.0; // Eco setback
    }

    finalTargetTemp = parseFloat(finalTargetTemp.toFixed(1));

    const acAction = ruleEvaluation.recommendedAc;
    const heaterAction = ruleEvaluation.recommendedHeater;
    const fanAction = ruleEvaluation.recommendedFan;
    const confidenceScore = this.calculateConfidenceScore(
      climateContext,
      conflictResolution.hasConflict,
      conflictResolution.delta
    );

    steps.push({
      stepNumber: 6,
      title: 'Determine HVAC Action',
      stage: 'DETERMINE_ACTION',
      description: `Synthesized decision: Mode=${ruleEvaluation.primaryMode}, Target=${finalTargetTemp}°C, AC=${acAction}, Heater=${heaterAction}, Fan=${fanAction}, Confidence=${confidenceScore}%.`,
      data: {
        mode: ruleEvaluation.primaryMode,
        targetTemp: finalTargetTemp,
        ac: acAction,
        heater: heaterAction,
        fan: fanAction,
        confidence: confidenceScore
      },
      status: 'COMPLETED'
    });

    // Update situation frame slots with completed reasoning
    const situationFrame = FrameKnowledgeEngine.buildSituationFrame(
      climateContext,
      finalTargetTemp,
      ruleEvaluation.primaryMode,
      { ac: acAction, heater: heaterAction, fan: fanAction },
      confidenceScore
    );

    // Dynamic Explainable AI Breakdown (XAI)
    const contextSummary = `Current indoor temperature is ${room.currentTemp.toFixed(1)}°C with ${room.currentOccupancy} occupant(s) in ${room.name} at ${room.timeOfDay}.`;
    const thermalRationale = ruleEvaluation.primaryMode === 'COOLING'
      ? `Temperature exceeds cooling threshold (${coolingThreshold}°C). Active Cooling required.`
      : ruleEvaluation.primaryMode === 'HEATING'
      ? `Temperature falls below heating threshold (${heatingThreshold}°C). Active Heating required.`
      : ruleEvaluation.primaryMode === 'ECO'
      ? `Room is vacant (occupancy = 0). Energy conservation Eco Mode engaged.`
      : `Temperature is within balanced comfort range (${heatingThreshold}°C - ${coolingThreshold}°C). HVAC idle.`;

    const conflictRationale = conflictResolution.hasConflict
      ? `User preferences conflict: ${candidatePrefs.map(p => `${p.userName} (${p.preferredTemp}°C)`).join(' vs ')}. Resolved via ${conflictResolution.strategyUsed} strategy to ${conflictResolution.resolvedTargetTemp}°C.`
      : `User target set to ${conflictResolution.resolvedTargetTemp}°C without conflict.`;

    const finalDecision = `FINAL DECISION: AC → ${acAction} | Heater → ${heaterAction} | Fan → ${fanAction} | Target → ${finalTargetTemp}°C | Mode → ${ruleEvaluation.primaryMode} | Confidence → ${confidenceScore}%.`;

    const fullExplanation = `${contextSummary}\n\n${thermalRationale}\n\n${conflictRationale}\n\n${finalDecision}`;

    // Record AIDecision in database
    const savedDecision = await this.prisma.aIDecision.create({
      data: {
        roomId: room.id,
        contextSnapshot: JSON.stringify(climateContext),
        frameSnapshot: JSON.stringify(situationFrame),
        rulesFired: JSON.stringify(ruleEvaluation.firedRules.map(r => r.ruleCode)),
        decisionMode: ruleEvaluation.primaryMode,
        targetTemp: finalTargetTemp,
        acAction,
        heaterAction,
        fanAction,
        confidenceScore,
        explanation: fullExplanation,
        hadConflict: conflictResolution.hasConflict,
        conflictResolutionStrategy: conflictResolution.hasConflict ? conflictResolution.strategyUsed : null
      }
    });

    // If conflict detected, record ConflictEvent
    if (conflictResolution.hasConflict) {
      await this.prisma.conflictEvent.create({
        data: {
          decisionId: savedDecision.id,
          roomId: room.id,
          usersInvolved: JSON.stringify(conflictResolution.usersInvolved),
          preferencesSnapshot: JSON.stringify(candidatePrefs),
          strategyUsed: conflictResolution.strategyUsed,
          resolvedTargetTemp: conflictResolution.resolvedTargetTemp
        }
      });
    }

    // Step 7: Update IoT Devices
    const actuated = await this.iotSimulator.actuateDevicesForRoom(
      room.id,
      savedDecision.id,
      ruleEvaluation.primaryMode,
      finalTargetTemp,
      room.currentTemp
    );

    steps.push({
      stepNumber: 7,
      title: 'Update IoT Device',
      stage: 'UPDATE_IOT',
      description: `Actuated ${actuated.length} virtual IoT device(s) to align with AI target states.`,
      data: actuated.map(d => ({ name: d.name, state: d.state, target: d.targetTemp })),
      status: 'COMPLETED'
    });

    return {
      decisionId: savedDecision.id,
      roomId: room.id,
      timestamp: new Date().toISOString(),
      steps,
      primaryMode: ruleEvaluation.primaryMode,
      targetTemp: finalTargetTemp,
      acAction,
      heaterAction,
      fanAction,
      confidenceScore,
      explanation: {
        title: 'Why Did AI Make This Decision?',
        contextSummary,
        thermalRationale,
        conflictRationale,
        finalDecision,
        fullText: fullExplanation
      },
      situationFrame,
      ruleEvaluation,
      conflictResolution
    };
  }
}
