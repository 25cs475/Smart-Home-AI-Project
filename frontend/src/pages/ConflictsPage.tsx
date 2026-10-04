import React, { useState, useEffect } from 'react';
import {
  Scale,
  Users,
  AlertTriangle,
  History,
  CheckCircle2,
  Sparkles,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { conflictService, preferenceService, roomService } from '../services/api';
import { ConflictEventItem } from '../types';
import { ConflictResolverWidget } from '../components/ConflictResolverWidget';
import { useToast } from '../context/ToastContext';

export const ConflictsPage: React.FC = () => {
  const { showToast } = useToast();
  const [conflicts, setConflicts] = useState<ConflictEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [histRes, prefRes] = await Promise.all([
        conflictService.getHistory(),
        preferenceService.getAll()
      ]);
      setConflicts(histRes.conflicts || []);
      setPreferences(
        prefRes.preferences.map(p => ({
          userName: p.user?.name || 'Resident',
          preferredTemp: p.preferredTemp,
          priority: p.priority,
          priorityWeight: p.priorityWeight,
          role: p.user?.role
        }))
      );
    } catch (err) {
      showToast('Error', 'Failed to load conflict resolution telemetry', 'WARNING');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStrategy = async (strategy: string, manualTemp?: number) => {
    try {
      const res = await conflictService.resolve({
        strategy,
        preferences,
        manualTargetOverride: manualTemp
      });
      showToast(
        'Strategy Applied',
        `Reconciled to ${res.result.resolvedTargetTemp}°C via ${strategy} algorithm.`,
        'SUCCESS'
      );
    } catch (err) {
      showToast('Resolution Failed', 'Could not apply strategy', 'ALERT');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span>Game-Theoretic Consensus</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Multi-User Conflict Resolution</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify thermal preference divergence between simultaneous occupants and execute mathematical consensus algorithms.
          </p>
        </div>
      </div>

      {/* Interactive Conflict Resolver Widget (Section 16) */}
      <ConflictResolverWidget
        preferences={preferences}
        activeStrategy="AVERAGE"
        onSelectStrategy={handleSelectStrategy}
      />

      {/* Conflict History Table (Section 17) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Historical Conflict Log</h3>
              <p className="text-xs text-slate-400">Audited conflict events, participants, and resolved compromise temperatures</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">{conflicts.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Users Involved</th>
                <th className="py-3 px-4">Strategy Applied</th>
                <th className="py-3 px-4">Resolved Target</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {conflicts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No conflict events logged yet.
                  </td>
                </tr>
              ) : (
                conflicts.map((c) => {
                  let users: string[] = [];
                  try {
                    users = JSON.parse(c.usersInvolved);
                  } catch (e) {
                    users = [c.usersInvolved];
                  }

                  return (
                    <tr key={c.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">{c.room?.name || 'Living Room'}</td>
                      <td className="py-3 px-4 text-violet-300">{users.join(' vs ')}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                          {c.strategyUsed}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{c.resolvedTargetTemp.toFixed(1)}°C</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
