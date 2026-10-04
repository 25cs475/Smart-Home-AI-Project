import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Compass,
  FileCode,
  Sliders,
  AlertOctagon,
  Scale,
  Zap,
  Radio,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: any;
  aiResult?: any;
}

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
  contextData,
  aiResult
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const steps = [
    {
      id: 1,
      title: '1. CURRENT CONTEXT',
      subtitle: 'Environmental Sensing & Multi-Occupant Harvest',
      icon: <Compass className="w-8 h-8 text-cyan-400" />,
      content: {
        headline: 'Context Harvesting: 32.0°C | 68% Humidity | 2 Occupants | Hot / Sunny',
        details: 'The intelligent agent continually collects situational context from ambient room sensors, diurnal clock (08:00 PM), and detected human occupants.',
        metrics: [
          { label: 'Indoor Temp', value: '32.0°C', alert: true },
          { label: 'Humidity', value: '68%', alert: false },
          { label: 'Occupancy', value: '2 People', alert: false },
          { label: 'Atmosphere', value: 'Hot / Sunny', alert: false }
        ]
      }
    },
    {
      id: 2,
      title: '2. KNOWLEDGE FRAME',
      subtitle: 'Frame-Based Knowledge Representation & Slot Instantiation',
      icon: <FileCode className="w-8 h-8 text-violet-400" />,
      content: {
        headline: 'CLIMATE_SITUATION_FRAME Instantiated with Inheritance',
        details: 'Knowledge is represented as Minsky Frames. The situation frame inherits boundary baselines from HOME_FRAME and actuators from ROOM_FRAME, filling dynamic slots with live telemetry.',
        metrics: [
          { label: 'Root Frame', value: 'HOME_FRAME', alert: false },
          { label: 'Parent Frame', value: 'ROOM_FRAME', alert: false },
          { label: 'Leaf Frame', value: 'SITUATION_FRAME', alert: false },
          { label: 'Total Slots Filled', value: '11 Slots', alert: false }
        ]
      }
    },
    {
      id: 3,
      title: '3. AI REASONING',
      subtitle: 'Transparent Rule-Based Inference Evaluation',
      icon: <Sliders className="w-8 h-8 text-amber-400" />,
      content: {
        headline: 'RULE_EXTREME_HEAT & RULE_NIGHT_SLEEP Fired',
        details: 'IF temperature >= 28.0°C AND occupancy > 0 THEN climate_mode = COOLING. The transparent inference engine avoids black-box opacity and provides traceable causal justification.',
        metrics: [
          { label: 'Cooling Threshold', value: '28.0°C', alert: false },
          { label: 'Condition Met', value: '32.0°C >= 28.0°C', alert: true },
          { label: 'Inferred Demand', value: 'COOLING', alert: true },
          { label: 'Rules Evaluated', value: '7 Rules', alert: false }
        ]
      }
    },
    {
      id: 4,
      title: '4. CONFLICT DETECTION',
      subtitle: 'Multi-User Thermal Divergence Identification',
      icon: <AlertOctagon className="w-8 h-8 text-rose-400" />,
      content: {
        headline: 'Preference Conflict Detected: House Owner (24°C) vs Family Member (28°C)',
        details: 'When multiple occupants share a zone with differing thermal preferences (|T_A - T_B| >= 1.5°C), standard smart homes fail. SmartHome AI detects a 4.0°C divergence.',
        metrics: [
          { label: 'User A (Owner)', value: '24.0°C', alert: false },
          { label: 'User B (Member)', value: '28.0°C', alert: false },
          { label: 'Divergence Delta', value: '4.0°C', alert: true },
          { label: 'Status', value: 'CONFLICT DETECTED', alert: true }
        ]
      }
    },
    {
      id: 5,
      title: '5. CONFLICT RESOLUTION',
      subtitle: 'Compromise / Average Strategy Execution',
      icon: <Scale className="w-8 h-8 text-violet-300" />,
      content: {
        headline: 'Resolved via Average Strategy: (24 + 28) / 2 = 26.0°C',
        details: 'The system evaluates 5 configurable strategies (Average, Priority, Majority, Room-Based, Manual). With the Compromise Strategy active, arithmetic mean target of 26.0°C is established.',
        metrics: [
          { label: 'Strategy Applied', value: 'Average (Compromise)', alert: false },
          { label: 'Formula', value: '(24 + 28) / 2', alert: false },
          { label: 'Resolved Target', value: '26.0°C', alert: false },
          { label: 'Discomfort Minimized', value: '±2.0°C balanced', alert: false }
        ]
      }
    },
    {
      id: 6,
      title: '6. FINAL DECISION',
      subtitle: 'Synthesis & Confidence Scoring',
      icon: <Zap className="w-8 h-8 text-cyan-300" />,
      content: {
        headline: 'Final Decision: AC → ON | Target → 26.0°C | Confidence → 94%',
        details: 'The agent combines the cooling requirement with the resolved 26.0°C target temperature and calculates a deterministic 94% certainty confidence score.',
        metrics: [
          { label: 'HVAC Mode', value: 'COOLING', alert: false },
          { label: 'AC State', value: 'ON (High)', alert: true },
          { label: 'Heater State', value: 'OFF', alert: false },
          { label: 'AI Confidence', value: '94%', alert: false }
        ]
      }
    },
    {
      id: 7,
      title: '7. IoT ACTION',
      subtitle: 'Simulated Actuation & Closed-Loop Feedback',
      icon: <Radio className="w-8 h-8 text-emerald-400" />,
      content: {
        headline: 'Actuators Synced: Smart AC Compressor Engaged',
        details: 'Commands are transmitted to virtual IoT actuators. The simulated AC updates to COOLING at 26.0°C, and telemetry is logged to database history.',
        metrics: [
          { label: 'Device Actuated', value: 'Living Room Smart AC', alert: false },
          { label: 'Previous State', value: 'OFF', alert: false },
          { label: 'New State', value: 'COOLING', alert: true },
          { label: 'Audit Log', value: 'Logged to DB', alert: false }
        ]
      }
    }
  ];

  // Auto-play interval
  useEffect(() => {
    let timer: any;
    if (isOpen && isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, steps.length]);

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-cyan-500/40 shadow-glow-cyan overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ACADEMIC PRESENTATION MODE
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Professor Walkthrough
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated 7-stage sequential explanation of Frame AI & Conflict Resolution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Stepper Header */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlaying(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                currentStep === idx
                  ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                  : currentStep > idx
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-950/60 text-slate-500 border border-slate-800/80'
              }`}
            >
              <span>{s.id}</span>
              <span className="hidden sm:inline">{s.title.split('. ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Active Stage Body */}
        <div className="p-8 flex-1 overflow-y-auto flex flex-col justify-center">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              {current.icon}
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                STAGE 0{current.id} OF 07
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">{current.title}</h3>
              <p className="text-sm text-slate-400">{current.subtitle}</p>
            </div>
          </div>

          {/* Core Stage Narrative */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 mb-6">
            <h4 className="text-base font-bold text-cyan-300 mb-2 font-mono">
              {current.content.headline}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {current.content.details}
            </p>
          </div>

          {/* Metrics / Key Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {current.content.metrics.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border font-mono ${
                  m.alert
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 block uppercase">{m.label}</span>
                <span className="text-sm font-bold block mt-1">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Controls Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-black shadow-glow-amber'
                  : 'bg-cyan-500 text-black shadow-glow-cyan'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
              <span>{isPlaying ? 'PAUSE AUTO-WALKTHROUGH' : 'RESUME AUTO-WALKTHROUGH'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Restart from Stage 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setCurrentStep((prev) => Math.max(0, prev - 1));
                setIsPlaying(false);
              }}
              disabled={currentStep === 0}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
                }
                setIsPlaying(false);
              }}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-glow-cyan"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Demo' : 'Next Stage'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
