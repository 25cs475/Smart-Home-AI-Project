import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Sliders,
  Clock,
  Shield,
  Edit2,
  Check,
  X,
  Sparkles,
  Scale
} from 'lucide-react';
import { preferenceService, roomService } from '../services/api';
import { UserPreference, Room } from '../types';
import { useToast } from '../context/ToastContext';

export const PreferencesPage: React.FC = () => {
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit fields
  const [editTemp, setEditTemp] = useState<number>(24.0);
  const [editPriority, setEditPriority] = useState<string>('NORMAL');
  const [editClimate, setEditClimate] = useState<string>('COOL');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prefRes, roomRes] = await Promise.all([
        preferenceService.getAll(),
        roomService.getAll()
      ]);
      setPreferences(prefRes.preferences || []);
      setRooms(roomRes.rooms || []);
    } catch (err) {
      showToast('Error', 'Failed to load user preferences', 'ALERT');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartEdit = (pref: UserPreference) => {
    setEditingId(pref.id);
    setEditTemp(pref.preferredTemp);
    setEditPriority(pref.priority);
    setEditClimate(pref.climatePreference);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await preferenceService.update(id, {
        preferredTemp: editTemp,
        priority: editPriority as any,
        climatePreference: editClimate as any,
        priorityWeight: editPriority === 'HIGH' ? 2.0 : (editPriority === 'LOW' ? 0.5 : 1.0)
      });
      showToast('Preference Updated', `Updated to ${editTemp}°C (${editPriority} priority)`, 'SUCCESS');
      setEditingId(null);
      await loadData();
    } catch (err) {
      showToast('Update Failed', 'Could not save preference', 'ALERT');
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    if (confirm(`Remove thermal preference profile for ${name || 'user'}?`)) {
      try {
        await preferenceService.delete(id);
        showToast('Removed', 'Preference removed successfully', 'INFO');
        await loadData();
      } catch (err) {
        showToast('Delete Failed', 'Could not remove preference', 'ALERT');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Human-Centered Climate Policy</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Household Preferences</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual occupant thermal setpoints, authority priority weightings, and active diurnal hours.
          </p>
        </div>
      </div>

      {/* Preferences Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {preferences.map((pref) => {
          const isEditing = editingId === pref.id;

          return (
            <div
              key={pref.id}
              className={`glass-panel rounded-2xl p-6 border transition-all ${
                isEditing
                  ? 'border-cyan-500/50 shadow-glow-cyan/20 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    {pref.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {pref.user?.name || 'Resident'}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        pref.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {pref.priority} Priority ({pref.priorityWeight}x)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Role: {pref.user?.role} • Zone: {pref.room?.name || 'Global'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => handleStartEdit(pref)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Edit Preference"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {preferences.length > 2 && (
                        <button
                          onClick={() => handleDelete(pref.id, pref.user?.name)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSaveEdit(pref.id)}
                        className="p-1.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
                        title="Save Changes"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* View / Edit Mode */}
              {!isEditing ? (
                <div className="my-4 space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Preferred Temperature</span>
                      <span className="text-2xl font-mono font-extrabold text-cyan-300">
                        {pref.preferredTemp}°C
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Climate Desire</span>
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded inline-block mt-1 ${
                        pref.climatePreference === 'COOL'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {pref.climatePreference}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Active Hours
                      </span>
                      <span className="text-slate-200 mt-0.5 block">
                        {pref.activeStartHour}:00 — {pref.activeEndHour}:00
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Voting Weight
                      </span>
                      <span className="text-slate-200 mt-0.5 block">
                        {pref.priorityWeight}x (Game Theory)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Inline Editing Form */
                <div className="my-4 space-y-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Preferred Temperature: <span className="text-cyan-400 font-mono font-bold">{editTemp}°C</span>
                    </label>
                    <input
                      type="range"
                      min="18"
                      max="30"
                      step="0.5"
                      value={editTemp}
                      onChange={(e) => setEditTemp(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Tier</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="HIGH">High (2.0x Weight)</option>
                        <option value="NORMAL">Normal (1.0x Weight)</option>
                        <option value="LOW">Low (0.5x Weight)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Climate Tendency</label>
                      <select
                        value={editClimate}
                        onChange={(e) => setEditClimate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="COOL">Cool (Prefers lower temp)</option>
                        <option value="WARM">Warm (Prefers higher temp)</option>
                        <option value="NEUTRAL">Neutral</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
