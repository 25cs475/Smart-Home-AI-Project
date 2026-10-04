/**
 * Rule-Based Reasoning Engine for SmartHome Climate Control
 * Evaluates contextual environmental conditions and triggers transparent inference rules.
 */

export interface RuleEvaluationContext {
  temperature: number;
  humidity: number;
  occupancy: number;
  weather: string;
  isNight: boolean;
  timeOfDay: string;
  coolingThreshold?: number;
  heatingThreshold?: number;
}

export interface FiredRule {
  ruleCode: string;
  name: string;
  description: string;
  conditionMet: boolean;
  rationale: string;
  inferredMode?: 'COOLING' | 'HEATING' | 'COMFORT' | 'ECO';
  priority: number;
  targetTempAdjustment?: number;
}

export interface RuleEvaluationResult {
  primaryMode: 'COOLING' | 'HEATING' | 'COMFORT' | 'ECO';
  firedRules: FiredRule[];
  recommendedAc: 'ON' | 'OFF';
  recommendedHeater: 'ON' | 'OFF';
  recommendedFan: 'HIGH' | 'MEDIUM' | 'LOW' | 'OFF';
  targetTempAdjustment: number;
  ruleExplanation: string;
}

export class ClimateRuleEngine {
  private static defaultCoolingThreshold = 28.0;
  private static defaultHeatingThreshold = 18.0;

  /**
   * Evaluates all inference rules against input situational context
   */
  public static evaluateRules(
    context: RuleEvaluationContext,
    customCoolingThreshold?: number,
    customHeatingThreshold?: number
  ): RuleEvaluationResult {
    let coolingThreshold = customCoolingThreshold ?? this.defaultCoolingThreshold;
    const heatingThreshold = customHeatingThreshold ?? this.defaultHeatingThreshold;

    const firedRules: FiredRule[] = [];
    let targetTempAdjustment = 0;

    // 1. Check Rainy Weather Modifier
    if (context.weather.toLowerCase().includes('rain')) {
      coolingThreshold += 1.0;
      firedRules.push({
        ruleCode: 'RULE_RAINY_OUTDOOR',
        name: 'Exterior Rain Dampening Threshold Rule',
        description: 'IF weather is Rainy THEN increment cooling activation threshold by +1.0°C due to exterior cooling effects.',
        conditionMet: true,
        rationale: `Outdoor weather is '${context.weather}'. Effective cooling trigger raised to ${coolingThreshold}°C.`,
        priority: 5
      });
    }

    // 2. Core Operational Mode Rules (Occupancy & Temperature)
    let primaryMode: 'COOLING' | 'HEATING' | 'COMFORT' | 'ECO' = 'COMFORT';
    let recommendedAc: 'ON' | 'OFF' = 'OFF';
    let recommendedHeater: 'ON' | 'OFF' = 'OFF';
    let recommendedFan: 'HIGH' | 'MEDIUM' | 'LOW' | 'OFF' = 'LOW';

    if (context.occupancy === 0) {
      primaryMode = 'ECO';
      recommendedAc = 'OFF';
      recommendedHeater = 'OFF';
      recommendedFan = 'OFF';

      firedRules.push({
        ruleCode: 'RULE_ECO_EMPTY',
        name: 'Empty Room Eco Inactivity Rule',
        description: 'IF occupancy == 0 THEN climate_mode = ECO. Minimize power consumption when room is vacant.',
        conditionMet: true,
        rationale: `Room occupancy is 0 people. Active HVAC cooling/heating suspended. Energy conservation mode engaged.`,
        inferredMode: 'ECO',
        priority: 1
      });
    } else if (context.temperature >= coolingThreshold) {
      primaryMode = 'COOLING';
      recommendedAc = 'ON';
      recommendedHeater = 'OFF';
      recommendedFan = 'HIGH';

      firedRules.push({
        ruleCode: 'RULE_EXTREME_HEAT',
        name: 'High Thermal Demand Rule (Cooling Required)',
        description: `IF temperature >= ${coolingThreshold}°C AND occupancy > 0 THEN climate_mode = COOLING, AC = ON.`,
        conditionMet: true,
        rationale: `Indoor temperature is ${context.temperature.toFixed(1)}°C (>= threshold of ${coolingThreshold}°C) with ${context.occupancy} occupants. Cooling is urgently required.`,
        inferredMode: 'COOLING',
        priority: 2
      });
    } else if (context.temperature <= heatingThreshold) {
      primaryMode = 'HEATING';
      recommendedAc = 'OFF';
      recommendedHeater = 'ON';
      recommendedFan = 'MEDIUM';

      firedRules.push({
        ruleCode: 'RULE_EXTREME_COLD',
        name: 'Low Thermal Demand Rule (Heating Required)',
        description: `IF temperature <= ${heatingThreshold}°C AND occupancy > 0 THEN climate_mode = HEATING, Heater = ON.`,
        conditionMet: true,
        rationale: `Indoor temperature is ${context.temperature.toFixed(1)}°C (<= threshold of ${heatingThreshold}°C) with ${context.occupancy} occupants. Heating is urgently required.`,
        inferredMode: 'HEATING',
        priority: 2
      });
    } else {
      primaryMode = 'COMFORT';
      recommendedAc = 'OFF';
      recommendedHeater = 'OFF';
      recommendedFan = 'LOW';

      firedRules.push({
        ruleCode: 'RULE_COMFORT_ZONE',
        name: 'Ambient Comfort Equilibrium Rule',
        description: `IF temperature is between ${heatingThreshold}°C and ${coolingThreshold}°C AND occupancy > 0 THEN climate_mode = COMFORT (HVAC Idle).`,
        conditionMet: true,
        rationale: `Indoor temperature (${context.temperature.toFixed(1)}°C) falls within the balanced comfort band (${heatingThreshold}°C - ${coolingThreshold}°C). HVAC compressor is idle.`,
        inferredMode: 'COMFORT',
        priority: 3
      });
    }

    // 3. Circadian Night Sleep Modulation
    if (context.isNight && context.occupancy > 0 && primaryMode === 'COOLING') {
      targetTempAdjustment -= 1.0;
      firedRules.push({
        ruleCode: 'RULE_NIGHT_SLEEP',
        name: 'Night Circadian Thermoregulation Rule',
        description: 'IF time is night AND occupancy > 0 THEN apply target temperature offset for restorative deep sleep.',
        conditionMet: true,
        rationale: `Nighttime context active (${context.timeOfDay}). Target temperature modulated by -1.0°C to assist human circadian rest.`,
        priority: 4,
        targetTempAdjustment: -1.0
      });
    }

    // 4. Latent Heat & High Humidity Adjustment
    if (context.humidity >= 70 && context.temperature >= 25 && context.occupancy > 0) {
      recommendedFan = 'HIGH';
      firedRules.push({
        ruleCode: 'RULE_HIGH_HUMIDITY',
        name: 'Latent Heat Moisture Compensation Rule',
        description: 'IF humidity >= 70% AND temperature >= 25°C THEN maximize fan circulation for dehumidification.',
        conditionMet: true,
        rationale: `Relative humidity is elevated at ${context.humidity.toFixed(0)}%. Fan velocity escalated to HIGH to prevent moisture stagnation.`,
        priority: 4
      });
    }

    // Synthesize human-readable rule explanation
    const ruleExplanation = firedRules.map(r => `• [${r.ruleCode}] ${r.rationale}`).join('\n');

    return {
      primaryMode,
      firedRules,
      recommendedAc,
      recommendedHeater,
      recommendedFan,
      targetTempAdjustment,
      ruleExplanation
    };
  }
}
