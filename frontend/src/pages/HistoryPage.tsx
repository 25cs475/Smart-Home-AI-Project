import React, { useState, useEffect } from 'react';
import {
  History,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Layers,
  Clock,
  X,
  Scale
} from 'lucide-react';
import { aiService } from '../services/api';
import { AIDecisionRecord } from '../types';
import { useToast } from '../context/ToastContext';

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [decisions, setDecisions] = useState<AIDecisionRecord[]>([]);
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDecision, setSelectedDecision] = useState<AIDecisionRecord | null>(null);

  const loadDecisions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterMode !== 'ALL' && filterMode !== 'CONFLICT') {
        params.mode = filterMode;
      }
      if (filterMode === 'CONFLICT') {
        params.hadConflict = true;
      }
      const res = await aiService.getDecisions(params);
      setDecisions(res.decisions || []);
    } catch (err) {
      showToast('Error', 'Failed to fetch decision history', 'WARNING');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, [filterMode]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>Audit & Verification Trail</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">AI Decision History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all situational frame evaluations, rule activations, and IoT actuator triggers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {['ALL', 'COOLING', 'HEATING', 'ECO', 'CONFLICT'].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                filterMode === m
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Decisions Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Inferred Mode</th>
              <th className="py-3 px-4">Target Temp</th>
              <th className="py-3 px-4">Actuator Action</th>
              <th className="py-3 px-4">Conflict</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {decisions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No historical records found for this filter.
                </td>
              </tr>
            ) : (
              decisions.map((d) => {
                const isCooling = d.decisionMode === 'COOLING';
                const isHeating = d.decisionMode === 'HEATING';
                const isEco = d.decisionMode === 'ECO';

                return (
                  <tr key={d.id} className="hover:bg-slate-900/50">
                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-white font-semibold">{d.room?.name || 'Living Room'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCooling
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : isHeating
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isEco
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      }`}>
                        {d.decisionMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{d.targetTemp.toFixed(1)}°C</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      AC: <span className={d.acAction === 'ON' ? 'text-cyan-400 font-bold' : 'text-slate-500'}>{d.acAction}</span> | Heat: <span className={d.heaterAction === 'ON' ? 'text-amber-400 font-bold' : 'text-slate-500'}>{d.heaterAction}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {d.hadConflict ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Yes ({d.conflictResolutionStrategy})
                        </span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-300 font-bold">{d.confidenceScore}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedDecision(d)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="View Full Reasoning Snapshot"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Decision Detail Drawer / Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-cyan-500/40 shadow-glow-cyan max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Audit Snapshot — {new Date(selectedDecision.timestamp).toLocaleString()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDecision(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Dynamic Explanation */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                  Dynamic Causal Explanation
                </span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {selectedDecision.explanation}
                </p>
              </div>

              {/* Fired Rules */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                  Rules Fired
                </span>
                <div className="text-xs font-mono text-slate-300">
                  {selectedDecision.rulesFired}
                </div>
              </div>

              {/* Situation Frame Snapshot */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-violet-400 uppercase font-bold block mb-1">
                  Situational Frame JSON Snapshot
                </span>
                <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
                  {JSON.stringify(JSON.parse(selectedDecision.frameSnapshot || '{}'), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
