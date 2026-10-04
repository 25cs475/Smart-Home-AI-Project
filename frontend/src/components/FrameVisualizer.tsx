import React, { useState } from 'react';
import { KnowledgeFrameView, FrameSlotItem } from '../types';
import { Layers, Database, ArrowDown, Code2, Sparkles, Check, GitBranch } from 'lucide-react';

interface FrameVisualizerProps {
  situationFrame?: KnowledgeFrameView;
  hierarchy?: any;
}

export const FrameVisualizer: React.FC<FrameVisualizerProps> = ({ situationFrame, hierarchy }) => {
  const [viewMode, setViewMode] = useState<'SLOTS' | 'INHERITANCE' | 'JSON'>('SLOTS');

  // Fallback defaults if situationFrame is empty
  const defaultSlots: Record<string, FrameSlotItem> = {
    time_of_day: { name: 'Time', value: '08:00 PM', facet: { dataType: 'string', description: 'Clock stamp' }, isInherited: false },
    weather_condition: { name: 'Weather', value: 'Hot / Sunny', facet: { dataType: 'string', description: 'Atmospheric conditions' }, isInherited: false },
    indoor_temperature: { name: 'Indoor Temperature', value: '32°C', facet: { dataType: 'number', unit: '°C', description: 'Live sensor reading' }, isInherited: false },
    humidity: { name: 'Humidity', value: '68%', facet: { dataType: 'number', unit: '%', description: 'Relative moisture' }, isInherited: false },
    room_name: { name: 'Room', value: 'Living Room', facet: { dataType: 'string', description: 'Thermal zone' }, isInherited: true, sourceFrame: 'ROOM_FRAME' },
    occupancy: { name: 'Occupancy', value: '2 people', facet: { dataType: 'number', unit: 'people', description: 'Occupant count' }, isInherited: false },
    day_night_status: { name: 'Day/Night', value: 'Night', facet: { dataType: 'string', description: 'Solar state' }, isInherited: false },
    user_preferences: { name: 'User Preferences', value: 'House Owner → 24°C | Family Member → 28°C', facet: { dataType: 'json', description: 'Active occupant preferences' }, isInherited: false },
    preferred_target: { name: 'Preferred Target', value: '26°C (Compromise)', facet: { dataType: 'string', unit: '°C', description: 'Resolved target' }, isInherited: false },
    climate_requirement: { name: 'Climate Requirement', value: 'COOLING', facet: { dataType: 'string', description: 'Inferred HVAC mode' }, isInherited: false },
    device_state: { name: 'Device State', value: 'AC → ON | Heater → OFF', facet: { dataType: 'string', description: 'IoT actuator commands' }, isInherited: false }
  };

  const slots = situationFrame?.slots || defaultSlots;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      {/* Header with View Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30 shadow-glow-violet">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              FRAME KNOWLEDGE REPRESENTATION
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Minsky Frame Architecture
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Structured situational knowledge: Frames → Slots → Facets → Values</p>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode('SLOTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'SLOTS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Slots
          </button>
          <button
            onClick={() => setViewMode('INHERITANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'INHERITANCE' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inheritance Hierarchy
          </button>
          <button
            onClick={() => setViewMode('JSON')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'JSON' ? 'bg-slate-700/60 text-slate-200 border border-slate-600' : 'text-slate-400 hover:text-white'
            }`}
          >
            JSON Spec
          </button>
        </div>
      </div>

      {/* Mode 1: Live Slots & Values Grid */}
      {viewMode === 'SLOTS' && (
        <div>
          {/* Frame Name Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 font-mono">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">FRAME:</span>
              <span className="text-cyan-400 font-bold tracking-wider">CLIMATE_SITUATION_FRAME</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span>Parent:</span>
              <span className="text-violet-400 font-semibold">ROOM_FRAME (Living Room)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(slots).map(([key, slot]) => {
              const isHighlight = ['climate_requirement', 'preferred_target', 'indoor_temperature', 'device_state'].includes(key);

              return (
                <div
                  key={key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isHighlight
                      ? 'bg-slate-900/90 border-cyan-500/30 shadow-glow-cyan/5'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      {slot.name || key}
                    </span>

                    {slot.isInherited ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        Inherited ({slot.sourceFrame || 'ROOM_FRAME'})
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Dynamic Slot
                      </span>
                    )}
                  </div>

                  <div className={`text-sm font-mono font-bold truncate ${
                    key === 'climate_requirement'
                      ? 'text-cyan-400'
                      : key === 'indoor_temperature'
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}>
                    {typeof slot.value === 'object' ? JSON.stringify(slot.value) : String(slot.value)}
                  </div>

                  {slot.facet?.description && (
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {slot.facet.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Academic Sense-Reason-Act Flowchart Banner */}
          <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold">Sensor Inputs</span>
            <span>→</span>
            <span className="text-violet-400 font-semibold">Frame Slots</span>
            <span>→</span>
            <span className="text-amber-400 font-semibold">Inference Rules</span>
            <span>→</span>
            <span className="text-rose-400 font-semibold">Conflict Resolution</span>
            <span>→</span>
            <span className="text-emerald-400 font-semibold">IoT Actuator Output</span>
          </div>
        </div>
      )}

      {/* Mode 2: Inheritance Hierarchy */}
      {viewMode === 'INHERITANCE' && (
        <div className="space-y-4">
          {/* Level 1: HOME_FRAME */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-emerald-400">ROOT FRAME:</span>
                <span className="text-sm font-bold text-white">HOME_FRAME</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Top-Level Policy
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Encapsulates global household defaults: baseline comfort bounds (19°C - 27°C), eco-setback delta (4.0°C), and energy conservation policies.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">residence_name</span>
                <span className="text-slate-200">Smart Residence</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">global_safe_band</span>
                <span className="text-emerald-300">16.0°C — 34.0°C</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">eco_setback_delta</span>
                <span className="text-slate-200">4.0°C</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">conflict_strategy</span>
                <span className="text-cyan-300">AVERAGE</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 text-slate-600">
            <ArrowDown className="w-5 h-5 animate-bounce text-violet-400" />
          </div>

          {/* Level 2: ROOM_FRAME */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-violet-500/30 ml-4 md:ml-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-violet-400">INTERMEDIATE FRAME:</span>
                <span className="text-sm font-bold text-white">ROOM_FRAME (Living Room)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                Inherits from HOME_FRAME
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Specializes global constraints with localized room architecture: floor 1, installed actuators (AC, Heater, Fan), and thermal volume.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">room_name</span>
                <span className="text-violet-300">Living Room</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">thermal_inertia</span>
                <span className="text-slate-200">MEDIUM</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">actuators</span>
                <span className="text-slate-200">AC, Heater, Fan</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">baseline_temp</span>
                <span className="text-slate-200">24.0°C</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 text-slate-600">
            <ArrowDown className="w-5 h-5 animate-bounce text-cyan-400" />
          </div>

          {/* Level 3: CLIMATE_SITUATION_FRAME */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 ml-8 md:ml-16">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-cyan-400">LEAF SITUATION FRAME:</span>
                <span className="text-sm font-bold text-white">CLIMATE_SITUATION_FRAME</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Real-Time Instantiation
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Combines inherited room & home defaults with live sensor telemetry, active occupants, evaluated rules, and active actuator states.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">live_temp / humidity</span>
                <span className="text-amber-300">32.0°C / 68%</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">occupancy</span>
                <span className="text-cyan-300">2 people</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">preference_conflict</span>
                <span className="text-rose-300">True (4.0°C delta)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">actuation</span>
                <span className="text-cyan-300 font-bold">AC ON (26.0°C)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Raw JSON Spec */}
      {viewMode === 'JSON' && (
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-96">
          {JSON.stringify(situationFrame || { slots: defaultSlots }, null, 2)}
        </pre>
      )}
    </div>
  );
};
