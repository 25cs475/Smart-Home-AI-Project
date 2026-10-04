import axios from 'axios';
import {
  User,
  DashboardData,
  Room,
  Device,
  UserPreference,
  KnowledgeFrameView,
  AIDecisionRecord,
  ConflictEventItem,
  NotificationItem,
  SystemSettingItem,
  EnergyAnalyticsData
} from '../types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smarthome_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Services
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<{ message: string; token: string; user: User }>('/auth/login', credentials);
    return res.data;
  },
  register: async (data: { email: string; password: string; name: string; role?: string }) => {
    const res = await apiClient.post<{ message: string; token: string; user: User }>('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data;
  }
};

export const dashboardService = {
  getOverview: async () => {
    const res = await apiClient.get<DashboardData>('/dashboard');
    return res.data;
  }
};

export const roomService = {
  getAll: async () => {
    const res = await apiClient.get<{ rooms: Room[] }>('/rooms');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ room: Room }>(`/rooms/${id}`);
    return res.data;
  },
  create: async (data: Partial<Room>) => {
    const res = await apiClient.post<{ room: Room }>('/rooms', data);
    return res.data;
  },
  updateEnvironment: async (id: string, env: {
    currentTemp?: number;
    currentHumidity?: number;
    currentOccupancy?: number;
    weather?: string;
    timeOfDay?: string;
    isNight?: boolean;
  }) => {
    const res = await apiClient.put<{ room: Room }>(`/rooms/${id}/environment`, env);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/rooms/${id}`);
    return res.data;
  }
};

export const deviceService = {
  getAll: async () => {
    const res = await apiClient.get<{ devices: Device[] }>('/devices');
    return res.data;
  },
  setOverride: async (id: string, state: string, targetTemp?: number) => {
    const res = await apiClient.put<{ message: string; device: Device }>(`/devices/${id}/override`, { state, targetTemp });
    return res.data;
  },
  releaseOverride: async (id: string) => {
    const res = await apiClient.put<{ message: string; device: Device }>(`/devices/${id}/release-override`);
    return res.data;
  },
  toggleStatus: async (id: string) => {
    const res = await apiClient.put<{ device: Device }>(`/devices/${id}/status`);
    return res.data;
  }
};

export const preferenceService = {
  getAll: async () => {
    const res = await apiClient.get<{ preferences: UserPreference[] }>('/preferences');
    return res.data;
  },
  create: async (data: Partial<UserPreference>) => {
    const res = await apiClient.post<{ preference: UserPreference }>('/preferences', data);
    return res.data;
  },
  update: async (id: string, data: Partial<UserPreference>) => {
    const res = await apiClient.put<{ preference: UserPreference }>(`/preferences/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/preferences/${id}`);
    return res.data;
  }
};

export const aiService = {
  analyze: async (payload: { roomId?: string; strategy?: string; manualTargetOverride?: number }) => {
    const res = await apiClient.post<{ result: any }>('/ai/analyze', payload);
    return res.data;
  },
  getCurrentFrame: async () => {
    const res = await apiClient.get<{ situationFrame: KnowledgeFrameView }>('/ai/frames/current');
    return res.data;
  },
  getFrameHierarchy: async () => {
    const res = await apiClient.get<{ hierarchy: any }>('/ai/frames/hierarchy');
    return res.data;
  },
  getDecisions: async (params?: { mode?: string; hadConflict?: boolean }) => {
    const res = await apiClient.get<{ decisions: AIDecisionRecord[] }>('/ai/decisions', { params });
    return res.data;
  },
  getRules: async () => {
    const res = await apiClient.get<{ rules: any[] }>('/ai/rules');
    return res.data;
  }
};

export const conflictService = {
  getHistory: async () => {
    const res = await apiClient.get<{ conflicts: ConflictEventItem[] }>('/conflicts');
    return res.data;
  },
  preview: async (payload?: { preferences?: any[]; manualTargetOverride?: number; roomId?: string }) => {
    const res = await apiClient.post<{ preview: any[] }>('/conflicts/preview', payload || {});
    return res.data;
  },
  resolve: async (payload: { strategy: string; preferences: any[]; manualTargetOverride?: number; roomId?: string }) => {
    const res = await apiClient.post<{ result: any }>('/conflicts/resolve', payload);
    return res.data;
  }
};

export const analyticsService = {
  getEnergy: async () => {
    const res = await apiClient.get<EnergyAnalyticsData>('/analytics/energy');
    return res.data;
  }
};

export const simulationService = {
  triggerScenario: async (scenarioId: number) => {
    const res = await apiClient.post<{ message: string; scenarioId: number; scenarioName: string; expectedOutcome: string; aiResult: any }>(`/simulation/scenario/${scenarioId}`);
    return res.data;
  },
  resetSimulation: async () => {
    const res = await apiClient.post<{ message: string; aiResult: any }>('/simulation/reset');
    return res.data;
  }
};

export const settingsService = {
  getSettings: async () => {
    const res = await apiClient.get<{ settings: SystemSettingItem[] }>('/settings');
    return res.data;
  },
  updateSettings: async (settings: Array<{ key: string; value: string }>) => {
    const res = await apiClient.post<{ message: string; settings: SystemSettingItem[] }>('/settings', { settings });
    return res.data;
  }
};

export const notificationService = {
  getAll: async () => {
    const res = await apiClient.get<{ notifications: NotificationItem[] }>('/notifications');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },
  clearAll: async () => {
    const res = await apiClient.delete('/notifications/clear');
    return res.data;
  }
};
