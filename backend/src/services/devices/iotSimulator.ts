import { PrismaClient } from '@prisma/client';

export interface DeviceStateUpdate {
  deviceId: string;
  state: 'COOLING' | 'HEATING' | 'ECO' | 'COMFORT' | 'OFF';
  targetTemp?: number;
  currentReading?: number;
  status?: 'ONLINE' | 'OFFLINE';
  isManualOverride?: boolean;
}

export class IoTDeviceSimulator {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Actuates virtual IoT devices based on AI decision
   */
  public async actuateDevicesForRoom(
    roomId: string,
    decisionId: string,
    mode: 'COOLING' | 'HEATING' | 'COMFORT' | 'ECO',
    targetTemp: number,
    currentTemp: number
  ) {
    const devices = await this.prisma.device.findMany({
      where: { roomId }
    });

    const actuatedDevices = [];

    for (const device of devices) {
      // If manually overridden by user, skip autonomous override unless reset
      if (device.isManualOverride) {
        continue;
      }

      const previousState = device.state;
      let newState = previousState;
      let newTarget = device.targetTemp;
      let reading = device.currentReading;

      switch (device.type) {
        case 'AC':
          newState = mode === 'COOLING' ? 'COOLING' : 'OFF';
          newTarget = targetTemp;
          reading = currentTemp;
          break;

        case 'HEATER':
          newState = mode === 'HEATING' ? 'HEATING' : 'OFF';
          newTarget = targetTemp;
          reading = currentTemp;
          break;

        case 'THERMOSTAT':
          newState = mode;
          newTarget = targetTemp;
          reading = currentTemp;
          break;

        case 'FAN':
          newState = mode === 'COOLING' ? 'COOLING' : (mode === 'ECO' ? 'OFF' : 'COMFORT');
          reading = mode === 'COOLING' ? 3.0 : (mode === 'ECO' ? 0.0 : 1.0);
          break;

        case 'TEMP_SENSOR':
          reading = currentTemp;
          break;

        case 'HUMIDITY_SENSOR':
        case 'OCCUPANCY_SENSOR':
          // Keep sensor readings synced
          break;
      }

      if (newState !== previousState || newTarget !== device.targetTemp) {
        const updated = await this.prisma.device.update({
          where: { id: device.id },
          data: {
            state: newState,
            targetTemp: newTarget,
            currentReading: reading,
            lastUpdated: new Date()
          }
        });

        await this.prisma.deviceAction.create({
          data: {
            decisionId,
            deviceId: device.id,
            previousState,
            newState,
            triggeredBy: 'AI_DECISION'
          }
        });

        actuatedDevices.push(updated);
      }
    }

    return actuatedDevices;
  }

  /**
   * Applies a manual override on a specific IoT device
   */
  public async setManualOverride(deviceId: string, targetState: string, targetTemp?: number) {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new Error('Device not found');

    const previousState = device.state;
    const updated = await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        state: targetState,
        targetTemp: targetTemp !== undefined ? targetTemp : device.targetTemp,
        isManualOverride: true,
        lastUpdated: new Date()
      }
    });

    await this.prisma.deviceAction.create({
      data: {
        deviceId,
        previousState,
        newState: targetState,
        triggeredBy: 'MANUAL_OVERRIDE'
      }
    });

    await this.prisma.notification.create({
      data: {
        title: 'Manual IoT Override Engaged',
        message: `${device.name} manually overridden to state '${targetState}' at ${targetTemp ? targetTemp + '°C' : 'current target'}. AI autonomous lock disengaged.`,
        type: 'WARNING'
      }
    });

    return updated;
  }

  /**
   * Releases manual override returning device to autonomous AI control
   */
  public async releaseManualOverride(deviceId: string) {
    return await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        isManualOverride: false,
        lastUpdated: new Date()
      }
    });
  }
}
