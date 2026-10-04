import React, { useState, useEffect } from 'react';
import {
  Brain,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { aiService, roomService } from '../services/api';
import { ReasoningPipeline } from '../components/ReasoningPipeline';
import { ExplainableCard } from '../components/ExplainableCard';
import { useToast } from '../context/ToastContext';

export const AIEnginePage: React.FC = () => {
  const { showToast } = useToast();
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [activeStrategy, setActiveStrategy] = useState<string>('AVERAGE');

  const loadData = async () => {
    try {
      const [rulesRes, roomsRes] = await Promise.all([
        aiService.getRules(),
        roomService.getAll()
      ]);
      setRules(rulesRes.rules || []);
      setRooms(roomsRes.rooms || []);
      if (roomsRes.rooms && roomsRes.rooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(roomsRes.rooms[0].id);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await aiService.analyze({
        roomId: selectedRoomId,
        strategy: activeStrategy
      });
      setResult(res.result);
      showToast(
        'AI Reasoning Complete',
        `Mode: ${res.result.primaryMode} | Target: ${res.result.targetTemp}°C (Confidence: ${res.result.confidenceScore}%)`,
        'SUCCESS'
      );
    } catch (err) {
      showToast('Analysis Failure', 'Reasoning cycle interrupted', 'ALERT');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>Autonomous Cognitive Core</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">AI Decision Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent rule-based inference pipeline evaluating situational frames and conflict resolution policies.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
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

          <select
            value={activeStrategy}
            onChange={(e) => setActiveStrategy(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-mono text-violet-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="AVERAGE">Strategy: Average</option>
            <option value="PRIORITY">Strategy: Priority-Weighted</option>
            <option value="MAJORITY">Strategy: Majority</option>
            <option value="ROOM_BASED">Strategy: Room-Based</option>
            <option value="MANUAL">Strategy: Manual Override</option>
          </select>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider shadow-glow-cyan transition-all transform active:scale-95"
          >
            <Play className={`w-4 h-4 fill-black ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'RUNNING INFERENCE...' : 'RUN AI ANALYSIS'}</span>
          </button>
        </div>
      </div>

      {/* 7-Step Animated Pipeline (Section 13) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <ReasoningPipeline
          steps={result?.steps}
          isAnalyzing={analyzing}
        />
      </div>

      {/* Dynamic Explainability Section (Section 15) */}
      <ExplainableCard
        explanation={result?.explanation}
        confidenceScore={result?.confidenceScore || 94}
        primaryMode={result?.primaryMode || 'COOLING'}
        hadConflict={result?.conflictResolution?.hasConflict ?? true}
      />

      {/* Rule Knowledge Base Viewer (Section 14) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Declarative Inference Rules</h3>
              <p className="text-xs text-slate-400">Contextual IF-THEN production rules evaluated against frame slots</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">{rules.length} Rules Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((rule) => {
            const isFired = result?.ruleEvaluation?.firedRules?.some((r: any) => r.ruleCode === rule.ruleCode);

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all ${
                  isFired
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-glow-cyan/10 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-white">{rule.name}</span>
                  {isFired ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500 text-black font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Fired
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Priority {rule.priority}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {rule.description}
                </p>

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-950 text-amber-300 border border-slate-800">
                    <span className="text-slate-500">IF: </span>{rule.conditionLogic}
                  </div>
                  <div className="p-2 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    <span className="text-slate-500">THEN: </span>{rule.actionLogic}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
