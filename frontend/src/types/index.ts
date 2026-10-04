export type UserRole = 'ADMIN' | 'HOME_OWNER' | 'HOUSEHOLD_MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Device {
  id: string;
  roomId: string;
  name: string;
  type: 'AC' | 'HEATER' | 'THERMOSTAT' | 'FAN' | 'TEMP_SENSOR' | 'HUMIDITY_SENSOR' | 'OCCUPANCY_SENSOR';
  status: 'ONLINE' | 'OFFLINE';
  state: 'COOLING' | 'HEATING' | 'ECO' | 'COMFORT' | 'OFF';
  currentReading: number;
  targetTemp: number;
  isManualOverride: boolean;
  lastUpdated?: string;
  room?: {
    id: string;
    name: string;
  };
}

export interface UserPreference {
  id: string;
  userId: string;
  roomId?: string | null;
  preferredTemp: number;
  climatePreference: 'COOL' | 'WARM' | 'NEUTRAL';
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  priorityWeight: number;
  activeStartHour: number;
  activeEndHour: number;
  user?: User;
  room?: {
    id: string;
    name: string;
  };
}

export interface Room {
  id: string;
  name: string;
  floor: number;
  roomType: string;
  defaultTemp: number;
  currentTemp: number;
  currentHumidity: number;
  currentOccupancy: number;
  weather: string;
  timeOfDay: string;
  isNight: boolean;
  devices?: Device[];
  preferences?: UserPreference[];
}

export interface DashboardData {
  system: {
    status: string;
    currentTime: string;
    currentDate: string;
    homeStatus: string;
    activeAiMode: string;
    totalRooms: number;
    totalDevices: number;
    onlineDevices: number;
  };
  currentConditions: {
    primaryRoomId: string;
    primaryRoomName: string;
    temperature: number;
    humidity: number;
    occupancy: number;
    weather: string;
    hvacStatus: string;
    aiConfidence: number;
    targetTemperature: number;
  };
  rooms: Room[];
  recentDecision?: AIDecisionRecord;
  recentNotifications: NotificationItem[];
  metrics: {
    totalConflictsResolved: number;
    estimatedDailyKwh: number;
    energySavingsPercent: number;
  };
}

export interface ReasoningStep {
  stepNumber: number;
  title: string;
  stage: 'COLLECT_CONTEXT' | 'BUILD_FRAME' | 'EVALUATE_RULES' | 'DETECT_CONFLICT' | 'RESOLVE_CONFLICT' | 'DETERMINE_ACTION' | 'UPDATE_IOT';
  description: string;
  data: any;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
}

export interface FrameSlotItem {
  name: string;
  value: any;
  facet?: {
    dataType: string;
    unit?: string;
    description: string;
  };
  isInherited: boolean;
  sourceFrame?: string;
}

export interface KnowledgeFrameView {
  id: string;
  name: string;
  type: string;
  parentFrame?: string | null;
  description: string;
  slots: Record<string, FrameSlotItem>;
}

export interface AIDecisionRecord {
  id: string;
  roomId: string;
  timestamp: string;
  contextSnapshot: string;
  frameSnapshot: string;
  rulesFired: string;
  decisionMode: 'COOLING' | 'HEATING' | 'COMFORT' | 'ECO';
  targetTemp: number;
  acAction: 'ON' | 'OFF';
  heaterAction: 'ON' | 'OFF';
  fanAction: 'HIGH' | 'MEDIUM' | 'LOW' | 'OFF';
  confidenceScore: number;
  explanation: string;
  hadConflict: boolean;
  conflictResolutionStrategy?: string;
  room?: {
    id: string;
    name: string;
  };
}

export interface ConflictEventItem {
  id: string;
  decisionId?: string;
  roomId: string;
  timestamp: string;
  usersInvolved: string;
  preferencesSnapshot: string;
  strategyUsed: string;
  resolvedTargetTemp: number;
  room?: {
    id: string;
    name: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS';
  isRead: boolean;
  timestamp: string;
}

export interface SystemSettingItem {
  id: string;
  key: string;
  value: string;
  description: string;
}

export interface EnergyAnalyticsData {
  meta: {
    isSimulated: boolean;
    disclaimer: string;
  };
  summary: {
    totalDailyKwh: number;
    baselineUnoptimizedKwh: number;
    dailyEnergySavingsKwh: number;
    dailyCostSavingsUsd: number;
    energySavingsPercentage: number;
    hvacRuntimeHours: number;
    ecoRuntimeHours: number;
  };
  hourlyConsumption: Array<{
    hour: string;
    baselineKwh: number;
    optimizedKwh: number;
    temp: number;
  }>;
  weeklyUsage: Array<{
    day: string;
    hvacHours: number;
    ecoHours: number;
    kwh: number;
  }>;
  modeBreakdown: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}
