'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Users,
  Package,
  Truck,
  ArrowUpRight,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Droplet,
  Compass,
  CheckCircle2,
  Bot
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
} from 'recharts';
import { api } from '@/lib/api';
import { Incident, Warehouse, InventoryItem, ReliefOrder } from '@/types';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [orders, setOrders] = useState<ReliefOrder[]>(mockOrders);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getIncidents().catch(() => mockIncidents),
      api.getWarehouses().catch(() => mockWarehouses),
      api.getInventory().catch(() => mockInventory),
      api.getOrders().catch(() => mockOrders),
    ]).then(([incData, whData, invData, ordData]) => {
      if (!isMounted) return;
      if (Array.isArray(incData) && incData.length > 0) setIncidents(incData);
      if (Array.isArray(whData) && whData.length > 0) setWarehouses(whData);
      if (Array.isArray(invData) && invData.length > 0) setInventory(invData);
      if (Array.isArray(ordData) && ordData.length > 0) setOrders(ordData);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryIncident = incidents[0] || mockIncidents[0];
  const totalPopulation = incidents.reduce((sum, inc) => sum + inc.affectedPopulationTotal, 0);
  const totalFoodPackets = inventory
    .filter((item) => item.category === 'FOOD')
    .reduce((sum, item) => sum + item.quantityAvailable, 0);
  const totalWaterLiters = inventory
    .filter((item) => item.category === 'WATER')
    .reduce((sum, item) => sum + item.quantityAvailable, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PENDING_APPROVAL' || o.status === 'DRAFT'
  ).length;

  // Inventory chart data
  const inventoryChartData = warehouses.map((wh) => {
    const food = inventory
      .filter((i) => i.warehouseId === wh.id && i.category === 'FOOD')
      .reduce((s, i) => s + i.quantityAvailable, 0);
    const water = inventory
      .filter((i) => i.warehouseId === wh.id && i.category === 'WATER')
      .reduce((s, i) => s + i.quantityAvailable, 0);
    return {
      name: wh.district,
      Rations: food,
      WaterLiters: Math.round(water / 10), // scaled for clear visualization
    };
  });

  return (
    <div className="space-y-6">
      {/* Active Incident Alert Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{primaryIncident.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                Active Event
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Rainfall in Kosi Basin: <span className="font-semibold text-white">{primaryIncident.rainfallPast24hMm}mm / 24h</span> • Embankments monitored in Supaul & Madhubani.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href="/relief-plans"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Relief Plan</span>
          </Link>
          <Link
            href="/map"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Relief Map</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{incidents.length}</span>
            <span className="text-xs font-medium text-slate-400">Flood Zones</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">28 vulnerable village clusters</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Affected Population</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{formatNumber(totalPopulation)}</span>
            <span className="text-xs font-medium text-amber-400/90">People</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">5 priority sectors identified</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Relief Rations Available</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{formatNumber(totalFoodPackets)}</span>
            <span className="text-xs text-slate-400">Food Packs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{formatNumber(totalWaterLiters)}L drinking water ready</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Relief Orders</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Truck className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{orders.length}</span>
            <span className="text-xs font-semibold text-amber-400">{pendingOrdersCount} Pending Review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct dispatch from staging depots</p>
        </div>
      </div>

      {/* Main Grid: Visual Analytics + High-Risk Villages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Warehouse Capacity & Priority Villages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Distribution Chart */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Relief Hub Inventory Stockpile</h2>
                <p className="text-xs text-slate-400">Available food rations and water reserves across staging hubs</p>
              </div>
              <Link href="/inventory" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>View Inventory</span>
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
                  <Bar dataKey="Rations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Food Packs" />
                  <Bar dataKey="WaterLiters" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Water (x10 L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Urgent Affected Locations Roster */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">High Urgency Affected Areas</h2>
                <p className="text-xs text-slate-400">Ground demand reports from active disaster zones</p>
              </div>
              <Link href="/incidents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>All Locations</span>
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
                        {loc.district}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {formatNumber(loc.populationAffected)} people
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Droplet className="w-3.5 h-3.5" />
                        {formatNumber(loc.requiredDrinkingWaterLiters)}L water
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Package className="w-3.5 h-3.5" />
                        {formatNumber(loc.requiredFoodPackets)} rations
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
                      title="Run allocation for this area"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Copilot Quick Panel & Activity Feed */}
        <div className="space-y-6">
          {/* AI Copilot Quick Panel */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">ResQ Copilot</h3>
                <p className="text-[11px] text-slate-400">AI Relief Assistant</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-cyan-300 mb-1">Operational Summary:</p>
              Darbhanga settlement has critical water demand with submerged road access. Dispatching via Muzaffarpur depot recommended.
            </div>

            <div className="space-y-2">
              <Link
                href="/ai-assistant"
                className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <span>Ask ResQ Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/orders"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Manage Relief Orders</span>
              </Link>
            </div>
          </div>

          {/* Recent Operations Activity Feed */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recent Activity</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="border-l-2 border-emerald-500 pl-3 py-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Order Dispatched</span>
                  <span>1h ago</span>
                </div>
                <p className="text-slate-300 font-medium mt-0.5">Convoy BR-06-GB-4819 en route to Madhubani Relief Camp.</p>
              </div>

              <div className="border-l-2 border-blue-500 pl-3 py-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Allocation Plan Run</span>
                  <span>3h ago</span>
                </div>
                <p className="text-slate-300 font-medium mt-0.5">Resource distribution optimized for Darbhanga & Supaul.</p>
              </div>

              <div className="border-l-2 border-amber-500 pl-3 py-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Weather Telemetry</span>
                  <span>5h ago</span>
                </div>
                <p className="text-slate-300 font-medium mt-0.5">Heavy rainfall logged in Kosi catchment (142mm).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
