import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Flame,
  Snowflake,
  Users,
  Scale,
  Smile,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { simulationService } from '../services/api';
import { ReasoningPipeline } from '../components/ReasoningPipeline';
import { ExplainableCard } from '../components/ExplainableCard';
import { useToast } from '../context/ToastContext';

export const SimulationPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeScenarioId, setActiveScenarioId] = useState<number | null>(null);
  const [loadingScenario, setLoadingScenario] = useState<boolean>(false);
  const [scenarioResult, setScenarioResult] = useState<any>(null);

  const scenarios = [
    {
      id: 1,
      title: 'Scenario 1 — Hot Evening',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      tag: 'Cooling Demand',
      color: 'border-amber-500/40 text-amber-300',
      specs: {
        temp: '32.0°C',
        time: '08:00 PM',
        occupancy: '2 people',
        prefs: '24°C vs 28°C'
      },
      expected: 'Cooling ON (AC ON, Target 26.0°C via Compromise)',
      description: 'Tests high thermal demand in a multi-user environment. Triggers RULE_EXTREME_HEAT and resolves 4.0°C preference disparity.'
    },
    {
      id: 2,
      title: 'Scenario 2 — Cold Morning',
      icon: <Snowflake className="w-5 h-5 text-cyan-400" />,
      tag: 'Heating Demand',
      color: 'border-cyan-500/40 text-cyan-300',
      specs: {
        temp: '14.0°C',
        time: '07:00 AM',
        occupancy: '2 people',
        prefs: '22°C vs 24°C'
      },
      expected: 'Heating ON (Smart Heater ON, Target 22.0°C)',
      description: 'Tests low indoor temperature below 18°C threshold. Triggers RULE_EXTREME_COLD and warms the residence.'
    },
    {
      id: 3,
      title: 'Scenario 3 — Empty Room',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      tag: 'Eco Conservation',
      color: 'border-emerald-500/40 text-emerald-300',
      specs: {
        temp: '30.0°C',
        time: '02:00 PM',
        occupancy: '0 people',
        prefs: 'Vacant'
      },
      expected: 'Eco Mode (All HVAC OFF, Setback Target)',
      description: 'Tests zero occupancy rule. Evaluates RULE_ECO_EMPTY, shutting down compressors to eliminate wasted electrical draw.'
    },
    {
      id: 4,
      title: 'Scenario 4 — Conflicting Preferences',
      icon: <Scale className="w-5 h-5 text-violet-400" />,
      tag: 'Conflict Engine',
      color: 'border-violet-500/40 text-violet-300',
      specs: {
        temp: '30.0°C',
        time: '05:00 PM',
        occupancy: '2 people',
        prefs: '22°C (Owner) vs 28°C (Member)'
      },
      expected: 'Conflict Resolution Engine Reconciles to 25.0°C',
      description: 'Tests multi-agent preference divergence (|Δ| = 6.0°C). Proves automated game-theoretic compromise without user intervention.'
    },
    {
      id: 5,
      title: 'Scenario 5 — Comfortable Environment',
      icon: <Smile className="w-5 h-5 text-emerald-300" />,
      tag: 'Equilibrium',
      color: 'border-emerald-500/40 text-emerald-300',
      specs: {
        temp: '24.0°C',
        time: '04:00 PM',
        occupancy: '2 people',
        prefs: '24°C equilibrium'
      },
      expected: 'Comfort Mode (HVAC Idle / Fan Low)',
      description: 'Tests ambient thermal equilibrium between 18°C and 28°C. Triggers RULE_COMFORT_ZONE keeping compressor idle.'
    }
  ];

  const handleRunScenario = async (id: number) => {
    try {
      setLoadingScenario(true);
      setActiveScenarioId(id);
      const res = await simulationService.triggerScenario(id);
      setScenarioResult(res.aiResult);
      showToast(
        `Scenario ${id} Executed`,
        `${res.scenarioName}: Inferred ${res.aiResult.primaryMode} with Target ${res.aiResult.targetTemp}°C`,
        'SUCCESS'
      );
    } catch (err) {
      showToast('Execution Error', 'Failed to trigger preset scenario', 'ALERT');
    } finally {
      setLoadingScenario(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Academic Demonstration Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">AI Scenario Simulator</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            1-Click demonstration presets designed for academic presentation, verifying heating, cooling, eco, and conflict resolution behaviors.
          </p>
        </div>
      </div>

      {/* 5 Preset Scenario Cards Grid (Section 20) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((scen) => {
          const isSelected = activeScenarioId === scen.id;

          return (
            <div
              key={scen.id}
              className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 shadow-glow-cyan/20 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {scen.icon}
                    </div>
                    <span className="text-xs font-bold text-white">{scen.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${scen.color} bg-slate-950`}>
                    {scen.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {scen.description}
                </p>

                {/* Specs Box */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Temperature</span>
                    <span className="text-slate-200 font-bold">{scen.specs.temp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Occupancy</span>
                    <span className="text-slate-200 font-bold">{scen.specs.occupancy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Clock</span>
                    <span className="text-slate-200">{scen.specs.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Preferences</span>
                    <span className="text-cyan-400 truncate block">{scen.specs.prefs}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-emerald-400 mb-4 flex items-start gap-1">
                  <span className="font-semibold text-slate-400">Expected:</span>
                  <span>{scen.expected}</span>
                </div>
              </div>

              <button
                onClick={() => handleRunScenario(scen.id)}
                disabled={loadingScenario}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-glow-cyan transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>LOAD & RUN SCENARIO {scen.id}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Real-time Scenario Output Visualizer */}
      {scenarioResult && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Scenario Reasoning Output</span>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <ReasoningPipeline steps={scenarioResult.steps} />
          </div>

          <ExplainableCard
            explanation={scenarioResult.explanation}
            confidenceScore={scenarioResult.confidenceScore}
            primaryMode={scenarioResult.primaryMode}
            hadConflict={scenarioResult.conflictResolution?.hasConflict}
          />
        </div>
      )}
    </div>
  );
};
