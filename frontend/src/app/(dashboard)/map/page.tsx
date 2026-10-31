'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Compass,
  AlertTriangle,
  Route,
  ShieldAlert,
  Layers,
  Info,
  Navigation,
  ArrowRight,
  Truck
} from 'lucide-react';
import { mockWarehouses, mockAffectedLocations, mockOrders } from '@/lib/mockData';

// Dynamic import of Leaflet map with SSR disabled to prevent window is undefined errors
const TacticalMap = dynamic(() => import('@/components/map/TacticalMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-mono">Initializing Tactical GIS & Satellite Corridors...</span>
    </div>
  ),
});

export default function MapPage() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const selectedLoc = mockAffectedLocations.find((l) => l.id === selectedLocationId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>GIS Tactical Logistics & Route Feasibility Map</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic overview of staging hubs, inundated settlements, and calculated transport corridors in Bihar.
          </p>
        </div>

        {/* Hazard Disclaimer Banner */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Normal road routes are not verified flood-safe without local ground telemetry.</span>
        </div>
      </div>

      {/* Main Grid: Map + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive GIS Map */}
        <div className="lg:col-span-3">
          <TacticalMap
            warehouses={mockWarehouses}
            affectedLocations={mockAffectedLocations}
            orders={mockOrders}
            selectedLocationId={selectedLocationId}
            onSelectLocation={(id) => setSelectedLocationId(id)}
          />
        </div>

        {/* Right 1 Col: Active Corridors & Location Inspection */}
        <div className="space-y-4">
          {/* Active Route Inspection Card */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Route className="w-4 h-4 text-cyan-400" />
              <span>Monitored Relief Routes</span>
            </h3>

            <div className="space-y-2.5">
              {mockOrders.map((ord) => {
                const isHazard = ord.routeConfidence === 'POTENTIALLY_INUNDATED';
                return (
                  <div
                    key={ord.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      isHazard
                        ? 'bg-rose-950/20 border-rose-900/50'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-white">{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isHazard
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <div>From: <span className="text-slate-300">{ord.warehouseName.split(' ')[0]} Hub</span></div>
                      <div>To: <span className="text-slate-300">{ord.destinationLocationName.split(' ')[0]}</span></div>
                      <div className="mt-1 text-cyan-400 font-mono">
                        {ord.estimatedDistanceKm} km • ~{ord.estimatedTravelMinutes} mins
                      </div>
                    </div>

                    {ord.roadHazardWarning && (
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] leading-tight">
                        ⚠️ {ord.roadHazardWarning}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Route Planning Assist */}
          <div className="glass-panel-accent p-4 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-300" />
              <span className="font-bold text-white text-xs">OSRM Navigation Engine</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Real-time routing computes distance & travel time via OpenStreetMap road geometries with fail-safe haversine estimation when servers are offline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
