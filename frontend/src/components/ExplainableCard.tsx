import React from 'react';
import { HelpCircle, Brain, Sparkles, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ExplainableCardProps {
  explanation?: {
    title: string;
    contextSummary: string;
    thermalRationale: string;
    conflictRationale: string;
    finalDecision: string;
    fullText?: string;
  };
  confidenceScore?: number;
  primaryMode?: string;
  hadConflict?: boolean;
}

export const ExplainableCard: React.FC<ExplainableCardProps> = ({
  explanation,
  confidenceScore = 94,
  primaryMode = 'COOLING',
  hadConflict = true
}) => {
  if (!explanation) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center py-10">
        <Brain className="w-10 h-10 text-cyan-400/40 mx-auto mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-300">Awaiting AI Analysis Run</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Execute the AI Reasoning Engine or trigger a simulated scenario to view causal explainability steps.
        </p>
      </div>
    );
  }

  const isCooling = primaryMode === 'COOLING';
  const isHeating = primaryMode === 'HEATING';
  const isEco = primaryMode === 'ECO';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-glow-cyan/10 relative overflow-hidden">
      {/* Glow header badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              WHY DID AI MAKE THIS DECISION?
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Transparent XAI
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Dynamic causal inference audit & multi-user conflict resolution trace</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400">Deterministic Confidence:</span>
          <span className="text-xs font-mono font-bold text-cyan-300">{confidenceScore}%</span>
        </div>
      </div>

      {/* Step-by-Step Causal Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Step 1: Context & Thermal Observation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              1. Sensing & Context
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation.contextSummary}
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center text-[11px] text-cyan-300 font-mono">
            <ArrowRight className="w-3.5 h-3.5 mr-1" />
            {explanation.thermalRationale}
          </div>
        </div>

        {/* Step 2: Preference Conflict Analysis */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
              2. Conflict Synthesis
            </span>
            {hadConflict && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Conflict
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation.conflictRationale}
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-violet-300 font-mono flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Strategy reconciled diverging human goals
          </div>
        </div>

        {/* Step 3: Actuator Command */}
        <div className={`p-4 rounded-xl border ${
          isCooling
            ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
            : isHeating
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : isEco
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-violet-950/30 border-violet-500/40 text-violet-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              3. Final IoT Actuation
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10">
              {primaryMode}
            </span>
          </div>
          <p className="text-xs leading-relaxed font-mono font-medium">
            {explanation.finalDecision}
          </p>
        </div>
      </div>

      {/* Transparent AI Academic Note */}
      <div className="flex items-start gap-2.5 text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 font-mono">
        <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Academic AI Logic: </span>
          The decision was inferred through deterministic rule-based evaluation over instantiated situational frame slots, bypassing opaque black-box deep learning.
        </div>
      </div>
    </div>
  );
};
