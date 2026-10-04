import React from 'react';
import { ReasoningStep } from '../types';
import {
  Compass,
  FileCode,
  Sliders,
  AlertOctagon,
  Scale,
  Zap,
  Radio,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ReasoningPipelineProps {
  steps: ReasoningStep[];
  activeStepIndex?: number;
  isAnalyzing?: boolean;
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  COLLECT_CONTEXT: <Compass className="w-4 h-4" />,
  BUILD_FRAME: <FileCode className="w-4 h-4" />,
  EVALUATE_RULES: <Sliders className="w-4 h-4" />,
  DETECT_CONFLICT: <AlertOctagon className="w-4 h-4" />,
  RESOLVE_CONFLICT: <Scale className="w-4 h-4" />,
  DETERMINE_ACTION: <Zap className="w-4 h-4" />,
  UPDATE_IOT: <Radio className="w-4 h-4" />
};

export const ReasoningPipeline: React.FC<ReasoningPipelineProps> = ({
  steps,
  activeStepIndex = -1,
  isAnalyzing = false
}) => {
  const defaultPipelineStages: ReasoningStep[] = [
    { stepNumber: 1, title: 'Collect Context', stage: 'COLLECT_CONTEXT', description: 'Harvest sensor telemetry & user occupancy', data: null, status: 'COMPLETED' },
    { stepNumber: 2, title: 'Build Situation Frame', stage: 'BUILD_FRAME', description: 'Instantiate slot-filler knowledge model', data: null, status: 'COMPLETED' },
    { stepNumber: 3, title: 'Evaluate Rules', stage: 'EVALUATE_RULES', description: 'Trigger contextual inference rules', data: null, status: 'COMPLETED' },
    { stepNumber: 4, title: 'Detect Conflict', stage: 'DETECT_CONFLICT', description: 'Detect human preference divergence', data: null, status: 'COMPLETED' },
    { stepNumber: 5, title: 'Resolve Conflict', stage: 'RESOLVE_CONFLICT', description: 'Apply selected strategy calculation', data: null, status: 'COMPLETED' },
    { stepNumber: 6, title: 'Determine Action', stage: 'DETERMINE_ACTION', description: 'Synthesize optimal mode & target temp', data: null, status: 'COMPLETED' },
    { stepNumber: 7, title: 'Update IoT Device', stage: 'UPDATE_IOT', description: 'Actuate simulated virtual smart devices', data: null, status: 'COMPLETED' }
  ];

  const pipelineSteps = steps && steps.length === 7 ? steps : defaultPipelineStages;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            AI Sense-Reason-Act Pipeline
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              7 Sequential Stages
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">End-to-end intelligent cognitive architecture</p>
        </div>

        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Reasoning in progress...</span>
          </div>
        )}
      </div>

      {/* Interactive Horizontal Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 relative">
        {pipelineSteps.map((step, idx) => {
          const isDone = activeStepIndex === -1 || activeStepIndex >= idx;
          const isCurrent = activeStepIndex === idx;

          return (
            <div
              key={step.stepNumber}
              className={`relative p-3 rounded-xl border transition-all duration-300 ${
                isCurrent
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-glow-cyan text-white scale-[1.03]'
                  : isDone
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-cyan-500/40'
                  : 'bg-slate-900/30 border-slate-800/40 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isCurrent ? 'bg-cyan-500 text-black' : isDone ? 'bg-slate-800 text-cyan-400' : 'bg-slate-800/60 text-slate-500'
                }`}>
                  0{step.stepNumber}
                </span>

                <div className={`${isCurrent ? 'text-cyan-300' : isDone ? 'text-cyan-400' : 'text-slate-600'}`}>
                  {STAGE_ICONS[step.stage] || <Clock className="w-4 h-4" />}
                </div>
              </div>

              <h4 className="text-xs font-semibold leading-tight mb-1 truncate text-slate-100">
                {step.title}
              </h4>

              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {step.description}
              </p>

              {isDone && (
                <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span>Resolved</span>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
