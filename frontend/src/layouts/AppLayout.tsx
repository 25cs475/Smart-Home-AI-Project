import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Thermometer,
  Home,
  Users,
  Layers,
  Brain,
  Scale,
  Radio,
  Sliders,
  Zap,
  History,
  Settings,
  Sparkles,
  RotateCcw,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { notificationService, simulationService } from '../services/api';
import { NotificationItem } from '../types';
import { PresentationModeModal } from '../components/PresentationModeModal';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await notificationService.getAll();
        setNotifications(res.notifications || []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResetSimulation = async () => {
    try {
      setIsResetting(true);
      await simulationService.resetSimulation();
      showToast('Simulation Benchmark Reset', 'Restored 32°C, 2 occupants, 8 PM, default AC/Heater states.', 'SUCCESS');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      showToast('Reset Failed', 'Unable to reset simulation', 'ALERT');
    } finally {
      setIsResetting(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/environment', label: 'Environment Monitor', icon: <Thermometer className="w-4 h-4" /> },
    { to: '/rooms', label: 'Room Management', icon: <Home className="w-4 h-4" /> },
    { to: '/preferences', label: 'Household & Prefs', icon: <Users className="w-4 h-4" /> },
    { to: '/frames', label: 'Knowledge Frames', icon: <Layers className="w-4 h-4 text-violet-400" /> },
    { to: '/ai-engine', label: 'AI Decision Engine', icon: <Brain className="w-4 h-4 text-cyan-400" /> },
    { to: '/conflicts', label: 'Conflict Resolution', icon: <Scale className="w-4 h-4 text-amber-400" /> },
    { to: '/devices', label: 'IoT Device Rack', icon: <Radio className="w-4 h-4" /> },
    { to: '/simulation', label: 'Scenario Simulator', icon: <Sliders className="w-4 h-4 text-cyan-300" /> },
    { to: '/energy', label: 'Energy Analytics', icon: <Zap className="w-4 h-4 text-emerald-400" /> },
    { to: '/history', label: 'Decision History', icon: <History className="w-4 h-4" /> },
    { to: '/settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans">
      {/* Presentation Mode Fullscreen Overlay */}
      <PresentationModeModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />

      {/* Futuristic Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-xl flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow-cyan text-black font-extrabold">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-wider text-white">
                SmartHome <span className="text-cyan-400">AI</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Contextual Climate
              </div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Presentation Mode Direct Button */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => setIsPresentationOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-cyan-600/30 hover:from-violet-600/50 hover:to-cyan-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shadow-glow-cyan/20 transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>PRESENTATION MODE</span>
          </button>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs border border-slate-700">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'House Owner'}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate">{user?.role || 'HOME_OWNER'}</div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="glass-panel border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-cyan" />
              <span className="text-slate-300 font-semibold hidden sm:inline">SYSTEM ONLINE</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-cyan-400 hidden md:inline">Autonomous Climate Agent Active</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Reset Simulation Benchmark Button */}
            <button
              onClick={handleResetSimulation}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 font-mono transition-all"
              title="Reset environment to 32°C, 2 people, 8 PM benchmark"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Reset Simulation</span>
            </button>

            {/* Presentation Mode Quick Trigger */}
            <button
              onClick={() => setIsPresentationOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-violet-500/20 border border-violet-500/40 hover:bg-violet-500/30 text-xs font-mono text-violet-300 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Demo Mode</span>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-black font-extrabold text-[9px] flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel border border-slate-800 shadow-2xl p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-bold text-white font-mono uppercase">System Notifications</span>
                    <button
                      onClick={async () => {
                        await notificationService.clearAll();
                        setNotifications([]);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            n.type === 'ALERT'
                              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                              : n.type === 'WARNING'
                              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="font-semibold text-white">{n.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-grid-pattern">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
