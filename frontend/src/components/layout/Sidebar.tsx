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
  ShieldCheck,
  Radio
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Active Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Relief Map', href: '/map', icon: Map },
  { name: 'Warehouses', href: '/warehouses', icon: Building2 },
  { name: 'Stock Inventory', href: '/inventory', icon: Boxes },
  { name: 'Allocation Engine', href: '/relief-plans', icon: Cpu },
  { name: 'Orders & Dispatch', href: '/orders', icon: Truck },
  { name: 'AI Copilot', href: '/ai-assistant', icon: Bot, isSpecial: true },
  { name: 'System Status', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950/90 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-40 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/70 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">ResQ</span>
              <span className="text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded uppercase">
                Relief
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Disaster Logistics Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-3">
        <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Operations
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
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
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Team Flash</p>
            <p className="text-[10px] text-slate-400 truncate">GenAI Buildathon 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
