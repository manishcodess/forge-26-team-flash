'use client';

import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Flame,
  Bell,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = 'Emergency Operations Command', subtitle = 'State Disaster Management Authority (SDMA) • Bihar Grid' }: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isSimulation, setIsSimulation] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata'
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Title & Division */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">{title}</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              STATION-01
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Tactical Telemetry & Simulation Controls */}
        <div className="flex items-center gap-3">
          {/* Weather Widget */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-400">Open-Meteo Telemetry: </span>
              <span className="text-cyan-300 font-semibold">142.5mm / 24h</span>
              <span className="text-slate-400 text-[10px] ml-1">(Kosi River Basin)</span>
            </div>
          </div>

          {/* Simulation vs Real Toggle Badge */}
          <button
            onClick={() => setIsSimulation(!isSimulation)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isSimulation
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Toggle between live telemetry and simulated emergency scenario"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isSimulation ? 'SIMULATION MODE (Bihar 2026)' : 'LIVE TELEMETRY'}</span>
          </button>

          {/* Live System Time */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{timeStr || '12:00:00 IST'}</span>
          </div>

          {/* Alert Notification Button */}
          <button className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
