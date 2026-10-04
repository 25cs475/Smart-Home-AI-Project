import React, { useState, useEffect } from 'react';
import {
  Home,
  Plus,
  Trash2,
  Thermometer,
  Droplets,
  Users,
  Radio,
  Cpu,
  Power,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { roomService, deviceService } from '../services/api';
import { Room } from '../types';
import { useToast } from '../context/ToastContext';

export const RoomsPage: React.FC = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomType, setNewRoomType] = useState<string>('BEDROOM');
  const [newRoomFloor, setNewRoomFloor] = useState<number>(1);
  const [newRoomTemp, setNewRoomTemp] = useState<number>(24.0);
  const [creating, setCreating] = useState<boolean>(false);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomService.getAll();
      setRooms(res.rooms || []);
    } catch (err) {
      showToast('Error', 'Failed to fetch rooms', 'ALERT');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName) return;

    try {
      setCreating(true);
      await roomService.create({
        name: newRoomName,
        roomType: newRoomType,
        floor: newRoomFloor,
        defaultTemp: newRoomTemp
      });
      showToast('Room Created', `${newRoomName} created with smart IoT sensors & actuators attached.`, 'SUCCESS');
      setIsCreateModalOpen(false);
      setNewRoomName('');
      await loadRooms();
    } catch (err) {
      showToast('Creation Failed', 'Failed to create room', 'ALERT');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? All attached IoT devices will be unlinked.`)) {
      try {
        await roomService.delete(id);
        showToast('Room Removed', `${name} deleted successfully`, 'INFO');
        await loadRooms();
      } catch (err) {
        showToast('Delete Failed', 'Cannot remove room', 'ALERT');
      }
    }
  };

  const handleToggleDeviceOverride = async (deviceId: string, currentOverride: boolean, currentTarget: number) => {
    try {
      if (currentOverride) {
        await deviceService.releaseOverride(deviceId);
        showToast('Override Released', 'Device returned to AI autonomous regulation', 'SUCCESS');
      } else {
        await deviceService.setOverride(deviceId, 'COOLING', currentTarget);
        showToast('Manual Override Engaged', 'AI autonomous lock disengaged for this device', 'WARNING');
      }
      await loadRooms();
    } catch (err) {
      showToast('Action Failed', 'Could not toggle manual override', 'ALERT');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Zone Architecture</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Room Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure climate zones, view attached smart actuators (AC, Heater, Thermostat), and monitor localized occupancy.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ADD NEW ROOM</span>
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const ac = room.devices?.find(d => d.type === 'AC');
          const heater = room.devices?.find(d => d.type === 'HEATER');
          const thermostat = room.devices?.find(d => d.type === 'THERMOSTAT');

          return (
            <div key={room.id} className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{room.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Floor {room.floor}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Type: {room.roomType} • Baseline: {room.defaultTemp}°C
                  </p>
                </div>

                {rooms.length > 1 && (
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Environmental Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1 font-mono">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Indoor Temp</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">{room.currentTemp}°C</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1 font-mono">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">{room.currentHumidity}%</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1 font-mono">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    <span>Occupancy</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">{room.currentOccupancy}</div>
                </div>
              </div>

              {/* Attached Smart Devices */}
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2.5 flex items-center justify-between">
                  <span>Attached IoT Devices & Actuators</span>
                  <span className="text-[10px] text-cyan-400 font-normal">{room.devices?.length || 0} Devices</span>
                </h4>

                <div className="space-y-2">
                  {room.devices?.map((dev) => {
                    const isCooling = dev.state === 'COOLING';
                    const isHeating = dev.state === 'HEATING';
                    const isOff = dev.state === 'OFF';

                    return (
                      <div
                        key={dev.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono"
                      >
                        <div className="flex items-center space-x-2">
                          <Cpu className={`w-4 h-4 ${isCooling ? 'text-cyan-400' : isHeating ? 'text-amber-400' : 'text-slate-500'}`} />
                          <div>
                            <div className="font-semibold text-slate-200">{dev.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Type: {dev.type} {dev.isManualOverride && <span className="text-rose-400 font-bold ml-1">• Manual Override</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCooling
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : isHeating
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {dev.state} ({dev.targetTemp}°C)
                          </span>

                          {(dev.type === 'AC' || dev.type === 'HEATER') && (
                            <button
                              onClick={() => handleToggleDeviceOverride(dev.id, dev.isManualOverride, dev.targetTemp)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                dev.isManualOverride
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                              title={dev.isManualOverride ? 'Release to AI' : 'Manual Override'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-cyan-400" />
                Add New Climate Zone
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom or Home Office"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Zone Type</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BEDROOM">Bedroom</option>
                    <option value="LIVING_ROOM">Living Room</option>
                    <option value="STUDY_ROOM">Study Room</option>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="OFFICE">Office</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Baseline Target Temperature: {newRoomTemp}°C
                </label>
                <input
                  type="range"
                  min="18"
                  max="28"
                  step="0.5"
                  value={newRoomTemp}
                  onChange={(e) => setNewRoomTemp(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
                ℹ️ Standard IoT hardware suite (Smart AC, Smart Heater, Thermostat, Temp & Occupancy Sensors) will be automatically provisioned for this room.
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-glow-cyan transition-all"
              >
                {creating ? 'Provisioning Zone...' : 'CREATE ROOM & PROVISION HARDWARE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
