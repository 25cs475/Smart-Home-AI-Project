import React, { useState } from 'react';
import { Thermometer, Droplets, Users, CloudSun, Moon, Sun, Play, RotateCcw } from 'lucide-react';

interface EnvironmentControlsProps {
  initialTemp?: number;
  initialHumidity?: number;
  initialOccupancy?: number;
  initialWeather?: string;
  initialIsNight?: boolean;
  onApplyAndAnalyze?: (env: {
    temp: number;
    humidity: number;
    occupancy: number;
    weather: string;
    isNight: boolean;
  }) => void;
  onReset?: () => void;
  isLoading?: boolean;
}

export const EnvironmentControls: React.FC<EnvironmentControlsProps> = ({
  initialTemp = 32.0,
  initialHumidity = 68.0,
  initialOccupancy = 2,
  initialWeather = 'Hot / Sunny',
  initialIsNight = true,
  onApplyAndAnalyze,
  onReset,
  isLoading = false
}) => {
  const [temp, setTemp] = useState<number>(initialTemp);
  const [humidity, setHumidity] = useState<number>(initialHumidity);
  const [occupancy, setOccupancy] = useState<number>(initialOccupancy);
  const [weather, setWeather] = useState<string>(initialWeather);
  const [isNight, setIsNight] = useState<boolean>(initialIsNight);

  const weatherOptions = [
    'Hot / Sunny',
    'Cold / Snowy',
    'Rainy',
    'Cloudy',
    'Mild / Clear'
  ];

  const handleApply = () => {
    if (onApplyAndAnalyze) {
      onApplyAndAnalyze({
        temp,
        humidity,
        occupancy,
        weather,
        isNight
      });
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              ENVIRONMENT SENSOR INJECTOR
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                IoT Telemetry Simulation
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Tune simulated thermal inputs to test frame instantiation & rule firing</p>
          </div>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Benchmark</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Temperature Slider (15°C - 40°C) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Temperature</span>
            </div>
            <span className="text-sm font-mono font-bold text-amber-400">
              {temp.toFixed(1)}°C
            </span>
          </div>
          <input
            type="range"
            min="14"
            max="40"
            step="0.5"
            value={temp}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>14°C (Cold)</span>
            <span>28°C (Cooling trigger)</span>
            <span>40°C (Hot)</span>
          </div>
        </div>

        {/* Humidity Slider (20% - 90%) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Humidity</span>
            </div>
            <span className="text-sm font-mono font-bold text-cyan-400">
              {humidity.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            step="1"
            value={humidity}
            onChange={(e) => setHumidity(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>20% (Dry)</span>
            <span>70% (Moisture rule)</span>
            <span>95% (Humid)</span>
          </div>
        </div>

        {/* Occupancy Slider (0 - 10 people) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Occupancy</span>
            </div>
            <span className="text-sm font-mono font-bold text-violet-400">
              {occupancy} {occupancy === 1 ? 'person' : 'people'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            value={occupancy}
            onChange={(e) => setOccupancy(parseInt(e.target.value, 10))}
            className="w-full accent-violet-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0 (Triggers ECO)</span>
            <span>2 (Multi-user)</span>
            <span>8 (Crowded)</span>
          </div>
        </div>

        {/* Weather & Day/Night */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="mb-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-300" />
              <span>Outdoor Weather</span>
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {weatherOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              {isNight ? <Moon className="w-3.5 h-3.5 text-violet-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {isNight ? 'Night Mode' : 'Day Mode'}
            </span>
            <button
              onClick={() => setIsNight(!isNight)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                isNight
                  ? 'bg-violet-900/60 text-violet-300 border border-violet-500/40'
                  : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
              }`}
            >
              Toggle {isNight ? 'Day' : 'Night'}
            </button>
          </div>
        </div>
      </div>

      {/* Trigger AI Run Button */}
      <button
        onClick={handleApply}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-glow-cyan transition-all transform active:scale-[0.99]"
      >
        <Play className="w-4 h-4 fill-black" />
        <span>APPLY TELEMETRY & RUN AI REASONING PIPELINE</span>
      </button>
    </div>
  );
};
