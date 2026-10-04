import React, { useState, useEffect } from 'react';
import {
  Radio,
  Power,
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Wind,
  Thermometer,
  ShieldCheck
} from 'lucide-react';
import { deviceService } from '../services/api';
import { Device } from '../types';
import { useToast } from '../context/ToastContext';

export const DevicesPage: React.FC = () => {
  const { showToast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [overrideModalDev, setOverrideModalDev] = useState<Device | null>(null);
  const [overrideState, setOverrideState] = useState<string>('COOLING');
  const [overrideTemp, setOverrideTemp] = useState<number>(24.0);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const res = await deviceService.getAll();
      setDevices(res.devices || []);
    } catch (err) {
      showToast('Error', 'Failed to fetch IoT devices', 'ALERT');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleToggleOnline = async (id: string) => {
    try {
      await deviceService.toggleStatus(id);
      showToast('Status Updated', 'Device connectivity state toggled', 'INFO');
      await loadDevices();
    } catch (err) {
      showToast('Action Failed', 'Cannot toggle status', 'ALERT');
    }
  };

  const handleReleaseOverride = async (id: string) => {
    try {
      await deviceService.releaseOverride(id);
      showToast('Override Released', 'Device returned to AI autonomous regulation', 'SUCCESS');
      await loadDevices();
    } catch (err) {
      showToast('Action Failed', 'Cannot release override', 'ALERT');
    }
  };

  const handleApplyOverride = async () => {
    if (!overrideModalDev) return;
    try {
      await deviceService.setOverride(overrideModalDev.id, overrideState, overrideTemp);
      showToast('Manual Override Engaged', `Forced state to '${overrideState}' at ${overrideTemp}°C. AI lock disengaged.`, 'WARNING');
      setOverrideModalDev(null);
      await loadDevices();
    } catch (err) {
      showToast('Override Failed', 'Could not apply override', 'ALERT');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Radio className="w-4 h-4" />
            <span>Hardware Abstraction Layer</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">IoT Device Simulator</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Virtual physical actuators and sensors executing autonomous AI commands with manual override safety protocols.
          </p>
        </div>

        <button
          onClick={loadDevices}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:border-slate-500"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Actuators</span>
        </button>
      </div>

      {/* Device Rack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {devices.map((dev) => {
          const isOnline = dev.status === 'ONLINE';
          const isCooling = dev.state === 'COOLING';
          const isHeating = dev.state === 'HEATING';
          const isEco = dev.state === 'ECO';
          const isOff = dev.state === 'OFF';

          return (
            <div
              key={dev.id}
              className={`glass-panel rounded-2xl p-5 border transition-all ${
                dev.isManualOverride
                  ? 'border-amber-500/50 shadow-glow-amber/20 ring-1 ring-amber-500/30'
                  : isCooling
                  ? 'border-cyan-500/40 shadow-glow-cyan/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isCooling
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : isHeating
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <Cpu className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{dev.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Zone: {dev.room?.name || 'Living Room'} • Type: {dev.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleOnline(dev.id)}
                  className={`p-1.5 rounded-lg border text-[10px] font-mono transition-colors ${
                    isOnline
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                  }`}
                  title={isOnline ? 'Disconnect Device' : 'Connect Device'}
                >
                  {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* State and Reading */}
              <div className="grid grid-cols-2 gap-2 my-3 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">State</span>
                  <span className={`text-xs font-bold block mt-0.5 ${
                    isCooling
                      ? 'text-cyan-300'
                      : isHeating
                      ? 'text-amber-300'
                      : isEco
                      ? 'text-emerald-300'
                      : 'text-slate-400'
                  }`}>
                    {dev.state}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Target / Value</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {dev.targetTemp ? `${dev.targetTemp}°C` : `${dev.currentReading}`}
                  </span>
                </div>
              </div>

              {/* AI vs Manual Override Status Banner */}
              <div className="mb-4">
                {dev.isManualOverride ? (
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-[11px] font-mono text-amber-300">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      AI Overridden by User
                    </span>
                    <button
                      onClick={() => handleReleaseOverride(dev.id)}
                      className="underline text-[10px] hover:text-white"
                    >
                      Release
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AI Autonomous Supervision Active</span>
                  </div>
                )}
              </div>

              {/* Override Trigger Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    setOverrideModalDev(dev);
                    setOverrideTemp(dev.targetTemp || 24.0);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Manual Override</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Override Dialog */}
      {overrideModalDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Manual Override Protocol
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Disengages autonomous AI regulation for <strong>{overrideModalDev.name}</strong> until manually released.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Forced State</label>
                <select
                  value={overrideState}
                  onChange={(e) => setOverrideState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                >
                  <option value="COOLING">Cooling</option>
                  <option value="HEATING">Heating</option>
                  <option value="ECO">Eco Mode</option>
                  <option value="COMFORT">Comfort (Idle)</option>
                  <option value="OFF">Turn Off</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Temperature: <span className="text-cyan-400 font-mono font-bold">{overrideTemp}°C</span>
                </label>
                <input
                  type="range"
                  min="16"
                  max="30"
                  step="0.5"
                  value={overrideTemp}
                  onChange={(e) => setOverrideTemp(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  onClick={() => setOverrideModalDev(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyOverride}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-glow-amber"
                >
                  Confirm Manual Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
