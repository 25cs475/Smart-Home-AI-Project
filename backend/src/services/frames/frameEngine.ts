/**
 * Frame-Based Knowledge Representation Engine
 * Represents smart-home situational knowledge using Minsky-style Frames:
 * Frames -> Slots -> Facets/Values -> Inheritance
 */

export interface FrameFacet {
  dataType: 'number' | 'string' | 'boolean' | 'json';
  unit?: string;
  allowedValues?: string[];
  range?: [number, number];
  description: string;
}

export interface FrameSlotDefinition {
  name: string;
  value: any;
  facet: FrameFacet;
  isInherited: boolean;
  sourceFrame?: string;
}

export interface FrameStructure {
  id: string;
  name: string;
  type: 'HOME_FRAME' | 'ROOM_FRAME' | 'CLIMATE_SITUATION_FRAME';
  parentFrame?: string | null;
  description: string;
  slots: Record<string, FrameSlotDefinition>;
}

export interface ClimateContextInput {
  roomId: string;
  roomName: string;
  temperature: number;
  humidity: number;
  occupancy: number;
  weather: string;
  timeOfDay: string;
  isNight: boolean;
  userPreferences: Array<{
    userName: string;
    preferredTemp: number;
    priority: string;
    weight: number;
  }>;
}

export class FrameKnowledgeEngine {
  /**
   * Generates root HOME_FRAME representing global policies
   */
  public static getHomeFrame(): FrameStructure {
    return {
      id: 'FRAME_HOME_GLOBAL',
      name: 'HOME_FRAME',
      type: 'HOME_FRAME',
      parentFrame: null,
      description: 'Root knowledge frame encapsulating global household policies, safety thermal boundaries, and energy tariff profiles.',
      slots: {
        residence_name: {
          name: 'residence_name',
          value: 'Smart Residence',
          facet: { dataType: 'string', description: 'Identifier of the residential smart ecosystem' },
          isInherited: false
        },
        global_min_safe_temp: {
          name: 'global_min_safe_temp',
          value: 16.0,
          facet: { dataType: 'number', unit: '°C', range: [10, 20], description: 'Freeze protection minimum threshold' },
          isInherited: false
        },
        global_max_safe_temp: {
          name: 'global_max_safe_temp',
          value: 34.0,
          facet: { dataType: 'number', unit: '°C', range: [30, 40], description: 'Overheat protection maximum threshold' },
          isInherited: false
        },
        energy_conservation_policy: {
          name: 'energy_conservation_policy',
          value: 'BALANCED_COMFORT',
          facet: { dataType: 'string', allowedValues: ['ECO_MAX', 'BALANCED_COMFORT', 'COMFORT_FIRST'], description: 'Primary household energy prioritization' },
          isInherited: false
        },
        eco_setback_delta: {
          name: 'eco_setback_delta',
          value: 4.0,
          facet: { dataType: 'number', unit: '°C', description: 'Thermal setback allowed when rooms are unoccupied' },
          isInherited: false
        }
      }
    };
  }

  /**
   * Generates intermediate ROOM_FRAME inheriting from HOME_FRAME
   */
  public static getRoomFrame(roomName: string = 'Living Room'): FrameStructure {
    const home = this.getHomeFrame();
    return {
      id: `FRAME_ROOM_${roomName.toUpperCase().replace(/\s+/g, '_')}`,
      name: `ROOM_FRAME [${roomName}]`,
      type: 'ROOM_FRAME',
      parentFrame: home.id,
      description: `Intermediate room frame inheriting global comfort baselines while specifying local architectural constraints, actuators, and occupancy sensors.`,
      slots: {
        // Inherited slots
        residence_name: {
          ...home.slots.residence_name,
          isInherited: true,
          sourceFrame: 'HOME_FRAME'
        },
        global_min_safe_temp: {
          ...home.slots.global_min_safe_temp,
          isInherited: true,
          sourceFrame: 'HOME_FRAME'
        },
        global_max_safe_temp: {
          ...home.slots.global_max_safe_temp,
          isInherited: true,
          sourceFrame: 'HOME_FRAME'
        },
        // Room-specific local slots
        room_name: {
          name: 'room_name',
          value: roomName,
          facet: { dataType: 'string', description: 'Specific zone or room title' },
          isInherited: false
        },
        thermal_inertia: {
          name: 'thermal_inertia',
          value: 'MEDIUM',
          facet: { dataType: 'string', allowedValues: ['LOW', 'MEDIUM', 'HIGH'], description: 'Insulation response speed' },
          isInherited: false
        },
        installed_actuators: {
          name: 'installed_actuators',
          value: ['Smart AC', 'Smart Heater', 'Smart Thermostat', 'Smart Fan'],
          facet: { dataType: 'json', description: 'Actuators physically wired in this room' },
          isInherited: false
        },
        default_baseline_temp: {
          name: 'default_baseline_temp',
          value: 24.0,
          facet: { dataType: 'number', unit: '°C', range: [18, 28], description: 'Default thermal baseline target' },
          isInherited: false
        }
      }
    };
  }

  /**
   * Constructs the leaf CLIMATE_SITUATION_FRAME dynamically combining real-time context
   */
  public static buildSituationFrame(
    context: ClimateContextInput,
    resolvedTargetTemp: number,
    climateMode: string,
    deviceState: { ac: string; heater: string; fan: string },
    confidenceScore: number
  ): FrameStructure {
    const roomFrame = this.getRoomFrame(context.roomName);

    return {
      id: 'FRAME_CLIMATE_SITUATION_LIVE',
      name: 'CLIMATE_SITUATION_FRAME',
      type: 'CLIMATE_SITUATION_FRAME',
      parentFrame: roomFrame.id,
      description: 'Dynamic Situational Knowledge Frame. Aggregates live environmental telemetry, time, active occupants, preference disparity, and AI actuation targets.',
      slots: {
        // Inherited room identity
        room_name: {
          ...roomFrame.slots.room_name,
          value: context.roomName,
          isInherited: true,
          sourceFrame: 'ROOM_FRAME'
        },
        // Environmental Telemetry Slots
        time_of_day: {
          name: 'time_of_day',
          value: context.timeOfDay,
          facet: { dataType: 'string', description: 'Current clock time in 12h or 24h format' },
          isInherited: false
        },
        day_night_status: {
          name: 'day_night_status',
          value: context.isNight ? 'Night' : 'Day',
          facet: { dataType: 'string', allowedValues: ['Day', 'Night'], description: 'Diurnal solar status' },
          isInherited: false
        },
        weather_condition: {
          name: 'weather_condition',
          value: context.weather,
          facet: { dataType: 'string', description: 'Outdoor atmospheric condition' },
          isInherited: false
        },
        indoor_temperature: {
          name: 'indoor_temperature',
          value: context.temperature,
          facet: { dataType: 'number', unit: '°C', range: [0, 50], description: 'Calibrated ambient sensor reading' },
          isInherited: false
        },
        humidity: {
          name: 'humidity',
          value: context.humidity,
          facet: { dataType: 'number', unit: '%', range: [10, 100], description: 'Relative indoor air humidity' },
          isInherited: false
        },
        occupancy: {
          name: 'occupancy',
          value: context.occupancy,
          facet: { dataType: 'number', unit: 'people', description: 'Real-time human count detected via sensors' },
          isInherited: false
        },
        // Multi-User Knowledge Slots
        user_preferences: {
          name: 'user_preferences',
          value: context.userPreferences.map(p => `${p.userName} → ${p.preferredTemp}°C (${p.priority})`).join(', ') || 'No Active Users',
          facet: { dataType: 'string', description: 'Preferences of people physically present' },
          isInherited: false
        },
        preferred_target: {
          name: 'preferred_target',
          value: `${resolvedTargetTemp.toFixed(1)}°C`,
          facet: { dataType: 'string', unit: '°C', description: 'Synthesized optimal temperature target' },
          isInherited: false
        },
        climate_requirement: {
          name: 'climate_requirement',
          value: climateMode,
          facet: { dataType: 'string', allowedValues: ['COOLING', 'HEATING', 'COMFORT', 'ECO'], description: 'Synthesized HVAC mode demand' },
          isInherited: false
        },
        device_state: {
          name: 'device_state',
          value: `AC: ${deviceState.ac} | Heater: ${deviceState.heater} | Fan: ${deviceState.fan}`,
          facet: { dataType: 'string', description: 'Resultant physical IoT actuator operational state' },
          isInherited: false
        },
        confidence_score: {
          name: 'confidence_score',
          value: `${confidenceScore}%`,
          facet: { dataType: 'string', description: 'Deterministic certainty metric calculated from evidence completeness' },
          isInherited: false
        }
      }
    };
  }

  /**
   * Provides full inheritance hierarchy tree for UI visualizer
   */
  public static getFullHierarchy(currentSituation?: FrameStructure) {
    const home = this.getHomeFrame();
    const room = this.getRoomFrame(currentSituation?.slots.room_name?.value || 'Living Room');
    const situation = currentSituation || this.buildSituationFrame(
      {
        roomId: 'room-1',
        roomName: 'Living Room',
        temperature: 32.0,
        humidity: 68.0,
        occupancy: 2,
        weather: 'Hot / Sunny',
        timeOfDay: '08:00 PM',
        isNight: true,
        userPreferences: [
          { userName: 'House Owner', preferredTemp: 24.0, priority: 'HIGH', weight: 2.0 },
          { userName: 'Family Member', preferredTemp: 28.0, priority: 'NORMAL', weight: 1.0 }
        ]
      },
      26.0,
      'COOLING',
      { ac: 'ON', heater: 'OFF', fan: 'MEDIUM' },
      94.0
    );

    return {
      homeFrame: home,
      roomFrame: room,
      situationFrame: situation,
      inheritanceFlow: [
        { from: 'HOME_FRAME', to: 'ROOM_FRAME', inheritedSlots: ['residence_name', 'global_min_safe_temp', 'global_max_safe_temp'] },
        { from: 'ROOM_FRAME', to: 'CLIMATE_SITUATION_FRAME', inheritedSlots: ['room_name', 'installed_actuators'] }
      ]
    };
  }
}
