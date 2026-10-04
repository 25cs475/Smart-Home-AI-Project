import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PreferenceConflictEngine, ConflictStrategy, UserPreferenceInput } from '../services/conflicts/conflictEngine';

const prisma = new PrismaClient();

export const getConflictHistory = async (req: Request, res: Response) => {
  try {
    const conflicts = await prisma.conflictEvent.findMany({
      include: {
        room: { select: { id: true, name: true } },
        decision: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    return res.json({ conflicts });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve conflict history' });
  }
};

export const previewConflictStrategies = async (req: Request, res: Response) => {
  try {
    let { preferences, manualTargetOverride, roomId } = req.body;

    if (!preferences || preferences.length === 0) {
      // If none provided, retrieve from specified room or default Living Room
      const targetRoom = await prisma.room.findFirst({
        where: roomId ? { id: roomId } : { name: 'Living Room' },
        include: {
          preferences: { include: { user: true } }
        }
      });

      if (targetRoom) {
        preferences = targetRoom.preferences.map(p => ({
          userName: p.user.name,
          preferredTemp: p.preferredTemp,
          priority: p.priority,
          priorityWeight: p.priorityWeight,
          role: p.user.role
        }));
      }
    }

    const preview = PreferenceConflictEngine.previewAllStrategies(
      preferences || [],
      manualTargetOverride !== undefined ? parseFloat(manualTargetOverride) : undefined
    );

    return res.json({ preview });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to preview conflict strategies' });
  }
};

export const resolveConflict = async (req: Request, res: Response) => {
  try {
    const { strategy, preferences, manualTargetOverride, roomId } = req.body;

    const result = PreferenceConflictEngine.resolve(
      preferences,
      strategy as ConflictStrategy,
      manualTargetOverride !== undefined ? parseFloat(manualTargetOverride) : undefined
    );

    return res.json({ result });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to resolve conflict' });
  }
};
