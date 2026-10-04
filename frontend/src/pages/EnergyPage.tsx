import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingDown,
  Clock,
  DollarSign,
  Leaf,
  ShieldAlert,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { analyticsService } from '../services/api';
import { EnergyAnalyticsData } from '../types';

export const EnergyPage: React.FC = () => {
  const [data, setData] = useState<EnergyAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getEnergy();
        setData(res);
      } catch (err) {
        console.error('Failed to load energy telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const sum = data?.summary;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Thermodynamic Optimization</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Energy Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time power conservation modeling, HVAC duty cycles, and AI occupancy setback efficiency savings.
          </p>
        </div>

        {/* Academic Simulation Disclaimer Banner */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Simulated & Estimated Data Model</span>
        </div>
      </div>

      {/* 4 Metric Summary Cards (Section 21) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Daily Consumption</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {sum?.totalDailyKwh || 13.7} <span className="text-sm font-normal text-slate-400">kWh</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-1">
            Baseline: {sum?.baselineUnoptimizedKwh || 18.7} kWh
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Energy Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            {sum?.energySavingsPercentage || 26.7}%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">
            -{sum?.dailyEnergySavingsKwh || 5.0} kWh conserved daily
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Estimated Cost Savings</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-400">
            ${sum?.dailyCostSavingsUsd || 1.45} <span className="text-xs font-normal text-slate-400">/day</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            ≈ ${(parseFloat((sum?.dailyCostSavingsUsd || 1.45) as any) * 30).toFixed(1)} / month
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">HVAC Runtime</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-violet-300">
            {sum?.hvacRuntimeHours || 6.8} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">
            Eco Inactivity: {sum?.ecoRuntimeHours || 11.2} hrs
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Consumption: Baseline vs AI Optimized */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Hourly Energy Demand (Baseline vs AI Optimized)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Continuous power consumption comparison across 24h</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Baseline
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> AI Optimized
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.hourlyConsumption || []}>
                <defs>
                  <linearGradient id="aiOptimizedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 3]} unit=" kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: 12, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="baselineKwh" stroke="#64748B" strokeWidth={1.5} fillOpacity={0.1} fill="#64748B" />
                <Area type="monotone" dataKey="optimizedKwh" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#aiOptimizedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly HVAC vs Eco Hours */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                Weekly Duty Cycle (HVAC Runtime vs Eco Setback)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Hours per day active cooling/heating vs energy saving</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklyUsage || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 24]} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="hvacHours" fill="#06B6D4" radius={[4, 4, 0, 0]} name="HVAC Active Hours" />
                <Bar dataKey="ecoHours" fill="#10B981" radius={[4, 4, 0, 0]} name="Eco Inactivity Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
