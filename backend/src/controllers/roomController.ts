import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        devices: true,
        preferences: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    return res.json({ rooms });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        devices: true,
        preferences: {
          include: { user: true }
        },
        decisions: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });
    return res.json({ room });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch room' });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, roomType, floor, defaultTemp } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    const household = await prisma.household.findFirst();
    if (!household) return res.status(400).json({ error: 'No active household' });

    const newRoom = await prisma.room.create({
      data: {
        householdId: household.id,
        name,
        roomType: roomType || 'BEDROOM',
        floor: floor || 1,
        defaultTemp: defaultTemp || 24.0,
        currentTemp: 24.0,
        currentHumidity: 55.0,
        currentOccupancy: 1,
        weather: 'Hot / Sunny',
        timeOfDay: '08:00 PM',
        isNight: true
      }
    });

    // Automatically create standard IoT sensors & actuators for this new room
    await prisma.device.createMany({
      data: [
        { roomId: newRoom.id, name: `${name} Smart AC`, type: 'AC', state: 'OFF', currentReading: 24.0, targetTemp: 24.0 },
        { roomId: newRoom.id, name: `${name} Smart Heater`, type: 'HEATER', state: 'OFF', currentReading: 24.0, targetTemp: 20.0 },
        { roomId: newRoom.id, name: `${name} Smart Thermostat`, type: 'THERMOSTAT', state: 'COMFORT', currentReading: 24.0, targetTemp: 24.0 },
        { roomId: newRoom.id, name: `${name} Temperature Sensor`, type: 'TEMP_SENSOR', state: 'IDLE', currentReading: 24.0, targetTemp: 24.0 },
        { roomId: newRoom.id, name: `${name} Occupancy Sensor`, type: 'OCCUPANCY_SENSOR', state: 'IDLE', currentReading: 1.0, targetTemp: 1.0 }
      ]
    });

    const roomWithDevices = await prisma.room.findUnique({
      where: { id: newRoom.id },
      include: { devices: true }
    });

    return res.status(201).json({ room: roomWithDevices });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create room' });
  }
};

export const updateRoomEnvironment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentTemp, currentHumidity, currentOccupancy, weather, timeOfDay, isNight } = req.body;

    const dataToUpdate: any = {};
    if (currentTemp !== undefined) dataToUpdate.currentTemp = parseFloat(currentTemp);
    if (currentHumidity !== undefined) dataToUpdate.currentHumidity = parseFloat(currentHumidity);
    if (currentOccupancy !== undefined) dataToUpdate.currentOccupancy = parseInt(currentOccupancy, 10);
    if (weather !== undefined) dataToUpdate.weather = weather;
    if (timeOfDay !== undefined) dataToUpdate.timeOfDay = timeOfDay;
    if (isNight !== undefined) dataToUpdate.isNight = Boolean(isNight);

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: dataToUpdate,
      include: {
        devices: true,
        preferences: {
          include: { user: true }
        }
      }
    });

    // Update sensor devices' readings
    if (currentTemp !== undefined) {
      await prisma.device.updateMany({
        where: { roomId: id, type: 'TEMP_SENSOR' },
        data: { currentReading: parseFloat(currentTemp) }
      });
    }
    if (currentHumidity !== undefined) {
      await prisma.device.updateMany({
        where: { roomId: id, type: 'HUMIDITY_SENSOR' },
        data: { currentReading: parseFloat(currentHumidity) }
      });
    }
    if (currentOccupancy !== undefined) {
      await prisma.device.updateMany({
        where: { roomId: id, type: 'OCCUPANCY_SENSOR' },
        data: { currentReading: parseFloat(currentOccupancy) }
      });
    }

    return res.json({ room: updatedRoom });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update room environment' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.room.delete({ where: { id } });
    return res.json({ message: 'Room deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete room' });
  }
};
