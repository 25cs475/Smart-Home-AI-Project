import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { IoTDeviceSimulator } from '../services/devices/iotSimulator';

const prisma = new PrismaClient();
const iotSimulator = new IoTDeviceSimulator(prisma);

export const getAllDevices = async (req: Request, res: Response) => {
  try {
    const devices = await prisma.device.findMany({
      include: { room: true },
      orderBy: { name: 'asc' }
    });
    return res.json({ devices });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

export const setManualOverride = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { state, targetTemp } = req.body;

    if (!state) {
      return res.status(400).json({ error: 'State is required for manual override' });
    }

    const updatedDevice = await iotSimulator.setManualOverride(
      id,
      state,
      targetTemp !== undefined ? parseFloat(targetTemp) : undefined
    );

    return res.json({
      message: 'Manual override engaged successfully. AI autonomous control disengaged for this device.',
      device: updatedDevice
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to set manual override' });
  }
};

export const releaseManualOverride = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedDevice = await iotSimulator.releaseManualOverride(id);
    return res.json({
      message: 'Manual override released. Device returned to AI autonomous regulation.',
      device: updatedDevice
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to release override' });
  }
};

export const toggleDeviceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await prisma.device.findUnique({ where: { id } });
    if (!device) return res.status(404).json({ error: 'Device not found' });

    const newStatus = device.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    const updated = await prisma.device.update({
      where: { id },
      data: { status: newStatus }
    });

    return res.json({ device: updated });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to toggle device status' });
  }
};
