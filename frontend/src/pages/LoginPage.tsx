import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Brain, ShieldCheck, Zap, Scale, Radio, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('owner@smarthome.ai');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('HOME_OWNER');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(email, password, name || 'Smart Resident', role);
        showToast('Registration Successful', 'Welcome to SmartHome AI Ecosystem', 'SUCCESS');
      } else {
        await login(email, password);
        showToast('Authentication Successful', 'System session authenticated', 'SUCCESS');
      }
      navigate('/dashboard');
    } catch (err: any) {
      showToast(
        'Authentication Failed',
        err.response?.data?.error || 'Invalid credentials or connection error',
        'ALERT'
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#090D16] text-white">
      {/* Left Feature Showcase Banner */}
      <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800 bg-[#0B0F19]">
        {/* Subtle glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-black font-extrabold shadow-glow-cyan">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider">SmartHome AI</h1>
              <p className="text-xs font-mono text-cyan-400">Context-Aware Climate Intelligence</p>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="my-10 relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Frame-Based AI & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                Multi-User Thermal Harmony
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-md">
              A situational cognitive agent resolving room occupancy, diurnal circadian cycles, weather dynamics, and conflicting multi-person preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <Zap className="w-5 h-5 text-cyan-400 mb-2" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Intelligent Climate Control</h3>
              <p className="text-[11px] text-slate-400 mt-1">Autonomous sense-reason-act loop targeting optimal comfort & energy efficiency.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-all">
              <Brain className="w-5 h-5 text-violet-400 mb-2" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Frame-Based AI</h3>
              <p className="text-[11px] text-slate-400 mt-1">Minsky situational frames with hierarchical inheritance (Home → Room → Leaf).</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
              <Scale className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Conflict Resolution</h3>
              <p className="text-[11px] text-slate-400 mt-1">5 game-theoretic algorithms to balance competing multi-occupant desires.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <Radio className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">IoT Monitoring</h3>
              <p className="text-[11px] text-slate-400 mt-1">Simulated smart AC, heater, thermostats, sensors, and manual override safety locks.</p>
            </div>
          </div>
        </div>

        {/* Footer Academic Label */}
        <div className="relative z-10 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>AI Project: Knowledge Representation & Reasoning</span>
          <span>v1.0.0 Production</span>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="md:w-1/2 p-8 md:p-14 flex items-center justify-center relative">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800/90 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              {isRegisterMode ? 'Create Residence Profile' : 'Sign In to Control Center'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegisterMode
                ? 'Register a new household resident or administrator'
                : 'Authenticate to access autonomous climate orchestration'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@smarthome.ai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                >
                  <option value="HOME_OWNER">Home Owner</option>
                  <option value="HOUSEHOLD_MEMBER">Household Member</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            )}

            {!isRegisterMode && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Password Reset', 'Contact local system administrator or use default seed password123.', 'INFO');
                  }}
                  className="text-cyan-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-glow-cyan transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 mt-4"
            >
              <span>{loading ? 'Processing...' : isRegisterMode ? 'Register Resident' : 'Authenticate Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            {isRegisterMode ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Need another resident account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Register
                </button>
              </span>
            )}
          </div>

          {/* 1-Click Demo Accounts */}
          <div className="mt-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-semibold">
              Instant Demo Accounts (Click to Fill)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('owner@smarthome.ai')}
                className="text-left p-2 rounded bg-slate-900 hover:bg-slate-800 text-[11px] border border-slate-800 text-slate-300"
              >
                <div className="font-semibold text-white">House Owner</div>
                <div className="text-[10px] text-cyan-400 font-mono">owner@smarthome.ai</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('member@smarthome.ai')}
                className="text-left p-2 rounded bg-slate-900 hover:bg-slate-800 text-[11px] border border-slate-800 text-slate-300"
              >
                <div className="font-semibold text-white">Family Member</div>
                <div className="text-[10px] text-violet-400 font-mono">member@smarthome.ai</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
