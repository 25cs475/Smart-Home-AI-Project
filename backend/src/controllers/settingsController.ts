import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    return res.json({ settings });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body; // array of { key, value }

    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: 'Settings must be an array of key-value objects' });
    }

    const updated = [];
    for (const item of settings) {
      if (item.key && item.value !== undefined) {
        const s = await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: { value: String(item.value) },
          create: { key: item.key, value: String(item.value), description: item.description || '' }
        });
        updated.push(s);
      }
    }

    return res.json({ message: 'Settings saved successfully', settings: updated });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update settings' });
  }
};
