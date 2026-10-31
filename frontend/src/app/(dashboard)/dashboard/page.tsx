'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Users,
  Package,
  Truck,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Droplet,
  HeartPulse,
  Compass,
  CheckCircle2
} from 'lucide-react';
import {
  mockIncidents,
  mockWarehouses,
  mockAffectedLocations,
  mockOrders,
  mockInventory
} from '@/lib/mockData';
import { formatNumber, getUrgencyBadgeClasses, getStatusBadgeClasses } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function DashboardPage() {
  const primaryIncident = mockIncidents[0];
  const totalPopulation = mockIncidents.reduce((sum, inc) => sum + inc.affectedPopulationTotal, 0);
  const totalFoodPackets = mockInventory
    .filter((item) => item.category === 'FOOD')
    .reduce((sum, item) => sum + item.quantityAvailable, 0);
  const totalWaterLiters = mockInventory
    .filter((item) => item.category === 'WATER')
    .reduce((sum, item) => sum + item.quantityAvailable, 0);

  // Inventory chart data
  const inventoryChartData = mockWarehouses.map((wh) => {
    const food = mockInventory
      .filter((i) => i.warehouseId === wh.id && i.category === 'FOOD')
      .reduce((s, i) => s + i.quantityAvailable, 0);
    const water = mockInventory
      .filter((i) => i.warehouseId === wh.id && i.category === 'WATER')
      .reduce((s, i) => s + i.quantityAvailable, 0);
    return {
      name: wh.district,
      Rations: food,
      WaterLiters: Math.round(water / 10), // scaled for visualization
    };
  });

  const urgencyDistribution = [
    { name: 'Critical', value: 2, color: '#ef4444' },
    { name: 'High', value: 2, color: '#f59e0b' },
    { name: 'Medium', value: 1, color: '#eab308' },
    { name: 'Low', value: 0, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Critical Alert Flash Header */}
      <div className="glass-panel-critical p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 pulse-critical">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-200 text-sm">{primaryIncident.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-500 text-white uppercase tracking-wider">
                ACTIVE CRISIS
              </span>
            </div>
            <p className="text-xs text-rose-300/80 mt-0.5">
              Rainfall in Kosi Catchment: <span className="font-semibold text-white">{primaryIncident.rainfallPast24hMm}mm / 24h</span> • 3 Embankments compromised in Supaul & Madhubani.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href="/relief-plans"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Relief Plan</span>
          </Link>
          <Link
            href="/map"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-all"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>View Map</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{mockIncidents.length}</span>
            <span className="text-xs font-semibold text-rose-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> High River Runoff
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">28 vulnerable flood sectors</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Affected Population</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{formatNumber(totalPopulation)}</span>
            <span className="text-xs font-medium text-amber-400/90">Estimated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">5 acute priority zones identified</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Relief Stock Ready</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{formatNumber(totalFoodPackets)}</span>
            <span className="text-xs text-slate-400">Rations</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{formatNumber(totalWaterLiters)}L potable drinking water</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Order Dispatch Status</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Truck className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{mockOrders.length}</span>
            <span className="text-xs font-semibold text-amber-400">1 Pending Review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1 active convoy en route</p>
        </div>
      </div>

      {/* Main Grid: Visual Analytics + High-Risk Villages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Warehouse Capacity & Priority Villages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Distribution Chart */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Relief Hub Inventory Stockpile</h2>
                <p className="text-xs text-slate-400">Available food rations and water reserves across primary staging hubs</p>
              </div>
              <Link href="/inventory" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>View Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Rations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Food Packs (72h)" />
                  <Bar dataKey="WaterLiters" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Water (x10 L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Urgent Affected Locations Roster */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Critical & High Urgency Locations</h2>
                <p className="text-xs text-slate-400">Real-time demand telemetry from Bihar ground personnel</p>
              </div>
              <Link href="/incidents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>Manage Locations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {mockAffectedLocations.slice(0, 3).map((loc) => (
                <div
                  key={loc.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-xs">{loc.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getUrgencyBadgeClasses(loc.urgencyLevel)}`}>
                        {loc.urgencyLevel}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {loc.district} Dist.
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {formatNumber(loc.populationAffected)} affected
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Droplet className="w-3.5 h-3.5" />
                        {formatNumber(loc.requiredDrinkingWaterLiters)}L water req.
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Package className="w-3.5 h-3.5" />
                        {formatNumber(loc.requiredFoodPackets)} rations req.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-md border font-medium ${
                        loc.accessRoadStatus === 'COMPLETELY_FLOODED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : loc.accessRoadStatus === 'WATERLOGGED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {loc.accessRoadStatus.replace('_', ' ')}
                    </span>
                    <Link
                      href="/relief-plans"
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30"
                      title="Generate Plan for this location"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Assistant Quick Action & Audit Activity Feed */}
        <div className="space-y-6">
          {/* AI Copilot Quick Panel */}
          <div className="glass-panel-accent p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">ResQFlow AI Copilot</h3>
                <p className="text-[11px] text-cyan-200/80">Autonomous Operational Intelligence</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
              <p className="font-medium text-cyan-300 mb-1">Recommended Action:</p>
              Darbhanga settlement (loc-dar-02) has acute critical water deficit. Road SH-88 is submerged. Immediate boat dispatch recommended from Hayaghat.
            </div>

            <div className="space-y-2">
              <Link
                href="/ai-assistant"
                className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <span>Open Operations Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/orders"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Review Pending Orders (1)</span>
              </Link>
            </div>
          </div>

          {/* Recent Operations Audit Feed */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Operations Audit</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="border-l-2 border-emerald-500 pl-3 py-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Order ORD-2026-001 Dispatched</span>
                  <span>1h ago</span>
                </div>
                <p className="text-slate-300 font-medium mt-0.5">Truck BR-06-GB-4819 en route to Madhubani Relief Camp 2.</p>
              </div>

              <div className="border-l-2 border-amber-500 pl-3 py-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>AI Solver Generated Plan</span>
                  <span>3h ago</span>
                </div>
                <p className="text-slate-300 font-medium mt-0.5">Relief plan plan-opt-01 synthesized for Darbhanga & Supaul.</p>
              </div>

              <div className="border-l-2 border-rose-500 pl-3 py-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Flood Telemetry Ingestion</span>
                  <span>5h ago</span>
                </div>
                <p className="text-slate-300 font-medium mt-0.5">Precipitation sensor logged 168mm in Supaul catchment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
