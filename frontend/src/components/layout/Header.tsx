'use client';

import React, { useState, useEffect } from 'react';
import { api, HealthResponse } from '@/lib/api';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = 'Disaster Relief Operations',
  subtitle = 'Resource allocation & emergency logistics',
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Check API health status
    let isMounted = true;
    api
      .checkHealth()
      .then(() => {
        if (isMounted) setApiOnline(true);
      })
      .catch(() => {
        if (isMounted) setApiOnline(false);
      });

    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Title & Section */}
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Telemetry & Status Badges */}
        <div className="flex items-center gap-3">
          {/* API Connectivity Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              apiOnline === true
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : apiOnline === false
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title={
              apiOnline === true
                ? 'Connected to ResQ Backend API'
                : 'Using Local In-Memory Fallback'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiOnline === true
                  ? 'bg-emerald-400'
                  : apiOnline === false
                  ? 'bg-amber-400'
                  : 'bg-slate-500 animate-pulse'
              }`}
            />
            <span>{apiOnline === true ? 'API Connected' : apiOnline === false ? 'Local Demo Mode' : 'Connecting...'}</span>
          </div>

          {/* Time Display */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeStr || '12:00:00 IST'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
