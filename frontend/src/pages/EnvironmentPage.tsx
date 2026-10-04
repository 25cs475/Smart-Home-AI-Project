import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Users,
  Sun,
  Moon,
  CloudSun,
  Activity,
  Wind,
  Zap,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { roomService, aiService } from '../services/api';
import { Room } from '../types';
import { EnvironmentControls } from '../components/EnvironmentControls';
import { useToast } from '../context/ToastContext';

export const EnvironmentPage: React.FC = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomService.getAll();
      setRooms(res.rooms || []);
      if (res.rooms && res.rooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(res.rooms[0].id);
      }
    } catch (err) {
      showToast('Error', 'Failed to fetch environmental rooms', 'ALERT');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const currentRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const handleApplyEnvironment = async (env: {
    temp: number;
    humidity: number;
    occupancy: number;
    weather: string;
    isNight: boolean;
  }) => {
    if (!currentRoom) return;
    try {
      setUpdating(true);
      await roomService.updateEnvironment(currentRoom.id, {
        currentTemp: env.temp,
        currentHumidity: env.humidity,
        currentOccupancy: env.occupancy,
        weather: env.weather,
        isNight: env.isNight
      });

      // Automatically trigger AI reasoning with new sensor data
      const aiRes = await aiService.analyze({ roomId: currentRoom.id });
      showToast(
        'Sensors Updated & AI Triggered',
        `New Temp: ${env.temp}°C | Inferred Mode: ${aiRes.result.primaryMode} (Target ${aiRes.result.targetTemp}°C)`,
        'SUCCESS'
      );
      await loadRooms();
    } catch (err) {
      showToast('Update Failed', 'Failed to apply simulated sensor readings', 'ALERT');
    } finally {
      setUpdating(false);
    }
  };

  // Telemetry graph datasets
  const tempTimeSeries = [
    { time: '12:00', indoor: 26.5, outdoor: 34.0, hvacLoad: 70 },
    { time: '14:00', indoor: 28.0, outdoor: 36.2, hvacLoad: 85 },
    { time: '16:00', indoor: 29.5, outdoor: 35.8, hvacLoad: 80 },
    { time: '18:00', indoor: 31.0, outdoor: 33.1, hvacLoad: 90 },
    { time: '20:00', indoor: currentRoom?.currentTemp || 32.0, outdoor: 30.5, hvacLoad: 95 },
    { time: '22:00', indoor: 27.2, outdoor: 26.0, hvacLoad: 60 },
    { time: '00:00', indoor: 24.8, outdoor: 23.0, hvacLoad: 30 }
  ];

  const humidityTimeSeries = [
    { time: '12:00', humidity: 55, dewPoint: 16 },
    { time: '14:00', humidity: 58, dewPoint: 17 },
    { time: '16:00', humidity: 62, dewPoint: 18 },
    { time: '18:00', humidity: 65, dewPoint: 19 },
    { time: '20:00', humidity: currentRoom?.currentHumidity || 68, dewPoint: 20 },
    { time: '22:00', humidity: 60, dewPoint: 17 },
    { time: '00:00', humidity: 52, dewPoint: 15 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            <span>Telemetry & Sensor Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Environment Monitoring</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time indoor/outdoor microclimate metrics, air composition, and interactive sensor telemetry injection.
          </p>
        </div>

        {/* Room Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-mono">Target Zone:</label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.currentTemp}°C)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comprehensive Environmental Metric Gauges (Section 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Indoor Temp</span>
          <span className="text-xl font-mono font-bold text-amber-400 block mt-1">
            {currentRoom?.currentTemp?.toFixed(1) || '32.0'}°C
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Outdoor Temp</span>
          <span className="text-xl font-mono font-bold text-rose-400 block mt-1">
            33.5°C
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Humidity</span>
          <span className="text-xl font-mono font-bold text-cyan-400 block mt-1">
            {currentRoom?.currentHumidity?.toFixed(0) || '68'}%
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Weather</span>
          <span className="text-sm font-mono font-bold text-white block mt-2 truncate">
            {currentRoom?.weather || 'Hot / Sunny'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Air Quality (AQI)</span>
          <span className="text-xl font-mono font-bold text-emerald-400 block mt-1">
            28 <span className="text-[10px] font-normal text-slate-400">Good</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Occupancy</span>
          <span className="text-xl font-mono font-bold text-violet-400 block mt-1">
            {currentRoom?.currentOccupancy || 2} <span className="text-[10px] font-normal text-slate-400">prs</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Time</span>
          <span className="text-sm font-mono font-bold text-white block mt-2">
            {currentRoom?.timeOfDay || '08:00 PM'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block uppercase">Day / Night</span>
          <span className="text-sm font-mono font-bold text-cyan-300 block mt-2 flex items-center gap-1">
            {currentRoom?.isNight ? <Moon className="w-3.5 h-3.5 text-violet-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            {currentRoom?.isNight ? 'Night' : 'Day'}
          </span>
        </div>
      </div>

      {/* Interactive Sensor Injector Component (Section 8 controls) */}
      <EnvironmentControls
        initialTemp={currentRoom?.currentTemp || 32.0}
        initialHumidity={currentRoom?.currentHumidity || 68.0}
        initialOccupancy={currentRoom?.currentOccupancy || 2}
        initialWeather={currentRoom?.weather || 'Hot / Sunny'}
        initialIsNight={currentRoom?.isNight ?? true}
        onApplyAndAnalyze={handleApplyEnvironment}
        isLoading={updating}
      />

      {/* Graphs Grid (Section 8 Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Indoor vs Outdoor Temperature Over Time */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-400" />
                Indoor vs Outdoor Temperature Over Time
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Thermodynamic heat exchange telemetry</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Indoor
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Outdoor
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[15, 40]} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="indoor" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="outdoor" stroke="#F43F5E" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Humidity and HVAC Activity Over Time */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Humidity & Latent Moisture Curve
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Relative moisture vs saturation dew point</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Humidity %
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={humidityTimeSeries}>
                <defs>
                  <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[20, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: 12, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="humidity" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#humidityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
