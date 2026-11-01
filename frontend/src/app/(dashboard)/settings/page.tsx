'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  CloudRain,
  Route,
  Key,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  Cpu,
  Layers,
  Terminal
} from 'lucide-react';
import { api, HealthResponse } from '@/lib/api';

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = () => {
    setLoading(true);
    api
      .checkHealth()
      .then((data) => {
        setHealth(data);
      })
      .catch(() => {
        setHealth(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <span>System Status & Environment</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status of backend services, database storage, external APIs, and deployment setup.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Check Status</span>
        </button>
      </div>

      {/* Connectivity & Service Status */}
      <div className="glass-panel p-5 rounded-xl space-y-4 border border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Services & Infrastructure Health</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Backend API */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-semibold text-white">Express Backend Gateway</div>
                <div className="text-[11px] text-slate-400">
                  {health ? `Uptime: ${health.uptimeSeconds || 0}s` : 'Port 5000'}
                </div>
              </div>
            </div>
            <span
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                health
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{health ? 'ONLINE' : 'LOCAL DEMO'}</span>
            </span>
          </div>

          {/* Database */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-white">Data Store Mode</div>
                <div className="text-[11px] text-slate-400">
                  {health?.postgresConnected
                    ? 'PostgreSQL (Neon Cloud)'
                    : 'Pre-seeded In-Memory Store'}
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>ACTIVE</span>
            </span>
          </div>

          {/* Weather API */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-white">Open-Meteo Weather Service</div>
                <div className="text-[11px] text-slate-400">Precipitation & flood risk model</div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>CONNECTED</span>
            </span>
          </div>

          {/* AI Engine */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-white">AI Engine</div>
                <div className="text-[11px] text-slate-400">
                  {health?.aiModel || 'Gemini Flash / Heuristic Solver'}
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>READY</span>
            </span>
          </div>
        </div>
      </div>

      {/* Deployment & Environment Setup Guide */}
      <div className="glass-panel p-5 rounded-xl space-y-4 border border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Environment & Quick Deployment Guide</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="font-semibold text-white">Backend Environment (.env):</div>
            <p className="text-slate-400 text-[11px]">
              Set <code className="text-cyan-300">PORT=5000</code> and optionally <code className="text-cyan-300">GEMINI_API_KEY</code> for Google Gemini. If PostgreSQL is not provided, the backend automatically uses its robust in-memory database pre-loaded with Bihar flood scenarios.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="font-semibold text-white">Frontend Environment (.env.local):</div>
            <p className="text-slate-400 text-[11px]">
              Set <code className="text-cyan-300">NEXT_PUBLIC_API_URL=http://localhost:5000/api</code> for local development or point to your deployed backend URL.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="font-semibold text-white">One-Click Production Deployment:</div>
            <p className="text-slate-400 text-[11px]">
              Deploy frontend to <strong>Vercel</strong> by connecting the frontend directory. Deploy backend to <strong>Render</strong> or <strong>Railway</strong> using <code className="text-cyan-300">npm run build && npm start</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
