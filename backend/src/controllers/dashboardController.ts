import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const household = await prisma.household.findFirst({
      include: {
        rooms: {
          include: {
            devices: true,
            preferences: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!household) {
      return res.status(404).json({ error: 'Household not found' });
    }

    // Default to primary room (Living Room)
    const primaryRoom = household.rooms.find(r => r.name === 'Living Room') || household.rooms[0];

    // Fetch latest AI decision
    const latestDecision = await prisma.aIDecision.findFirst({
      where: { roomId: primaryRoom?.id },
      orderBy: { timestamp: 'desc' }
    });

    // Check device statuses
    const devices = primaryRoom ? primaryRoom.devices : [];
    const activeAc = devices.find(d => d.type === 'AC' && (d.state === 'COOLING' || d.state === 'ON'));
    const activeHeater = devices.find(d => d.type === 'HEATER' && (d.state === 'HEATING' || d.state === 'ON'));

    let hvacDisplay = 'HVAC Idle / Eco';
    if (activeAc) hvacDisplay = 'Cooling Active';
    else if (activeHeater) hvacDisplay = 'Heating Active';

    // Settings for AI mode
    const aiSetting = await prisma.systemSetting.findUnique({
      where: { key: 'aiAutomationActive' }
    });

    // Recent notifications
    const recentNotifications = await prisma.notification.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    // Conflict events count
    const totalConflicts = await prisma.conflictEvent.count();

    const now = new Date();
    const timeString = primaryRoom ? primaryRoom.timeOfDay : '08:00 PM';
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

    return res.json({
      system: {
        status: 'System Online',
        currentTime: timeString,
        currentDate: dateString,
        homeStatus: 'Optimal Climate Regulation',
        activeAiMode: aiSetting?.value === 'true' ? 'Autonomous AI Agent' : 'Manual Supervised',
        totalRooms: household.rooms.length,
        totalDevices: household.rooms.reduce((acc, r) => acc + r.devices.length, 0),
        onlineDevices: household.rooms.reduce((acc, r) => acc + r.devices.filter(d => d.status === 'ONLINE').length, 0)
      },
      currentConditions: {
        primaryRoomId: primaryRoom?.id,
        primaryRoomName: primaryRoom?.name || 'Living Room',
        temperature: primaryRoom ? primaryRoom.currentTemp : 32.0,
        humidity: primaryRoom ? primaryRoom.currentHumidity : 68.0,
        occupancy: primaryRoom ? primaryRoom.currentOccupancy : 2,
        weather: primaryRoom ? primaryRoom.weather : 'Hot / Sunny',
        hvacStatus: hvacDisplay,
        aiConfidence: latestDecision?.confidenceScore || 94.0,
        targetTemperature: latestDecision?.targetTemp || 26.0
      },
      rooms: household.rooms.map(r => ({
        id: r.id,
        name: r.name,
        roomType: r.roomType,
        floor: r.floor,
        currentTemp: r.currentTemp,
        currentHumidity: r.currentHumidity,
        currentOccupancy: r.currentOccupancy,
        weather: r.weather,
        deviceCount: r.devices.length,
        devices: r.devices.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          state: d.state,
          status: d.status,
          isManualOverride: d.isManualOverride
        }))
      })),
      recentDecision: latestDecision,
      recentNotifications,
      metrics: {
        totalConflictsResolved: totalConflicts,
        estimatedDailyKwh: 14.8,
        energySavingsPercent: 26.4
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
};
