import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Thermometer,
  Droplets,
  Users,
  SunMedium,
  Wind,
  ShieldCheck,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Home,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { dashboardService, aiService, simulationService } from '../services/api';
import { DashboardData } from '../types';
import { ReasoningPipeline } from '../components/ReasoningPipeline';
import { ExplainableCard } from '../components/ExplainableCard';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      showToast('Connection Warning', 'Unable to fetch real-time dashboard data', 'WARNING');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRunAi = async () => {
    try {
      setIsAnalyzing(true);
      const res = await aiService.analyze({ roomId: data?.currentConditions.primaryRoomId });
      setLatestAnalysis(res.result);
      showToast('AI Analysis Complete', `Mode: ${res.result.primaryMode} | Target: ${res.result.targetTemp}°C`, 'SUCCESS');
      await loadDashboard();
    } catch (err) {
      showToast('Analysis Error', 'Failed to execute AI reasoning cycle', 'ALERT');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-cyan-400">Loading SmartHome AI telemetry...</p>
        </div>
      </div>
    );
  }

  const cond = data?.currentConditions;
  const sys = data?.system;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Section (Section 7) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{sys?.status || 'System Online'}</span>
            <span>•</span>
            <span>{sys?.activeAiMode || 'Autonomous AI Agent'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Smart Home Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {sys?.homeStatus || 'Optimal Climate Regulation'} • {sys?.currentTime || '08:00 PM'} • {sys?.currentDate || 'Today'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/environment')}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-200 transition-all"
          >
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <span>Sensor Sliders</span>
          </button>

          <button
            onClick={handleRunAi}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-glow-cyan transition-all transform active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'REASONING...' : 'RUN AI ANALYSIS'}</span>
          </button>
        </div>
      </div>

      {/* 6 Key Telemetry Dashboard Cards (Section 7) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Temperature */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {cond?.temperature?.toFixed(1) || '32.0'}°C
          </div>
          <div className="text-[10px] text-amber-400 font-mono mt-1">
            Target: {cond?.targetTemperature?.toFixed(1) || '26.0'}°C
          </div>
        </div>

        {/* Card 2: Humidity */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {cond?.humidity?.toFixed(0) || '68'}%
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-1">
            Comfort: 40% - 60%
          </div>
        </div>

        {/* Card 3: Occupancy */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-violet-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Occupancy</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {cond?.occupancy || 2} <span className="text-xs font-normal text-slate-400">people</span>
          </div>
          <div className="text-[10px] text-violet-400 font-mono mt-1">
            Zone: {cond?.primaryRoomName || 'Living Room'}
          </div>
        </div>

        {/* Card 4: Weather */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Weather</span>
            <SunMedium className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-lg font-mono font-bold text-white truncate">
            {cond?.weather || 'Hot / Sunny'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Exterior Sensor Active
          </div>
        </div>

        {/* Card 5: HVAC Status */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-cyan-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">HVAC Mode</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-mono font-bold text-cyan-300 truncate">
            {cond?.hvacStatus || 'Cooling Active'}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Compressor Engaged
          </div>
        </div>

        {/* Card 6: AI Confidence */}
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-cyan-950/20 shadow-glow-cyan/10">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold">AI Confidence</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-cyan-300">
            {cond?.aiConfidence || 94}%
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-1 leading-tight">
            Deterministic Factor Metric
          </div>
        </div>
      </div>

      {/* 7-Step Reasoning Pipeline Animated Display */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <ReasoningPipeline
          steps={latestAnalysis?.steps}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Dynamic Explainability Breakdown */}
      <ExplainableCard
        explanation={latestAnalysis?.explanation || (data?.recentDecision ? {
          title: 'Why Did AI Make This Decision?',
          contextSummary: `Observed ${cond?.temperature}°C indoor with ${cond?.occupancy} occupants in Living Room.`,
          thermalRationale: `Indoor temperature exceeds the cooling threshold (28.0°C). Active cooling required.`,
          conflictRationale: `Preferences divergent (24°C vs 28°C). Resolved via Average Compromise to 26.0°C.`,
          finalDecision: `FINAL DECISION: AC ON | Target 26.0°C | Mode COOLING | Confidence ${cond?.aiConfidence}%.`
        } : undefined)}
        confidenceScore={cond?.aiConfidence}
        primaryMode={latestAnalysis?.primaryMode || 'COOLING'}
        hadConflict={latestAnalysis?.conflictResolution?.hasConflict ?? true}
      />

      {/* Quick Room Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Home className="w-4 h-4 text-cyan-400" />
            Residential Climate Zones
          </h2>
          <button
            onClick={() => navigate('/rooms')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>Manage All Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.rooms.map((room) => {
            const hasAcOn = room.devices?.some(d => d.type === 'AC' && d.state === 'COOLING');
            const hasHeaterOn = room.devices?.some(d => d.type === 'HEATER' && d.state === 'HEATING');

            return (
              <div
                key={room.id}
                onClick={() => navigate('/rooms')}
                className="p-4 rounded-2xl glass-panel-interactive cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{room.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    hasAcOn
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : hasHeaterOn
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {hasAcOn ? 'Cooling' : hasHeaterOn ? 'Heating' : 'Eco / Idle'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono my-3 py-2 border-y border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Temp</span>
                    <span className="font-bold text-slate-200">{room.currentTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Humidity</span>
                    <span className="font-bold text-slate-200">{room.currentHumidity}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Occupancy</span>
                    <span className="font-bold text-slate-200">{room.currentOccupancy}p</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{room.devices?.length || 0} IoT Devices</span>
                  <span className="text-cyan-400 hover:text-cyan-300 flex items-center">
                    Inspect <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
