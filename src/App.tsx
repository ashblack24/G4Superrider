import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  BatteryCharging, 
  Zap, 
  Navigation, 
  Compass, 
  ShieldAlert, 
  Play, 
  Square, 
  Settings, 
  Activity, 
  Flame, 
  Radio, 
  Sliders, 
  ArrowUpRight, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  GitBranch,
  Github
} from 'lucide-react';

interface RideLog {
  id: string;
  date: string;
  distance: string;
  duration: string;
  avgSpeed: string;
  topSpeed: string;
  mode: string;
}

export default function App() {
  const [isRiding, setIsRiding] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(1200);
  const [gear, setGear] = useState('N');
  const [battery, setBattery] = useState(92);
  const [rideMode, setRideMode] = useState<'ECO' | 'STREET' | 'SPORT' | 'TRACK'>('SPORT');
  const [absEnabled, setAbsEnabled] = useState(true);
  const [tcLevel, setTcLevel] = useState(2); // 1-3
  const [headlight, setHeadlight] = useState(true);
  const [leanAngle, setLeanAngle] = useState(0);
  const [tripDistance, setTripDistance] = useState(14.8);
  const [tripTime, setTripTime] = useState(1320); // in seconds

  const [logs] = useState<RideLog[]>([
    {
      id: '1',
      date: 'Today, 08:30 AM',
      distance: '24.6 km',
      duration: '32 min',
      avgSpeed: '46.1 km/h',
      topSpeed: '118 km/h',
      mode: 'SPORT',
    },
    {
      id: '2',
      date: 'Yesterday, 06:15 PM',
      distance: '18.2 km',
      duration: '27 min',
      avgSpeed: '40.4 km/h',
      topSpeed: '94 km/h',
      mode: 'STREET',
    },
    {
      id: '3',
      date: 'Sep 2, 2026',
      distance: '42.0 km',
      duration: '54 min',
      avgSpeed: '52.3 km/h',
      topSpeed: '135 km/h',
      mode: 'TRACK',
    },
  ]);

  // Simulation loop for dynamic telemetry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRiding) {
      interval = setInterval(() => {
        setSpeed((prev) => {
          const delta = (Math.random() - 0.45) * 8;
          const next = Math.max(15, Math.min(140, prev + delta));
          return Math.round(next);
        });

        setRpm((prev) => {
          const delta = (Math.random() - 0.48) * 450;
          return Math.round(Math.max(2200, Math.min(10500, prev + delta)));
        });

        setLeanAngle((prev) => {
          const delta = (Math.random() - 0.5) * 6;
          return Math.round(Math.max(-38, Math.min(38, prev + delta)));
        });

        setTripDistance((prev) => Number((prev + 0.02).toFixed(2)));
        setTripTime((prev) => prev + 1);
      }, 800);
    } else {
      setSpeed(0);
      setRpm(1100);
      setLeanAngle(0);
    }
    return () => clearInterval(interval);
  }, [isRiding]);

  useEffect(() => {
    if (!isRiding) {
      setGear('N');
    } else if (speed < 25) {
      setGear('1');
    } else if (speed < 45) {
      setGear('2');
    } else if (speed < 70) {
      setGear('3');
    } else if (speed < 95) {
      setGear('4');
    } else if (speed < 120) {
      setGear('5');
    } else {
      setGear('6');
    }
  }, [speed, isRiding]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div id="g4-root" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header id="g4-header" className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-black tracking-wider shadow-lg shadow-amber-500/20 text-lg">
              G4
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">SUPERRIDER</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                  v4.2 PRO
                </span>
              </div>
              <p className="text-xs text-zinc-400">Intelligent Motorcycle Cockpit & Telemetry</p>
            </div>
          </div>

          {/* Center Modes */}
          <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
            {(['ECO', 'STREET', 'SPORT', 'TRACK'] as const).map((m) => (
              <button
                key={m}
                id={`mode-btn-${m.toLowerCase()}`}
                onClick={() => setRideMode(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  rideMode === m
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-300">ECU Online</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-zinc-200">{battery}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="g4-main" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Quick Launch & Status Bar */}
        <section id="ride-control-panel" className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              id="ride-toggle-btn"
              onClick={() => setIsRiding(!isRiding)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                isRiding
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/25'
              }`}
            >
              {isRiding ? (
                <>
                  <Square className="w-4 h-4 fill-current" /> Stop Session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start Ride
                </>
              )}
            </button>

            <div className="text-xs space-y-0.5">
              <div className="text-zinc-400">Current Status</div>
              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRiding ? 'bg-amber-400' : 'bg-zinc-500'}`} />
                {isRiding ? 'Telemetry Active (Live Feed)' : 'Engine Idle / Standby'}
              </div>
            </div>
          </div>

          {/* Quick Hardware Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="abs-toggle-btn"
              onClick={() => setAbsEnabled(!absEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                absEnabled 
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' 
                  : 'border-zinc-800 bg-zinc-900 text-zinc-500'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              ABS {absEnabled ? 'ACTIVE' : 'OFF'}
            </button>

            <button
              id="tc-level-btn"
              onClick={() => setTcLevel((prev) => (prev % 3) + 1)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-amber-500/40 bg-amber-500/10 text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              TC LVL {tcLevel}
            </button>

            <button
              id="light-toggle-btn"
              onClick={() => setHeadlight(!headlight)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                headlight 
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' 
                  : 'border-zinc-800 bg-zinc-900 text-zinc-500'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              BEAM {headlight ? 'HI' : 'LOW'}
            </button>
          </div>
        </section>

        {/* Primary Telemetry Cluster */}
        <section id="telemetry-cluster" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Speedometer & Tachometer */}
          <div className="lg:col-span-2 bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
            {/* Speed Display */}
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-1 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-500" /> Digital Cockpit
              </div>
              
              <div className="flex items-baseline justify-center gap-2 my-2">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-white tabular-nums">
                  {speed}
                </span>
                <span className="text-xl md:text-2xl font-bold text-zinc-500">KM/H</span>
              </div>

              {/* Gear Indicator */}
              <div className="flex items-center gap-3 mt-1">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border-2 border-amber-500/60 flex items-center justify-center text-2xl font-black text-amber-400 shadow-lg shadow-amber-500/10">
                  {gear}
                </div>
                <div className="text-left text-xs">
                  <div className="text-zinc-500 font-mono">ENGAGED GEAR</div>
                  <div className="text-zinc-300 font-semibold">{rideMode} MAPPING</div>
                </div>
              </div>
            </div>

            {/* Tachometer RPM Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>0 RPM</span>
                <span className="text-amber-400 font-bold">{rpm} RPM</span>
                <span className="text-rose-500">11,000 REDLINE</span>
              </div>
              <div className="w-full h-3.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600"
                  style={{ width: `${Math.min(100, (rpm / 11000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Lean Angle & G-Force Meter */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-zinc-800/80 rounded-xl text-amber-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Lean Angle</div>
                  <div className="text-xl font-bold text-white tabular-nums font-mono">
                    {leanAngle > 0 ? `+${leanAngle}° R` : leanAngle < 0 ? `${leanAngle}° L` : '0° C'}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-zinc-800/80 rounded-xl text-cyan-400">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Trip Distance</div>
                  <div className="text-xl font-bold text-white tabular-nums font-mono">
                    {tripDistance} km
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Telemetry & Vital Checks */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* System Diagnostics */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Powertrain Vitals
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Coolant Temp</span>
                  <span className="font-mono font-medium text-emerald-400">84°C (Nominal)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Front TPMS</span>
                  <span className="font-mono font-medium text-zinc-200">2.4 Bar / 35 PSI</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Rear TPMS</span>
                  <span className="font-mono font-medium text-zinc-200">2.7 Bar / 39 PSI</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Throttle Response</span>
                  <span className="font-mono font-medium text-amber-400">Dynamic Track</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-zinc-400">Session Clock</span>
                  <span className="font-mono font-medium text-white">{formatTime(tripTime)}</span>
                </div>
              </div>
            </div>

            {/* Quick Repository / Deployment Info */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-950/20 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">G4Superrider Repo</h4>
                  <p className="text-xs text-zinc-400 font-mono">ashblack24 / G4Superrider</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Full-stack responsive telemetry suite ready for deployment, rider dashboard monitoring, and mobile mount displays.
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <GitBranch className="w-3.5 h-3.5" /> Branch: main
                </span>
                <span className="font-mono">Git Sync Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Historic Rides & Performance Logs */}
        <section id="ride-history-panel" className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Recent Riding Telemetry Logs
              </h2>
              <p className="text-xs text-zinc-400">Stored sessions from ECU onboard memory</p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-lg border border-zinc-700/50">
              3 Trips Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs uppercase bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Session</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Avg Speed</th>
                  <th className="py-3 px-4">Top Speed</th>
                  <th className="py-3 px-4 rounded-r-lg">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-white">{log.date}</td>
                    <td className="py-3.5 px-4 text-zinc-200">{log.distance}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{log.duration}</td>
                    <td className="py-3.5 px-4 text-amber-400">{log.avgSpeed}</td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">{log.topSpeed}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-sans text-[11px] font-semibold">
                        {log.mode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="g4-footer" className="border-t border-zinc-900 bg-zinc-950 py-4 px-6 text-center text-xs text-zinc-600">
        <p>G4Superrider • High-Performance Motorcycle Telemetry Cockpit • ashblack24</p>
      </footer>
    </div>
  );
}
