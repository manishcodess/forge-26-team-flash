'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  Building2,
  Boxes,
  Cpu,
  Truck,
  Bot,
  Settings,
  ShieldAlert,
  Radio,
  FileText
} from 'lucide-react';

const navigationItems = [
  { name: 'Operations Center', href: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
  { name: 'Crisis Incidents', href: '/incidents', icon: AlertTriangle, badge: '2 Active' },
  { name: 'GIS Tactical Map', href: '/map', icon: Map },
  { name: 'Relief Hubs', href: '/warehouses', icon: Building2 },
  { name: 'Stock Inventory', href: '/inventory', icon: Boxes },
  { name: 'Allocation Engine', href: '/relief-plans', icon: Cpu, badge: 'Solver' },
  { name: 'Dispatch & Orders', href: '/orders', icon: Truck, badge: '1 Pending' },
  { name: 'AI Copilot Agent', href: '/ai-assistant', icon: Bot, isSpecial: true },
  { name: 'System & Simulation', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950/80 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-40 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/70 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 via-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">ResQFlow</span>
              <span className="text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded uppercase">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Bihar Flood Operations</p>
          </div>
        </Link>
      </div>

      {/* Emergency Status Banner */}
      <div className="mx-3 my-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 flex items-start gap-2.5">
        <div className="mt-0.5 relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </div>
        <div className="text-xs">
          <div className="font-semibold text-rose-300">Level 4 Red Alert</div>
          <div className="text-[11px] text-rose-400/80">Kosi Basin Embankment Inundation</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Command Modules
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : item.isSpecial
                  ? 'text-cyan-300 hover:bg-cyan-950/30 hover:text-cyan-200 border border-cyan-500/20 bg-cyan-950/10'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : item.isSpecial ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    item.badge.includes('Active')
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.badge.includes('Pending')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Operator Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white">
            MS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Officer M. Sharma</p>
            <p className="text-[10px] text-slate-400 truncate">Disaster Operations Lead</p>
          </div>
          <Radio className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
