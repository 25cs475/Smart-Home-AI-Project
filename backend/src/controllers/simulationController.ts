import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIDecisionEngine } from '../services/ai/decisionEngine';

const prisma = new PrismaClient();
const aiDecisionEngine = new AIDecisionEngine(prisma);

export const triggerScenario = async (req: Request, res: Response) => {
  try {
    const scenarioId = parseInt(req.params.id, 10);

    const livingRoom = await prisma.room.findFirst({
      where: { name: 'Living Room' },
      include: { preferences: true, devices: true }
    });

    if (!livingRoom) {
      return res.status(404).json({ error: 'Living Room not found' });
    }

    // Release any previous manual overrides on Living Room devices
    await prisma.device.updateMany({
      where: { roomId: livingRoom.id },
      data: { isManualOverride: false }
    });

    const owner = await prisma.user.findFirst({ where: { role: 'HOME_OWNER' } });
    const member = await prisma.user.findFirst({ where: { role: 'HOUSEHOLD_MEMBER' } });

    let scenarioName = '';
    let expectedOutcome = '';

    switch (scenarioId) {
      case 1: {
        // Scenario 1 — Hot Evening: 32°C, 8 PM, 2 people, 24°C vs 28°C -> Cooling ON at 26°C
        scenarioName = 'Hot Evening';
        expectedOutcome = 'Cooling Active (AC ON, Target 26.0°C via Average Compromise)';
        await prisma.room.update({
          where: { id: livingRoom.id },
          data: {
            currentTemp: 32.0,
            currentHumidity: 68.0,
            currentOccupancy: 2,
            weather: 'Hot / Sunny',
            timeOfDay: '08:00 PM',
            isNight: true
          }
        });

        if (owner) {
          await prisma.userPreference.upsert({
            where: { id: (await prisma.userPreference.findFirst({ where: { userId: owner.id, roomId: livingRoom.id } }))?.id || 'none' },
            update: { preferredTemp: 24.0, priority: 'HIGH', priorityWeight: 2.0 },
            create: { userId: owner.id, roomId: livingRoom.id, preferredTemp: 24.0, priority: 'HIGH', priorityWeight: 2.0 }
          });
        }
        if (member) {
          await prisma.userPreference.upsert({
            where: { id: (await prisma.userPreference.findFirst({ where: { userId: member.id, roomId: livingRoom.id } }))?.id || 'none' },
            update: { preferredTemp: 28.0, priority: 'NORMAL', priorityWeight: 1.0 },
            create: { userId: member.id, roomId: livingRoom.id, preferredTemp: 28.0, priority: 'NORMAL', priorityWeight: 1.0 }
          });
        }
        break;
      }

      case 2: {
        // Scenario 2 — Cold Morning: 14°C, 7 AM, 2 people -> Heating ON
        scenarioName = 'Cold Morning';
        expectedOutcome = 'Heating Active (Heater ON, Target 22.0°C)';
        await prisma.room.update({
          where: { id: livingRoom.id },
          data: {
            currentTemp: 14.0,
            currentHumidity: 50.0,
            currentOccupancy: 2,
            weather: 'Cold / Chilly',
            timeOfDay: '07:00 AM',
            isNight: false
          }
        });
        break;
      }

      case 3: {
        // Scenario 3 — Empty Room: 30°C, 0 occupants -> Eco Mode
        scenarioName = 'Empty Room';
        expectedOutcome = 'Eco Mode (All HVAC Off, setback temperature)';
        await prisma.room.update({
          where: { id: livingRoom.id },
          data: {
            currentTemp: 30.0,
            currentHumidity: 65.0,
            currentOccupancy: 0,
            weather: 'Hot / Sunny',
            timeOfDay: '02:00 PM',
            isNight: false
          }
        });
        break;
      }

      case 4: {
        // Scenario 4 — Conflicting Preferences: 30°C, 2 people, 22°C vs 28°C -> Conflict Resolution
        scenarioName = 'Conflicting Preferences';
        expectedOutcome = 'Preference Conflict Detected & Resolved (22°C vs 28°C → 25.0°C)';
        await prisma.room.update({
          where: { id: livingRoom.id },
          data: {
            currentTemp: 30.0,
            currentHumidity: 60.0,
            currentOccupancy: 2,
            weather: 'Hot / Sunny',
            timeOfDay: '05:00 PM',
            isNight: false
          }
        });

        if (owner) {
          const p = await prisma.userPreference.findFirst({ where: { userId: owner.id, roomId: livingRoom.id } });
          if (p) await prisma.userPreference.update({ where: { id: p.id }, data: { preferredTemp: 22.0 } });
        }
        if (member) {
          const p = await prisma.userPreference.findFirst({ where: { userId: member.id, roomId: livingRoom.id } });
          if (p) await prisma.userPreference.update({ where: { id: p.id }, data: { preferredTemp: 28.0 } });
        }
        break;
      }

      case 5: {
        // Scenario 5 — Comfortable Environment: 24°C, 2 people -> HVAC OFF / Idle
        scenarioName = 'Comfortable Environment';
        expectedOutcome = 'Comfort Mode (Equilibrium maintained, HVAC Idle)';
        await prisma.room.update({
          where: { id: livingRoom.id },
          data: {
            currentTemp: 24.0,
            currentHumidity: 50.0,
            currentOccupancy: 2,
            weather: 'Mild / Clear',
            timeOfDay: '04:00 PM',
            isNight: false
          }
        });
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid scenario ID (1 to 5 supported)' });
    }

    // Automatically run AI analysis for this newly set scenario!
    const aiResult = await aiDecisionEngine.runAnalysis(livingRoom.id);

    return res.json({
      message: `Scenario ${scenarioId}: '${scenarioName}' initialized and evaluated.`,
      scenarioId,
      scenarioName,
      expectedOutcome,
      aiResult
    });
  } catch (error: any) {
    console.error('Error triggering scenario:', error);
    return res.status(500).json({ error: 'Failed to trigger preset scenario' });
  }
};

export const resetSimulation = async (req: Request, res: Response) => {
  try {
    const livingRoom = await prisma.room.findFirst({ where: { name: 'Living Room' } });
    if (!livingRoom) return res.status(404).json({ error: 'Room not found' });

    // 1. Reset Room Sensors
    await prisma.room.update({
      where: { id: livingRoom.id },
      data: {
        currentTemp: 32.0,
        currentHumidity: 68.0,
        currentOccupancy: 2,
        weather: 'Hot / Sunny',
        timeOfDay: '08:00 PM',
        isNight: true
      }
    });

    // 2. Reset Devices
    await prisma.device.updateMany({
      where: { roomId: livingRoom.id },
      data: { isManualOverride: false }
    });

    // 3. Reset Preferences (House Owner: 24°C, Family Member: 28°C)
    const owner = await prisma.user.findFirst({ where: { role: 'HOME_OWNER' } });
    const member = await prisma.user.findFirst({ where: { role: 'HOUSEHOLD_MEMBER' } });

    if (owner) {
      const p = await prisma.userPreference.findFirst({ where: { userId: owner.id, roomId: livingRoom.id } });
      if (p) await prisma.userPreference.update({ where: { id: p.id }, data: { preferredTemp: 24.0, priority: 'HIGH', priorityWeight: 2.0 } });
    }

    if (member) {
      const p = await prisma.userPreference.findFirst({ where: { userId: member.id, roomId: livingRoom.id } });
      if (p) await prisma.userPreference.update({ where: { id: p.id }, data: { preferredTemp: 28.0, priority: 'NORMAL', priorityWeight: 1.0 } });
    }

    // 4. Run AI Analysis
    const aiResult = await aiDecisionEngine.runAnalysis(livingRoom.id);

    // 5. Create notification
    await prisma.notification.create({
      data: {
        title: 'Simulation Reset',
        message: 'System environment, devices, and preferences restored to default benchmark state (32°C, 2 people, 8 PM).',
        type: 'INFO'
      }
    });

    return res.json({
      message: 'Simulation environment reset to benchmark state successfully.',
      aiResult
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to reset simulation' });
  }
};
