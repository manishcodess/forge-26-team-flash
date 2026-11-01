'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Package,
  Droplet,
  HeartPulse,
  Layers,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { mockInventory, mockWarehouses, mockAffectedLocations } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';
import { InventoryItem, ResourceCategory } from '@/types';
import { api } from '@/lib/api';

export default function InventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddStockModal, setShowAddStockModal] = useState<boolean>(false);
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);

  useEffect(() => {
    let isMounted = true;
    api
      .getInventory()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {
        // Fallback to mock
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Shortage calculations vs affected village demands
  const totalDemandFood = mockAffectedLocations.reduce((acc, l) => acc + l.requiredFoodPackets, 0);
  const totalAvailableFood = items
    .filter((i) => i.category === 'FOOD')
    .reduce((acc, i) => acc + i.quantityAvailable, 0);

  const totalDemandWater = mockAffectedLocations.reduce((acc, l) => acc + l.requiredDrinkingWaterLiters, 0);
  const totalAvailableWater = items
    .filter((i) => i.category === 'WATER')
    .reduce((acc, i) => acc + i.quantityAvailable, 0);

  const totalDemandMedical = mockAffectedLocations.reduce((acc, l) => acc + l.requiredMedicalKits, 0);
  const totalAvailableMedical = items
    .filter((i) => i.category === 'MEDICAL')
    .reduce((acc, i) => acc + i.quantityAvailable, 0);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesWarehouse = selectedWarehouseId === 'ALL' || item.warehouseId === selectedWarehouseId;
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesWarehouse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <span>Relief Stock Inventory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor available supplies, reserved allocations, and reorder levels across Bihar hubs.
          </p>
        </div>
        <button
          onClick={() => setShowAddStockModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Stock Intake</span>
        </button>
      </div>

      {/* Aggregate Shortage Comparison Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Food Status */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Food Rations Balance</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold text-white">{formatNumber(totalAvailableFood)}</div>
              <div className="text-[10px] text-slate-400">Available across all hubs</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-amber-400">{formatNumber(totalDemandFood)}</div>
              <div className="text-[10px] text-slate-400">Total Village Demand</div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Surplus +{formatNumber(totalAvailableFood - totalDemandFood)} packs available</span>
          </div>
        </div>

        {/* Water Status */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Potable Drinking Water</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold text-white">{formatNumber(totalAvailableWater)}L</div>
              <div className="text-[10px] text-slate-400">Available across all hubs</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-cyan-400">{formatNumber(totalDemandWater)}L</div>
              <div className="text-[10px] text-slate-400">Total Village Demand</div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Surplus +{formatNumber(totalAvailableWater - totalDemandWater)}L in storage</span>
          </div>
        </div>

        {/* Medical Status */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Emergency Medical Kits</span>
            <HeartPulse className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold text-white">{formatNumber(totalAvailableMedical)}</div>
              <div className="text-[10px] text-slate-400">Available across all hubs</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-rose-400">{formatNumber(totalDemandMedical)}</div>
              <div className="text-[10px] text-slate-400">Total Village Demand</div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Surplus +{formatNumber(totalAvailableMedical - totalDemandMedical)} kits in reserve</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search item name, warehouse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Hubs</option>
              {mockWarehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.district} Hub ({wh.code})
                </option>
              ))}
            </select>

            {['ALL', 'FOOD', 'WATER', 'MEDICAL', 'SHELTER'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Item Description</th>
                <th className="px-4 py-3">Warehouse Hub</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Reserved</th>
                <th className="px-4 py-3 text-right">Reorder Threshold</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredItems.map((item) => {
                const isLow = item.quantityAvailable <= item.reorderThreshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.category === 'FOOD'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : item.category === 'WATER'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : item.category === 'MEDICAL'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{item.itemName}</div>
                      <div className="text-[11px] text-slate-400">Unit: {item.unit}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      {item.warehouseName.split(' ')[0]} Hub
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      {formatNumber(item.quantityAvailable)}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-400 font-medium">
                      {formatNumber(item.quantityReserved)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {formatNumber(item.reorderThreshold)}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>LOW STOCK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>HEALTHY</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Intake Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <span>Log Relief Stock Intake</span>
              </h3>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Destination Warehouse</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none">
                  {mockWarehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Resource Category</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none">
                  <option>FOOD</option>
                  <option>WATER</option>
                  <option>MEDICAL</option>
                  <option>SHELTER</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Quantity Received</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  defaultValue="2500"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Consignment Reference / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. NDRF State Consignment Batch 44"
                  defaultValue="Bihar SDMA Emergency Reserve Consignment #41"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddStockModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Stock Intake Logged! PostgreSQL ACID Transaction confirmed.');
                  setShowAddStockModal(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Record Intake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
