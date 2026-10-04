import React, { useState } from 'react';
import { Scale, Users, Check, AlertCircle, ArrowRight, Sparkles, Sliders } from 'lucide-react';
import { UserPreference } from '../types';

interface ConflictResolverWidgetProps {
  preferences: Array<{
    userName: string;
    preferredTemp: number;
    priority: string;
    priorityWeight: number;
    role?: string;
  }>;
  activeStrategy?: string;
  onSelectStrategy?: (strategy: string, manualTemp?: number) => void;
  isInteractive?: boolean;
}

export const ConflictResolverWidget: React.FC<ConflictResolverWidgetProps> = ({
  preferences = [
    { userName: 'House Owner', preferredTemp: 24.0, priority: 'HIGH', priorityWeight: 2.0, role: 'HOME_OWNER' },
    { userName: 'Family Member', preferredTemp: 28.0, priority: 'NORMAL', priorityWeight: 1.0, role: 'HOUSEHOLD_MEMBER' }
  ],
  activeStrategy = 'AVERAGE',
  onSelectStrategy,
  isInteractive = true
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(activeStrategy);
  const [manualOverrideTemp, setManualOverrideTemp] = useState<number>(25.0);

  const temps = preferences.map(p => p.preferredTemp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const delta = parseFloat((maxTemp - minTemp).toFixed(1));
  const hasConflict = delta >= 1.5;

  // Compute 5 strategy outcomes locally for instantaneous preview
  const averageTarget = parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));

  let totalWeight = 0;
  let weightedSum = 0;
  preferences.forEach(p => {
    const w = p.priorityWeight > 0 ? p.priorityWeight : (p.priority === 'HIGH' ? 2.0 : 1.0);
    weightedSum += p.preferredTemp * w;
    totalWeight += w;
  });
  const priorityTarget = parseFloat((weightedSum / totalWeight).toFixed(1));

  const ownerPref = preferences.find(p => p.role === 'HOME_OWNER' || p.priority === 'HIGH') || preferences[0];
  const roomBasedTarget = ownerPref.preferredTemp;
  const majorityTarget = averageTarget; // with 2 people, majority approximates average; with more it clusters

  const strategies = [
    {
      id: 'AVERAGE',
      name: 'Strategy 1 — Average (Compromise)',
      description: 'Calculates the arithmetic mean temperature across active occupants.',
      formula: `(${temps.join(' + ')}) / ${temps.length} = ${averageTarget}°C`,
      target: averageTarget,
      color: 'border-cyan-500/40 text-cyan-300'
    },
    {
      id: 'PRIORITY',
      name: 'Strategy 2 — Priority-Weighted',
      description: 'Weights preferences by user administrative authority tier (Owner: 2.0x, Member: 1.0x).',
      formula: `Weighted Sum / Total Weight = ${priorityTarget}°C`,
      target: priorityTarget,
      color: 'border-violet-500/40 text-violet-300'
    },
    {
      id: 'MAJORITY',
      name: 'Strategy 3 — Majority Consensus',
      description: 'Selects the modal cluster supported by the highest number of active occupants.',
      formula: `Mode cluster = ${majorityTarget}°C`,
      target: majorityTarget,
      color: 'border-emerald-500/40 text-emerald-300'
    },
    {
      id: 'ROOM_BASED',
      name: 'Strategy 4 — Room-Based Anchor',
      description: 'Grants primary authority to the assigned room resident or primary owner.',
      formula: `Resident (${ownerPref.userName}) = ${roomBasedTarget}°C`,
      target: roomBasedTarget,
      color: 'border-amber-500/40 text-amber-300'
    },
    {
      id: 'MANUAL',
      name: 'Strategy 5 — Manual Administrator Choice',
      description: 'Permits explicit user-designated target override.',
      formula: `Direct Override = ${manualOverrideTemp}°C`,
      target: manualOverrideTemp,
      color: 'border-rose-500/40 text-rose-300'
    }
  ];

  const handleStrategyChange = (id: string) => {
    setSelectedStrategy(id);
    if (onSelectStrategy) {
      onSelectStrategy(id, id === 'MANUAL' ? manualOverrideTemp : undefined);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-glow-amber">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              MULTI-USER CONFLICT RESOLUTION
              {hasConflict ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  Conflict Detected ({delta}°C Divergence)
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Consensus
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Detects conflicting thermal preferences and applies selectable game-theoretic policies</p>
          </div>
        </div>
      </div>

      {/* Visual Preference Disparity Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-6">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>Active Occupant Preferences</span>
          <span className="text-rose-400 font-bold">Delta: {delta}°C</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {preferences.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-white">{p.userName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Priority: <span className={p.priority === 'HIGH' ? 'text-amber-400' : 'text-slate-300'}>{p.priority}</span> ({p.priorityWeight}x)
                  </div>
                </div>
              </div>
              <div className="text-lg font-mono font-bold text-cyan-300">
                {p.preferredTemp}°C
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selectable Strategy Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
          Selectable Conflict Resolution Algorithms
        </h4>

        <div className="grid grid-cols-1 gap-2.5">
          {strategies.map((s) => {
            const isSelected = selectedStrategy === s.id;

            return (
              <div
                key={s.id}
                onClick={() => isInteractive && handleStrategyChange(s.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-glow-cyan/20 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border ${
                      isSelected ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        {s.name}
                        {isSelected && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                            Active
                          </span>
                        )}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.description}</p>
                      <div className="mt-1.5 text-[11px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800/80 inline-block">
                        Formula: {s.formula}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block">Resolved Target</span>
                    <span className="text-base font-mono font-bold text-cyan-300">
                      {s.target.toFixed(1)}°C
                    </span>
                  </div>
                </div>

                {/* Manual Override Slider inside Strategy 5 */}
                {s.id === 'MANUAL' && isSelected && isInteractive && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center space-x-4">
                    <Sliders className="w-4 h-4 text-rose-400" />
                    <input
                      type="range"
                      min="18"
                      max="30"
                      step="0.5"
                      value={manualOverrideTemp}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setManualOverrideTemp(val);
                        if (onSelectStrategy) onSelectStrategy('MANUAL', val);
                      }}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-rose-400 min-w-[50px]">
                      {manualOverrideTemp.toFixed(1)}°C
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
