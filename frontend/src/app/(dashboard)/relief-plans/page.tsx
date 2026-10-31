'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building2,
  Package,
  Droplet,
  HeartPulse,
  RotateCcw,
  FileCheck
} from 'lucide-react';
import {
  mockIncidents,
  mockWarehouses,
  mockAffectedLocations,
  mockInventory,
  mockDeterministicPlan
} from '@/lib/mockData';
import { formatNumber, getUrgencyBadgeClasses } from '@/lib/utils';
import { AllocationPlanResult } from '@/types';

export default function ReliefPlansPage() {
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<AllocationPlanResult | null>(mockDeterministicPlan);
  const [prioritizeCritical, setPrioritizeCritical] = useState<boolean>(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(200);

  const runSolver = () => {
    setIsSolving(true);
    setTimeout(() => {
      // Deterministic simulation
      setPlanResult(mockDeterministicPlan);
      setIsSolving(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>Deterministic Relief Allocation Optimizer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict mathematical constraint solver: multi-warehouse priority knapsack with zero LLM calculation hallucination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSolver}
            disabled={isSolving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            {isSolving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Solving Constraints...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute Optimization Solver</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Solver Controls Banner */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs border border-slate-800">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={prioritizeCritical}
              onChange={(e) => setPrioritizeCritical(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="font-medium">Prioritize Critical & High Urgency (2.5x Multiplier)</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Max Delivery Radius:</span>
            <input
              type="range"
              min="50"
              max="300"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-28 accent-blue-600"
            />
            <span className="font-mono text-cyan-400 font-bold">{maxDistanceKm} km</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Deterministic Algorithm: Multi-Hub Greedy Heuristic</span>
        </div>
      </div>

      {/* Plan Output Overview */}
      {planResult && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Locations Covered</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{planResult.totalLocationsServed}</span>
                <span className="text-xs text-slate-400">of {mockAffectedLocations.length} affected areas</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">100% of Critical zones served</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Overall Fulfillment Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-cyan-400">{planResult.overallFulfillmentPercent}%</span>
                <span className="text-xs text-slate-400">demand satisfied</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Constrained by warehouse reserve bounds</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Unmet Supply Deficit</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">7,000L</span>
                <span className="text-xs text-slate-400">Water Shortfall</span>
              </div>
              <p className="text-[11px] text-amber-400 mt-1">Reorder requisition automatically generated</p>
            </div>
          </div>

          {/* Allocation Matrix Table */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Synthesized Allocation Matrix</h3>
                <p className="text-xs text-slate-400">Optimal warehouse-to-destination matching based on road distance and urgency</p>
              </div>
              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all self-start sm:self-auto"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Review & Approve Generated Orders</span>
              </Link>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Destination Village</th>
                    <th className="px-4 py-3">Urgency</th>
                    <th className="px-4 py-3">Assigned Warehouse Hub</th>
                    <th className="px-4 py-3">Road Distance</th>
                    <th className="px-4 py-3">Allocated Supplies</th>
                    <th className="px-4 py-3 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {planResult.allocations.map((alloc) => (
                    <tr key={alloc.locationId} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{alloc.locationName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{alloc.notes}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold border text-[10px] ${getUrgencyBadgeClasses(alloc.urgency)}`}>
                          {alloc.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200 font-medium">
                        {alloc.warehouseName}
                      </td>
                      <td className="px-4 py-3 font-mono text-cyan-400">
                        {alloc.distanceKm} km
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-amber-300">{formatNumber(alloc.allocatedFood)} Rations</div>
                          <div className="text-cyan-300">{formatNumber(alloc.allocatedWater)}L Water</div>
                          <div className="text-rose-300">{alloc.allocatedMedical} Med Kits</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-emerald-400 text-sm">
                          {alloc.fulfillmentRatePercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transparent Mathematical Explanation */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Deterministic Proof & Reasoning
              </span>
              <p className="text-slate-300 leading-relaxed">
                {planResult.mathematicalExplanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
