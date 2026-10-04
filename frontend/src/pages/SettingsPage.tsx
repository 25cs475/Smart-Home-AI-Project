import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Sliders,
  Scale,
  Zap,
  Shield,
  CheckCircle2,
  Users
} from 'lucide-react';
import { settingsService, simulationService } from '../services/api';
import { SystemSettingItem } from '../types';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SystemSettingItem[]>([]);
  const [coolingThresh, setCoolingThresh] = useState<string>('28.0');
  const [heatingThresh, setHeatingThresh] = useState<string>('18.0');
  const [ecoOffset, setEcoOffset] = useState<string>('3.5');
  const [defaultStrategy, setDefaultStrategy] = useState<string>('AVERAGE');
  const [aiAutomation, setAiAutomation] = useState<string>('true');
  const [saving, setSaving] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  const loadSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      const s = res.settings || [];
      setSettings(s);
      const map = Object.fromEntries(s.map((item) => [item.key, item.value]));
      if (map.coolingThreshold) setCoolingThresh(map.coolingThreshold);
      if (map.heatingThreshold) setHeatingThresh(map.heatingThreshold);
      if (map.ecoComfortOffset) setEcoOffset(map.ecoComfortOffset);
      if (map.defaultConflictStrategy) setDefaultStrategy(map.defaultConflictStrategy);
      if (map.aiAutomationActive) setAiAutomation(map.aiAutomationActive);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings([
        { key: 'coolingThreshold', value: coolingThresh },
        { key: 'heatingThreshold', value: heatingThresh },
        { key: 'ecoComfortOffset', value: ecoOffset },
        { key: 'defaultConflictStrategy', value: defaultStrategy },
        { key: 'aiAutomationActive', value: aiAutomation }
      ]);
      showToast('Settings Saved', 'System thermal thresholds and conflict policies updated', 'SUCCESS');
    } catch (err) {
      showToast('Save Failed', 'Could not persist settings', 'ALERT');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Restore default benchmark state (32°C, 2 occupants, 8 PM, 24°C/28°C preferences)?')) {
      try {
        setResetting(true);
        await simulationService.resetSimulation();
        showToast('Simulation Benchmark Restored', 'Environment and devices reset to default baseline', 'SUCCESS');
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        showToast('Reset Failed', 'Unable to reset benchmark', 'ALERT');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Control Parameters</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">System Settings & Admin</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global inference thresholds, default conflict resolution strategies, and system reset protocols.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:border-slate-500"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Reset Simulation Benchmark</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Temperature Thresholds */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-amber-400" />
            Thermodynamic Activation Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Cooling Threshold: {coolingThresh}°C
              </label>
              <input
                type="number"
                step="0.5"
                min="24"
                max="34"
                value={coolingThresh}
                onChange={(e) => setCoolingThresh(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-cyan-300"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Indoor temp trigger for active AC cooling
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Heating Threshold: {heatingThresh}°C
              </label>
              <input
                type="number"
                step="0.5"
                min="14"
                max="22"
                value={heatingThresh}
                onChange={(e) => setHeatingThresh(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-amber-300"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Indoor temp trigger for active Heater
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Eco Setback Offset: {ecoOffset}°C
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="8"
                value={ecoOffset}
                onChange={(e) => setEcoOffset(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-emerald-300"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Thermal setback applied to empty rooms
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Default Conflict Strategy */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Scale className="w-4 h-4 text-violet-400" />
            Default Multi-User Conflict Strategy
          </h3>

          <div className="space-y-3">
            {[
              { id: 'AVERAGE', name: 'Average (Compromise)', desc: 'Calculates arithmetic mean across all active occupants.' },
              { id: 'PRIORITY', name: 'Priority-Weighted', desc: 'Weights preferences based on user administrative privileges.' },
              { id: 'MAJORITY', name: 'Majority Consensus', desc: 'Clusters preferences to select the modal consensus target.' },
              { id: 'ROOM_BASED', name: 'Room-Based Anchor', desc: 'Respects primary room resident preference.' },
              { id: 'MANUAL', name: 'Manual Override', desc: 'Direct owner designated override selection.' }
            ].map((st) => (
              <label
                key={st.id}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  defaultStrategy === st.id
                    ? 'bg-slate-900 border-cyan-500/50 shadow-glow-cyan/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="defaultConflictStrategy"
                  value={st.id}
                  checked={defaultStrategy === st.id}
                  onChange={(e) => setDefaultStrategy(e.target.value)}
                  className="mt-1 accent-cyan-500"
                />
                <div>
                  <div className="text-xs font-bold text-white font-mono">{st.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{st.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 3: AI Loop Automation */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Autonomous Continuous AI Regulation Loop
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Allows the AI agent to continuously sense, infer rules, and actuate IoT actuators without requiring manual button triggers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAiAutomation(aiAutomation === 'true' ? 'false' : 'true')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              aiAutomation === 'true'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-cyan'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {aiAutomation === 'true' ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-glow-cyan transition-all flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4 fill-black" />
          <span>{saving ? 'Saving System Parameters...' : 'SAVE SYSTEM CONFIGURATION'}</span>
        </button>
      </form>
    </div>
  );
};
