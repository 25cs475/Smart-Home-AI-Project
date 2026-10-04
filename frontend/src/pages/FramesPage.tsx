import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, RefreshCw, GitBranch, Database, ShieldAlert } from 'lucide-react';
import { aiService } from '../services/api';
import { KnowledgeFrameView } from '../types';
import { FrameVisualizer } from '../components/FrameVisualizer';
import { useToast } from '../context/ToastContext';

export const FramesPage: React.FC = () => {
  const { showToast } = useToast();
  const [frame, setFrame] = useState<KnowledgeFrameView | undefined>(undefined);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFrames = async () => {
    try {
      setLoading(true);
      const [currRes, hierRes] = await Promise.all([
        aiService.getCurrentFrame(),
        aiService.getFrameHierarchy()
      ]);
      setFrame(currRes.situationFrame);
      setHierarchy(hierRes.hierarchy);
    } catch (err) {
      showToast('Frame Sync Error', 'Failed to retrieve situational frames from knowledge base', 'WARNING');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFrames();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>AI Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Knowledge Frames</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Minsky Frame Architecture with slot-filler bindings and multi-tier inheritance (HOME_FRAME → ROOM_FRAME → CLIMATE_SITUATION_FRAME).
          </p>
        </div>

        <button
          onClick={loadFrames}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-200 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Frame State</span>
        </button>
      </div>

      {/* Frame Knowledge Theory Card */}
      <div className="glass-panel rounded-2xl p-5 border border-violet-500/20 bg-violet-950/10 shadow-glow-violet/5">
        <h3 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-violet-400" />
          Academic Frame Theory & Inheritance Mechanism
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          In Artificial Intelligence, a <strong>Frame</strong> is a data structure for representing stereotypical situations (Marvin Minsky, 1974). Frames consist of <em>slots</em> and associated <em>facets</em> (type definitions, constraints, and default values). Sub-frames automatically inherit slot defaults from super-frames, allowing localized situational frames to override global thermal defaults only when specific sensor context demands it.
        </p>
      </div>

      {/* Interactive Frame Visualizer Component (Slots, Hierarchy, and JSON views) */}
      <FrameVisualizer
        situationFrame={frame}
        hierarchy={hierarchy}
      />
    </div>
  );
};
