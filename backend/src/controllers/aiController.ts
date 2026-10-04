import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIDecisionEngine } from '../services/ai/decisionEngine';
import { FrameKnowledgeEngine } from '../services/frames/frameEngine';
import { ConflictStrategy } from '../services/conflicts/conflictEngine';

const prisma = new PrismaClient();
const aiDecisionEngine = new AIDecisionEngine(prisma);

export const runAiAnalysis = async (req: Request, res: Response) => {
  try {
    const { roomId, strategy, manualTargetOverride } = req.body;

    let targetRoomId = roomId;
    if (!targetRoomId) {
      const defaultRoom = await prisma.room.findFirst({
        where: { name: 'Living Room' }
      });
      targetRoomId = defaultRoom?.id;
    }

    if (!targetRoomId) {
      return res.status(404).json({ error: 'No room found for AI analysis' });
    }

    const result = await aiDecisionEngine.runAnalysis(
      targetRoomId,
      strategy as ConflictStrategy,
      manualTargetOverride !== undefined ? parseFloat(manualTargetOverride) : undefined
    );

    // Save notification
    await prisma.notification.create({
      data: {
        title: `AI Climate Decision: ${result.primaryMode}`,
        message: `Actuated ${result.acAction === 'ON' ? 'Cooling' : result.heaterAction === 'ON' ? 'Heating' : 'Comfort'} in ${result.situationFrame.slots.room_name?.value || 'Living Room'}. Target ${result.targetTemp}°C (Confidence ${result.confidenceScore}%).`,
        type: result.conflictResolution.hasConflict ? 'WARNING' : 'SUCCESS'
      }
    });

    return res.json({ result });
  } catch (error: any) {
    console.error('Error during AI analysis:', error);
    return res.status(500).json({ error: error.message || 'AI reasoning execution failed' });
  }
};

export const getCurrentSituationFrame = async (req: Request, res: Response) => {
  try {
    const room = await prisma.room.findFirst({
      where: { name: 'Living Room' },
      include: {
        devices: true,
        preferences: { include: { user: true } }
      }
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    const latestDecision = await prisma.aIDecision.findFirst({
      where: { roomId: room.id },
      orderBy: { timestamp: 'desc' }
    });

    const situationFrame = latestDecision
      ? JSON.parse(latestDecision.frameSnapshot)
      : FrameKnowledgeEngine.buildSituationFrame(
          {
            roomId: room.id,
            roomName: room.name,
            temperature: room.currentTemp,
            humidity: room.currentHumidity,
            occupancy: room.currentOccupancy,
            weather: room.weather,
            timeOfDay: room.timeOfDay,
            isNight: room.isNight,
            userPreferences: room.preferences.map(p => ({
              userName: p.user.name,
              preferredTemp: p.preferredTemp,
              priority: p.priority,
              weight: p.priorityWeight
            }))
          },
          26.0,
          'COOLING',
          { ac: 'ON', heater: 'OFF', fan: 'MEDIUM' },
          94.0
        );

    return res.json({ situationFrame });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve situational frame' });
  }
};

export const getFrameHierarchy = async (req: Request, res: Response) => {
  try {
    const hierarchy = FrameKnowledgeEngine.getFullHierarchy();
    return res.json({ hierarchy });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to load frame hierarchy' });
  }
};

export const getDecisionHistory = async (req: Request, res: Response) => {
  try {
    const { mode, hadConflict, limit } = req.query;

    const where: any = {};
    if (mode && typeof mode === 'string') {
      where.decisionMode = mode.toUpperCase();
    }
    if (hadConflict !== undefined) {
      where.hadConflict = hadConflict === 'true';
    }

    const decisions = await prisma.aIDecision.findMany({
      where,
      include: {
        room: { select: { id: true, name: true } },
        conflictEvents: true,
        deviceActions: { include: { device: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit as string, 10) : 50
    });

    return res.json({ decisions });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch decision history' });
  }
};

export const getRules = async (req: Request, res: Response) => {
  try {
    const rules = await prisma.decisionRule.findMany({
      orderBy: { priority: 'asc' }
    });
    return res.json({ rules });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch rules' });
  }
};
