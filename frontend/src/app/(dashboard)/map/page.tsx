'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Compass,
  AlertTriangle,
  Route,
  Navigation,
  ArrowRight,
  Truck
} from 'lucide-react';
import { mockWarehouses, mockAffectedLocations, mockOrders } from '@/lib/mockData';
import { api } from '@/lib/api';
import { Warehouse, AffectedLocation, ReliefOrder } from '@/types';

// Dynamic import of Leaflet map with SSR disabled to prevent window is undefined errors
const TacticalMap = dynamic(() => import('@/components/map/TacticalMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-mono">Loading Interactive Relief Map...</span>
    </div>
  ),
});

export default function MapPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [locations, setLocations] = useState<AffectedLocation[]>(mockAffectedLocations);
  const [orders, setOrders] = useState<ReliefOrder[]>(mockOrders);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getWarehouses().catch(() => mockWarehouses),
      api.getLocations().catch(() => mockAffectedLocations),
      api.getOrders().catch(() => mockOrders),
    ]).then(([whData, locData, ordData]) => {
      if (!isMounted) return;
      if (Array.isArray(whData) && whData.length > 0) setWarehouses(whData);
      if (Array.isArray(locData) && locData.length > 0) setLocations(locData);
      if (Array.isArray(ordData) && ordData.length > 0) setOrders(ordData);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedLoc = locations.find((l) => l.id === selectedLocationId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Relief Map & Route Feasibility</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic overview of staging warehouses, affected settlements, and active transit corridors.
          </p>
        </div>

        {/* Hazard Note */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Caution: Red corridors indicate flooded or submerged road sections.</span>
        </div>
      </div>

      {/* Main Grid: Map + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive Map */}
        <div className="lg:col-span-3">
          <TacticalMap
            warehouses={warehouses}
            affectedLocations={locations}
            orders={orders}
            selectedLocationId={selectedLocationId}
            onSelectLocation={(id) => setSelectedLocationId(id)}
          />
        </div>

        {/* Right 1 Col: Active Corridors & Location Inspection */}
        <div className="space-y-4">
          {/* Active Route Inspection Card */}
          <div className="glass-panel p-4 rounded-xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Route className="w-4 h-4 text-cyan-400" />
              <span>Active Relief Corridors</span>
            </h3>

            <div className="space-y-2.5">
              {orders.map((ord) => {
                const isHazard = ord.routeConfidence === 'POTENTIALLY_INUNDATED';
                return (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white">{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isHazard
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {isHazard ? 'SUBMERGED' : 'VERIFIED'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <span>{ord.warehouseName.split(' ')[0]} Hub</span>
                      <span className="text-slate-500 mx-1">➔</span>
                      <span className="text-slate-200">{ord.destinationLocationName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                      <span>{ord.estimatedDistanceKm} km</span>
                      <span>~{ord.estimatedTravelMinutes} mins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Location Card */}
          {selectedLoc && (
            <div className="glass-panel p-4 rounded-xl space-y-3 border border-blue-500/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Inspected Zone
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {selectedLoc.urgencyLevel}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">{selectedLoc.name}</h4>
                <p className="text-xs text-slate-400">{selectedLoc.district} District</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Affected Population:</span>
                  <span className="font-bold text-white">{selectedLoc.populationAffected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rations Needed:</span>
                  <span className="text-amber-300 font-medium">{selectedLoc.requiredFoodPackets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Water Needed:</span>
                  <span className="text-cyan-300 font-medium">{selectedLoc.requiredDrinkingWaterLiters.toLocaleString()}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Road Status:</span>
                  <span className="font-semibold text-rose-400">{selectedLoc.accessRoadStatus.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
