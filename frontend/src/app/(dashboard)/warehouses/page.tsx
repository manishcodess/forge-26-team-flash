'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Truck,
  Ship,
  Phone,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { mockWarehouses, mockInventory } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

export default function WarehousesPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Relief Logistics Hubs & Staging Warehouses</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational status, square footage capacity, and assigned heavy transport assets across Bihar relief centers.
          </p>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Package className="w-4 h-4" />
          <span>Manage Stock Ledger</span>
        </Link>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockWarehouses.map((wh) => {
          const warehouseItems = mockInventory.filter((item) => item.warehouseId === wh.id);
          const totalStock = warehouseItems.reduce((acc, i) => acc + i.quantityAvailable, 0);

          return (
            <div
              key={wh.id}
              className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                      {wh.code}
                    </span>
                    <span className="text-xs font-bold text-slate-300">{wh.district} Hub</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Operational</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2 leading-snug">{wh.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{wh.address}</span>
                </p>

                {/* Storage Capacity Bar */}
                <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Capacity Utilized</span>
                    <span className="font-bold text-white">{wh.utilizedCapacityPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        wh.utilizedCapacityPercent > 75
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${wh.utilizedCapacityPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">
                    {formatNumber(wh.totalCapacitySqft)} sq ft total storage
                  </div>
                </div>

                {/* Assigned Transport Fleet */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold text-white">{wh.availableVehicles}</div>
                      <div className="text-[10px] text-slate-400">4x4 Trucks</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                    <Ship className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">{wh.availableRescueBoats}</div>
                      <div className="text-[10px] text-slate-400">Rescue Boats</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {wh.contactPhone}
                </span>
                <Link
                  href="/inventory"
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <span>View Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
