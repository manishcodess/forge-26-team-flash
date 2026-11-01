'use client';

import React, { useEffect, useRef } from 'react';
import { Warehouse, AffectedLocation, ReliefOrder } from '@/types';

interface TacticalMapProps {
  warehouses: Warehouse[];
  affectedLocations: AffectedLocation[];
  orders: ReliefOrder[];
  selectedLocationId?: string | null;
  onSelectLocation?: (id: string) => void;
}

export default function TacticalMap({
  warehouses,
  affectedLocations,
  orders,
  selectedLocationId,
  onSelectLocation,
}: TacticalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        // Center on North Bihar (Patna - Darbhanga corridor)
        const map = L.map(mapContainerRef.current).setView([25.95, 85.8], 8);
        mapInstanceRef.current = map;

        // Dark tactical tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        // Add Warehouses (Blue Hubs)
        warehouses.forEach((wh) => {
          const warehouseIcon = L.divIcon({
            className: 'custom-warehouse-marker',
            html: `
              <div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 6px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(37, 99, 235, 0.8);">
                <div style="width: 8px; height: 8px; background: white; border-radius: 2px;"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([wh.latitude, wh.longitude], { icon: warehouseIcon }).addTo(map);
          marker.bindPopup(`
            <div style="padding: 4px; font-size: 12px; color: #f8fafc;">
              <strong style="color: #60a5fa; font-size: 13px;">${wh.name}</strong><br/>
              <span style="color: #94a3b8;">Code: ${wh.code}</span><br/>
              <span style="color: #cbd5e1;">Capacity: ${wh.totalCapacitySqft.toLocaleString()} sqft (${wh.utilizedCapacityPercent}% full)</span><br/>
              <span style="color: #34d399;">Vehicles: ${wh.availableVehicles} | Rescue Boats: ${wh.availableRescueBoats}</span><br/>
              <span style="color: #94a3b8; font-size: 11px;">${wh.address}</span>
            </div>
          `);
        });

        // Add Affected Locations (Pulsing Red / Amber / Yellow Markers)
        affectedLocations.forEach((loc) => {
          const color =
            loc.urgencyLevel === 'CRITICAL'
              ? '#ef4444'
              : loc.urgencyLevel === 'HIGH'
              ? '#f59e0b'
              : '#eab308';

          const locIcon = L.divIcon({
            className: 'custom-loc-marker',
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${color}; opacity: 0.4; transform: scale(1.6);"></div>
                <div style="position: absolute; inset: 2px; border-radius: 9999px; background-color: ${color}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;">
                  <div style="width: 6px; height: 6px; background-color: white; border-radius: 9999px;"></div>
                </div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const marker = L.marker([loc.latitude, loc.longitude], { icon: locIcon }).addTo(map);

          marker.on('click', () => {
            if (onSelectLocation) onSelectLocation(loc.id);
          });

          marker.bindPopup(`
            <div style="padding: 4px; font-size: 12px; color: #f8fafc;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <strong style="color: #ffffff; font-size: 13px;">${loc.name}</strong>
                <span style="background: ${color}33; color: ${color}; border: 1px solid ${color}88; padding: 1px 6px; border-radius: 9999px; font-weight: bold; font-size: 10px;">${loc.urgencyLevel}</span>
              </div>
              <div style="color: #cbd5e1; margin-bottom: 2px;">Pop. Affected: <strong>${loc.populationAffected.toLocaleString()}</strong></div>
              <div style="color: #fde047;">Needs: ${loc.requiredFoodPackets.toLocaleString()} Food • ${loc.requiredDrinkingWaterLiters.toLocaleString()}L Water • ${loc.requiredMedicalKits} Kits</div>
              <div style="margin-top: 4px; font-size: 11px; color: ${loc.accessRoadStatus === 'COMPLETELY_FLOODED' ? '#f87171' : loc.accessRoadStatus === 'WATERLOGGED' ? '#fbbf24' : '#34d399'};">
                Road: <strong>${loc.accessRoadStatus.replace('_', ' ')}</strong>
              </div>
            </div>
          `);
        });

        // Draw Polylines for Dispatched & Draft Routes
        orders.forEach((ord) => {
          const originWh = warehouses.find((w) => w.id === ord.warehouseId);
          const destLoc = affectedLocations.find((l) => l.id === ord.destinationLocationId);

          if (originWh && destLoc) {
            const isHazard = ord.routeConfidence === 'POTENTIALLY_INUNDATED';
            const routeColor = isHazard ? '#ef4444' : '#06b6d4';

            const polyline = L.polyline(
              [
                [originWh.latitude, originWh.longitude],
                [destLoc.latitude, destLoc.longitude],
              ],
              {
                color: routeColor,
                weight: 3.5,
                opacity: 0.85,
                dashArray: isHazard ? '6, 8' : undefined,
              }
            ).addTo(map);

            polyline.bindPopup(`
              <div style="padding: 4px; font-size: 12px; color: #f8fafc;">
                <strong style="color: #38bdf8;">Route: ${ord.orderNumber}</strong><br/>
                <span style="color: #94a3b8;">${originWh.name} ➔ ${destLoc.name}</span><br/>
                <span style="color: #cbd5e1;">Est. Distance: ${ord.estimatedDistanceKm} km (${ord.estimatedTravelMinutes} mins)</span><br/>
                <span style="color: #e2e8f0;">Vehicle: ${ord.assignedVehicleType}</span><br/>
                ${ord.roadHazardWarning ? `<div style="margin-top: 4px; color: #f87171; font-size: 11px; background: rgba(239, 68, 68, 0.15); padding: 4px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.3);">⚠️ ${ord.roadHazardWarning}</div>` : ''}
              </div>
            `);
          }
        });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [warehouses, affectedLocations, orders, onSelectLocation]);

  return (
    <div className="relative w-full h-[580px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel p-3 rounded-lg text-xs space-y-2 border border-slate-700/80 max-w-xs shadow-xl">
        <div className="font-bold text-slate-200 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1">
          Map Legend
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 border border-white"></span>
            <span className="text-slate-300">Relief Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-white"></span>
            <span className="text-slate-300">Critical Urgency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
            <span className="text-slate-300">High Urgency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></span>
            <span className="text-slate-300">Medium Urgency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-cyan-400"></span>
            <span className="text-slate-300">Safe Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-rose-500 border-t border-dashed"></span>
            <span className="text-rose-400 font-semibold">Flood Alert Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
