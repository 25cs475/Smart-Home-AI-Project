import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPreferences = async (req: Request, res: Response) => {
  try {
    const preferences = await prisma.userPreference.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        room: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ preferences });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

export const createPreference = async (req: Request, res: Response) => {
  try {
    const { userId, roomId, preferredTemp, climatePreference, priority, priorityWeight, activeStartHour, activeEndHour } = req.body;

    if (!userId || preferredTemp === undefined) {
      return res.status(400).json({ error: 'User and preferred temperature are required' });
    }

    const newPref = await prisma.userPreference.create({
      data: {
        userId,
        roomId: roomId || null,
        preferredTemp: parseFloat(preferredTemp),
        climatePreference: climatePreference || 'COOL',
        priority: priority || 'NORMAL',
        priorityWeight: priorityWeight ? parseFloat(priorityWeight) : (priority === 'HIGH' ? 2.0 : 1.0),
        activeStartHour: activeStartHour !== undefined ? parseInt(activeStartHour) : 0,
        activeEndHour: activeEndHour !== undefined ? parseInt(activeEndHour) : 24
      },
      include: {
        user: true,
        room: true
      }
    });

    return res.status(201).json({ preference: newPref });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create preference' });
  }
};

export const updatePreference = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { preferredTemp, climatePreference, priority, priorityWeight, activeStartHour, activeEndHour, roomId } = req.body;

    const data: any = {};
    if (preferredTemp !== undefined) data.preferredTemp = parseFloat(preferredTemp);
    if (climatePreference !== undefined) data.climatePreference = climatePreference;
    if (priority !== undefined) {
      data.priority = priority;
      data.priorityWeight = priority === 'HIGH' ? 2.0 : (priority === 'LOW' ? 0.5 : 1.0);
    }
    if (priorityWeight !== undefined) data.priorityWeight = parseFloat(priorityWeight);
    if (activeStartHour !== undefined) data.activeStartHour = parseInt(activeStartHour);
    if (activeEndHour !== undefined) data.activeEndHour = parseInt(activeEndHour);
    if (roomId !== undefined) data.roomId = roomId;

    const updated = await prisma.userPreference.update({
      where: { id },
      data,
      include: {
        user: true,
        room: true
      }
    });

    return res.json({ preference: updated });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update preference' });
  }
};

export const deletePreference = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.userPreference.delete({ where: { id } });
    return res.json({ message: 'Preference removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete preference' });
  }
};
