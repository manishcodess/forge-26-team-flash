'use client';

import React, { useState } from 'react';
import {
  Settings,
  Database,
  CloudRain,
  Route,
  Key,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Shield,
  Server
} from 'lucide-react';

export default function SettingsPage() {
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<string>('BIHAR_MONSOON_DELUGE');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>System Architecture & Simulation Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Verify connected cloud infrastructure, meteorological APIs, and disaster scenario injection parameters.
        </p>
      </div>

      {/* Connectivity & Service Status */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Infrastructure & Provider Health</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Neon DB */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-white">PostgreSQL / Neon Cloud</div>
                <div className="text-[11px] text-slate-400">Drizzle ORM Connection Pool</div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>ONLINE</span>
            </span>
          </div>

          {/* Open-Meteo */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-white">Open-Meteo Weather API</div>
                <div className="text-[11px] text-slate-400">Real-time precipitation & wind</div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>CONNECTED</span>
            </span>
          </div>

          {/* OSRM Routing */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Route className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-semibold text-white">OSRM Routing Engine</div>
                <div className="text-[11px] text-slate-400">Distance, geometry & ETA engine</div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>STANDBY</span>
            </span>
          </div>

          {/* Gemini API */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-white">Gemini 2.5 Pro Copilot</div>
                <div className="text-[11px] text-slate-400">Function calling & tool registry</div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>CONFIGURED</span>
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Simulation Scenario Controls */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Emergency Drill & Scenario Injection</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
            DEMO MODE READY
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Inject predetermined crisis conditions to validate deterministic allocation, route hazard warnings, and warehouse reserve thresholds without requiring live flood events.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            {
              id: 'BIHAR_MONSOON_DELUGE',
              title: 'Catastrophic Kosi Deluge',
              desc: '168mm rainfall, 3 breached embankments, critical road inundations in Supaul & Darbhanga.',
            },
            {
              id: 'FLASH_CLOUDBURST',
              title: 'Localized Flash Inundation',
              desc: 'High-intensity cloudburst over Mithila belt; road culverts compromised.',
            },
            {
              id: 'BASELINE_MONITORING',
              title: 'Baseline Readiness Drill',
              desc: 'Standard monsoon baseline; all highway corridors open and navigable.',
            },
          ].map((scen) => (
            <div
              key={scen.id}
              onClick={() => setActiveScenario(scen.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                activeScenario === scen.id
                  ? 'bg-blue-600/15 border-blue-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-white mb-1">{scen.title}</div>
              <p className="text-[11px] leading-relaxed text-slate-400">{scen.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
          <span className="text-slate-400">Active Scenario: <strong className="text-cyan-400">{activeScenario}</strong></span>
          <button
            onClick={() => alert('Simulated emergency database re-seeded successfully!')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
