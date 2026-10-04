import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });
    return res.json({ notifications });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    return res.json({ notification });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const clearNotifications = async (req: Request, res: Response) => {
  try {
    await prisma.notification.deleteMany();
    return res.json({ message: 'All notifications cleared' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to clear notifications' });
  }
};
