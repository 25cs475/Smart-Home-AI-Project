import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SmartHome AI Database Seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.deviceAction.deleteMany();
  await prisma.conflictEvent.deleteMany();
  await prisma.aIDecision.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.device.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.frameSlot.deleteMany();
  await prisma.knowledgeFrame.deleteMany();
  await prisma.decisionRule.deleteMany();
  await prisma.room.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 1. Create Household
  const household = await prisma.household.create({
    data: {
      name: 'Smart Residence',
      address: '101 Intelligent Way, Silicon Valley, CA'
    }
  });

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@smarthome.ai',
      passwordHash,
      name: 'House Owner',
      role: 'HOME_OWNER'
    }
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@smarthome.ai',
      passwordHash,
      name: 'Family Member',
      role: 'HOUSEHOLD_MEMBER'
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@smarthome.ai',
      passwordHash: adminHash,
      name: 'System Administrator',
      role: 'ADMIN'
    }
  });

  // 3. Create Default Rooms
  const livingRoom = await prisma.room.create({
    data: {
      householdId: household.id,
      name: 'Living Room',
      floor: 1,
      roomType: 'LIVING_ROOM',
      defaultTemp: 24.0,
      currentTemp: 32.0,
      currentHumidity: 68.0,
      currentOccupancy: 2,
      weather: 'Hot / Sunny',
      timeOfDay: '08:00 PM',
      isNight: true
    }
  });

  const bedroom = await prisma.room.create({
    data: {
      householdId: household.id,
      name: 'Bedroom',
      floor: 2,
      roomType: 'BEDROOM',
      defaultTemp: 22.0,
      currentTemp: 27.0,
      currentHumidity: 62.0,
      currentOccupancy: 1,
      weather: 'Hot / Sunny',
      timeOfDay: '08:00 PM',
      isNight: true
    }
  });

  const studyRoom = await prisma.room.create({
    data: {
      householdId: household.id,
      name: 'Study Room',
      floor: 1,
      roomType: 'STUDY_ROOM',
      defaultTemp: 23.0,
      currentTemp: 25.0,
      currentHumidity: 55.0,
      currentOccupancy: 0,
      weather: 'Hot / Sunny',
      timeOfDay: '08:00 PM',
      isNight: true
    }
  });

  const kitchen = await prisma.room.create({
    data: {
      householdId: household.id,
      name: 'Kitchen',
      floor: 1,
      roomType: 'KITCHEN',
      defaultTemp: 24.0,
      currentTemp: 30.0,
      currentHumidity: 70.0,
      currentOccupancy: 0,
      weather: 'Hot / Sunny',
      timeOfDay: '08:00 PM',
      isNight: true
    }
  });

  // 4. Create User Preferences
  await prisma.userPreference.create({
    data: {
      userId: owner.id,
      roomId: livingRoom.id,
      preferredTemp: 24.0,
      climatePreference: 'COOL',
      priority: 'HIGH',
      priorityWeight: 2.0,
      activeStartHour: 7,
      activeEndHour: 23
    }
  });

  await prisma.userPreference.create({
    data: {
      userId: member.id,
      roomId: livingRoom.id,
      preferredTemp: 28.0,
      climatePreference: 'WARM',
      priority: 'NORMAL',
      priorityWeight: 1.0,
      activeStartHour: 8,
      activeEndHour: 22
    }
  });

  await prisma.userPreference.create({
    data: {
      userId: owner.id,
      roomId: bedroom.id,
      preferredTemp: 22.0,
      climatePreference: 'COOL',
      priority: 'HIGH',
      priorityWeight: 2.0,
      activeStartHour: 21,
      activeEndHour: 8
    }
  });

  // 5. Create Devices for Living Room & Other Rooms
  const acDevice = await prisma.device.create({
    data: {
      roomId: livingRoom.id,
      name: 'Living Room Smart AC',
      type: 'AC',
      status: 'ONLINE',
      state: 'COOLING',
      currentReading: 32.0,
      targetTemp: 26.0,
      isManualOverride: false
    }
  });

  const heaterDevice = await prisma.device.create({
    data: {
      roomId: livingRoom.id,
      name: 'Living Room Smart Heater',
      type: 'HEATER',
      status: 'ONLINE',
      state: 'OFF',
      currentReading: 0.0,
      targetTemp: 20.0,
      isManualOverride: false
    }
  });

  const thermostatDevice = await prisma.device.create({
    data: {
      roomId: livingRoom.id,
      name: 'Living Room Smart Thermostat',
      type: 'THERMOSTAT',
      status: 'ONLINE',
      state: 'COOLING',
      currentReading: 32.0,
      targetTemp: 26.0,
      isManualOverride: false
    }
  });

  const tempSensor = await prisma.device.create({
    data: {
      roomId: livingRoom.id,
      name: 'Living Room Temp Sensor',
      type: 'TEMP_SENSOR',
      status: 'ONLINE',
      state: 'IDLE',
      currentReading: 32.0,
      targetTemp: 32.0
    }
  });

  const humiditySensor = await prisma.device.create({
    data: {
      roomId: livingRoom.id,
      name: 'Living Room Humidity Sensor',
      type: 'HUMIDITY_SENSOR',
      status: 'ONLINE',
      state: 'IDLE',
      currentReading: 68.0,
      targetTemp: 50.0
    }
  });

  const occupancySensor = await prisma.device.create({
    data: {
      roomId: livingRoom.id,
      name: 'Living Room Occupancy Sensor',
      type: 'OCCUPANCY_SENSOR',
      status: 'ONLINE',
      state: 'IDLE',
      currentReading: 2.0,
      targetTemp: 2.0
    }
  });

  const smartFan = await prisma.device.create({
    data: {
      roomId: livingRoom.id,
      name: 'Living Room Smart Fan',
      type: 'FAN',
      status: 'ONLINE',
      state: 'COMFORT',
      currentReading: 2.0,
      targetTemp: 2.0
    }
  });

  // Bedroom & Study devices
  await prisma.device.create({
    data: {
      roomId: bedroom.id,
      name: 'Bedroom Smart Inverter AC',
      type: 'AC',
      status: 'ONLINE',
      state: 'COOLING',
      currentReading: 27.0,
      targetTemp: 23.0
    }
  });

  await prisma.device.create({
    data: {
      roomId: studyRoom.id,
      name: 'Study Room Eco Heat Pump',
      type: 'HEATER',
      status: 'ONLINE',
      state: 'ECO',
      currentReading: 25.0,
      targetTemp: 21.0
    }
  });

  // 6. Create Knowledge Frames Hierarchy
  const homeFrame = await prisma.knowledgeFrame.create({
    data: {
      frameType: 'HOME_FRAME',
      name: 'HOME_FRAME (Global Policy)',
      description: 'Root knowledge frame representing overall residence climate policies, global default comfort ranges, and energy modes.',
      slotsJson: JSON.stringify({
        residence_name: 'Smart Residence',
        location: 'Silicon Valley, CA',
        global_comfort_min: 19.0,
        global_comfort_max: 27.0,
        eco_setback_offset: 4.0,
        energy_tariff_mode: 'PEAK_EVENING',
        default_conflict_resolution: 'AVERAGE'
      })
    }
  });

  const roomFrame = await prisma.knowledgeFrame.create({
    data: {
      frameType: 'ROOM_FRAME',
      parentFrameId: homeFrame.id,
      name: 'ROOM_FRAME (Living Room Specification)',
      description: 'Intermediate frame inheriting from HOME_FRAME. Adds room physical profile, installed IoT sensors, and default thermal characteristics.',
      slotsJson: JSON.stringify({
        room_id: livingRoom.id,
        room_name: 'Living Room',
        floor: 1,
        volume_m3: 65,
        insulation_rating: 'MODERATE',
        installed_actuators: ['Smart AC', 'Smart Heater', 'Smart Fan'],
        installed_sensors: ['Temperature Sensor', 'Humidity Sensor', 'Occupancy Sensor'],
        base_target_temp: 24.0
      })
    }
  });

  const situationFrame = await prisma.knowledgeFrame.create({
    data: {
      frameType: 'CLIMATE_SITUATION_FRAME',
      parentFrameId: roomFrame.id,
      name: 'CLIMATE_SITUATION_FRAME (Current Real-Time Context)',
      description: 'Leaf frame instantiating live situational knowledge: sensor telemetry, active occupants, preference delta, fired rules, and resultant actuation state.',
      slotsJson: JSON.stringify({
        timestamp: '08:00 PM',
        room: 'Living Room',
        indoor_temperature: 32.0,
        indoor_humidity: 68.0,
        outdoor_weather: 'Hot / Sunny',
        occupancy_count: 2,
        day_night_status: 'Night',
        user_preferences: {
          'House Owner': 24.0,
          'Family Member': 28.0
        },
        detected_conflict: true,
        preference_delta: 4.0,
        resolution_strategy: 'AVERAGE',
        resolved_target_temp: 26.0,
        climate_requirement: 'COOLING',
        device_action: {
          ac: 'ON (Cooling)',
          heater: 'OFF',
          fan: 'MEDIUM'
        },
        confidence_score: 94.0
      })
    }
  });

  // Populate Frame Slots for situationFrame
  const slotsData = [
    { slotName: 'Time', slotValue: '08:00 PM', valueType: 'string', isInherited: false },
    { slotName: 'Weather', slotValue: 'Hot / Sunny', valueType: 'string', isInherited: false },
    { slotName: 'Indoor Temperature', slotValue: '32°C', valueType: 'number', isInherited: false },
    { slotName: 'Humidity', slotValue: '68%', valueType: 'number', isInherited: false },
    { slotName: 'Room', slotValue: 'Living Room', valueType: 'string', isInherited: true, sourceFrame: 'ROOM_FRAME' },
    { slotName: 'Occupancy', slotValue: '2 people', valueType: 'number', isInherited: false },
    { slotName: 'Day/Night', slotValue: 'Night', valueType: 'string', isInherited: false },
    { slotName: 'User Preferences', slotValue: 'House Owner: 24°C | Family Member: 28°C', valueType: 'json', isInherited: false },
    { slotName: 'Preferred Target', slotValue: '26°C (Compromise)', valueType: 'number', isInherited: false },
    { slotName: 'Climate Requirement', slotValue: 'COOLING', valueType: 'string', isInherited: false },
    { slotName: 'Device State', slotValue: 'AC: ON (High), Heater: OFF, Fan: MED', valueType: 'string', isInherited: false }
  ];

  for (const slot of slotsData) {
    await prisma.frameSlot.create({
      data: {
        frameId: situationFrame.id,
        ...slot
      }
    });
  }

  // 7. Create Decision Rules
  const rules = [
    {
      ruleCode: 'RULE_ECO_EMPTY',
      name: 'Empty Room Eco Inactivity Rule',
      description: 'IF room occupancy is 0 THEN switch climate mode to ECO setback to conserve energy.',
      conditionLogic: 'occupancy === 0',
      actionLogic: 'setMode("ECO"); setAc("OFF"); setHeater("OFF");',
      priority: 1
    },
    {
      ruleCode: 'RULE_EXTREME_HEAT',
      name: 'High Thermal Demand Rule (Cooling)',
      description: 'IF temperature >= 28°C AND occupancy > 0 THEN activate COOLING mode and turn AC ON.',
      conditionLogic: 'temperature >= 28 && occupancy > 0',
      actionLogic: 'setMode("COOLING"); setAc("ON"); setHeater("OFF");',
      priority: 2
    },
    {
      ruleCode: 'RULE_EXTREME_COLD',
      name: 'Low Thermal Demand Rule (Heating)',
      description: 'IF temperature <= 18°C AND occupancy > 0 THEN activate HEATING mode and turn Heater ON.',
      conditionLogic: 'temperature <= 18 && occupancy > 0',
      actionLogic: 'setMode("HEATING"); setHeater("ON"); setAc("OFF");',
      priority: 2
    },
    {
      ruleCode: 'RULE_COMFORT_ZONE',
      name: 'Ambient Comfort Equilibrium Rule',
      description: 'IF temperature BETWEEN 18.1°C AND 27.9°C AND occupancy > 0 THEN maintain COMFORT mode (HVAC idle).',
      conditionLogic: 'temperature > 18 && temperature < 28 && occupancy > 0',
      actionLogic: 'setMode("COMFORT"); setAc("OFF"); setHeater("OFF");',
      priority: 3
    },
    {
      ruleCode: 'RULE_NIGHT_SLEEP',
      name: 'Night Circadian Thermoregulation Rule',
      description: 'IF time is night (>= 22:00 or <= 06:00) AND occupancy > 0 THEN adjust cooling target downwards by -1.5°C.',
      conditionLogic: 'isNight === true && occupancy > 0',
      actionLogic: 'adjustTargetTemp(-1.5);',
      priority: 4
    },
    {
      ruleCode: 'RULE_HIGH_HUMIDITY',
      name: 'Latent Heat Moisture Compensation Rule',
      description: 'IF humidity >= 70% AND temperature >= 26°C THEN enforce active dehumidifying airflow.',
      conditionLogic: 'humidity >= 70 && temperature >= 26',
      actionLogic: 'setFan("HIGH"); boostCoolingCycle();',
      priority: 4
    },
    {
      ruleCode: 'RULE_RAINY_OUTDOOR',
      name: 'Exterior Rain Dampening Threshold Rule',
      description: 'IF outdoor weather is Rainy THEN increase cooling threshold by 1°C due to natural evaporative cooling.',
      conditionLogic: 'weather === "Rainy"',
      actionLogic: 'adjustCoolingThreshold(+1.0);',
      priority: 5
    }
  ];

  for (const rule of rules) {
    await prisma.decisionRule.create({ data: rule });
  }

  // 8. Create System Settings
  const settings = [
    { key: 'coolingThreshold', value: '28.0', description: 'Indoor temperature (°C) that triggers active cooling' },
    { key: 'heatingThreshold', value: '18.0', description: 'Indoor temperature (°C) that triggers active heating' },
    { key: 'ecoComfortOffset', value: '3.5', description: 'Energy saving setback temperature offset for empty rooms' },
    { key: 'defaultConflictStrategy', value: 'AVERAGE', description: 'Default resolution algorithm: AVERAGE, PRIORITY, MAJORITY, ROOM_BASED, MANUAL' },
    { key: 'aiAutomationActive', value: 'true', description: 'Autonomous continuous AI climate orchestration loop' },
    { key: 'conflictThresholdDelta', value: '1.5', description: 'Temperature difference (°C) between users that triggers conflict' }
  ];

  for (const s of settings) {
    await prisma.systemSetting.create({ data: s });
  }

  // 9. Create Sample Initial AI Decision and Conflict Event for History
  const initialDecision = await prisma.aIDecision.create({
    data: {
      roomId: livingRoom.id,
      timestamp: new Date(),
      contextSnapshot: JSON.stringify({
        temperature: 32.0,
        humidity: 68.0,
        occupancy: 2,
        weather: 'Hot / Sunny',
        timeOfDay: '08:00 PM',
        usersPresent: ['House Owner (24°C)', 'Family Member (28°C)']
      }),
      frameSnapshot: JSON.stringify({
        frame: 'ROOM_CLIMATE_SITUATION',
        slots: {
          Time: '08:00 PM',
          Weather: 'Hot / Sunny',
          IndoorTemp: 32.0,
          Humidity: 68.0,
          Occupancy: 2,
          Preferences: { 'House Owner': 24.0, 'Family Member': 28.0 }
        }
      }),
      rulesFired: JSON.stringify(['RULE_EXTREME_HEAT', 'RULE_NIGHT_SLEEP']),
      decisionMode: 'COOLING',
      targetTemp: 26.0,
      acAction: 'ON',
      heaterAction: 'OFF',
      fanAction: 'MEDIUM',
      confidenceScore: 94.0,
      explanation: 'Current indoor temperature is 32.0°C which exceeds cooling threshold of 28.0°C with 2 occupants present. Therefore, active Cooling is required. House Owner preferred 24.0°C while Family Member preferred 28.0°C (4.0°C delta). AI detected preference conflict and applied the Compromise/Average strategy, establishing a balanced target of 26.0°C. Smart AC actuated to ON.',
      hadConflict: true,
      conflictResolutionStrategy: 'AVERAGE'
    }
  });

  await prisma.conflictEvent.create({
    data: {
      decisionId: initialDecision.id,
      roomId: livingRoom.id,
      timestamp: new Date(),
      usersInvolved: JSON.stringify(['House Owner', 'Family Member']),
      preferencesSnapshot: JSON.stringify([
        { user: 'House Owner', preferredTemp: 24.0, priority: 'HIGH', weight: 2.0 },
        { user: 'Family Member', preferredTemp: 28.0, priority: 'NORMAL', weight: 1.0 }
      ]),
      strategyUsed: 'AVERAGE',
      resolvedTargetTemp: 26.0
    }
  });

  await prisma.deviceAction.create({
    data: {
      decisionId: initialDecision.id,
      deviceId: acDevice.id,
      previousState: 'OFF',
      newState: 'COOLING',
      triggeredBy: 'AI_DECISION'
    }
  });

  // 10. Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Thermal Threshold Exceeded',
        message: 'Living Room reached 32°C. AI initiated cooling routine.',
        type: 'WARNING'
      },
      {
        title: 'Preference Conflict Resolved',
        message: 'Conflict between House Owner (24°C) and Family Member (28°C) resolved to 26°C via Compromise strategy.',
        type: 'INFO'
      },
      {
        title: 'IoT Actuator Synced',
        message: 'Living Room Smart AC switched ON to Target 26.0°C with AI Confidence 94%.',
        type: 'SUCCESS'
      }
    ]
  });

  console.log('✅ SmartHome AI Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
