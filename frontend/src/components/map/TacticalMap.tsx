'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
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
  const layersGroupRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapTheme, setMapTheme] = useState<'dark' | 'osm'>('dark');
  const currentTileLayerRef = useRef<any>(null);

  // 1. Initialize Map instance once
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isCancelled = false;

    // Clean up any lingering Leaflet metadata on the DOM node
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // Ignore cleanup errors
      }
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    import('leaflet')
      .then((mod) => {
        if (isCancelled || !mapContainerRef.current) return;

        // Resolve Leaflet module safely across CJS/ESM
        const L = (mod.default || mod) as any;
        leafletModuleRef.current = L;

        // Configure standard marker icons
        if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
        }

        // Initialize Map centered on North Bihar
        const map = L.map(mapContainerRef.current, {
          center: [25.95, 85.8],
          zoom: 8,
          minZoom: 6,
          maxZoom: 18,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        mapInstanceRef.current = map;

        // Add Tile Layer
        const tileUrl =
          mapTheme === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const tileLayer = L.tileLayer(tileUrl, {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        currentTileLayerRef.current = tileLayer;

        // Layer group for all dynamic markers and routes
        const layersGroup = L.layerGroup().addTo(map);
        layersGroupRef.current = layersGroup;

        setIsMapReady(true);

        // Invalidate size to ensure tiles render immediately
        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);

        // Auto-observe container resize
        if (window.ResizeObserver) {
          const ro = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          ro.observe(mapContainerRef.current);
        }
      })
      .catch((err) => {
        console.error('Failed to load Leaflet:', err);
      });

    return () => {
      isCancelled = true;
      setIsMapReady(false);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Ignore
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // 2. Handle map theme switch
  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const tileUrl =
      mapTheme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    currentTileLayerRef.current = newTileLayer;
  }, [mapTheme]);

  // 3. Render markers & routes whenever data changes
  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;

    if (!L || !map || !layersGroup || !isMapReady) return;

    // Clear previous markers & polylines
    layersGroup.clearLayers();

    // Add Warehouses (Blue Hubs)
    warehouses.forEach((wh) => {
      const warehouseIcon = L.divIcon({
        className: 'custom-warehouse-marker',
        html: `
          <div style="background-color: #2563eb; width: 26px; height: 26px; border-radius: 8px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(37, 99, 235, 0.9); cursor: pointer;">
            <div style="width: 8px; height: 8px; background: white; border-radius: 2px;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([wh.latitude, wh.longitude], { icon: warehouseIcon }).addTo(layersGroup);
      marker.bindPopup(`
        <div style="padding: 6px; font-size: 12px; color: #f8fafc; font-family: sans-serif;">
          <strong style="color: #60a5fa; font-size: 13px;">${wh.name}</strong><br/>
          <span style="color: #94a3b8; font-size: 11px;">Code: <strong>${wh.code}</strong> • ${wh.district} District</span><br/>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #334155;">
            <span style="color: #cbd5e1;">Capacity: <strong>${wh.utilizedCapacityPercent}% full</strong></span><br/>
            <span style="color: #34d399;">Transport Fleet: <strong>${wh.availableVehicles} Trucks | ${wh.availableRescueBoats} Boats</strong></span><br/>
            <span style="color: #94a3b8; font-size: 11px;">${wh.address}</span>
          </div>
        </div>
      `);
    });

    // Add Affected Locations (Red / Amber / Yellow Markers)
    affectedLocations.forEach((loc) => {
      const isSelected = selectedLocationId === loc.id;
      const color =
        loc.urgencyLevel === 'CRITICAL'
          ? '#ef4444'
          : loc.urgencyLevel === 'HIGH'
          ? '#f59e0b'
          : '#eab308';

      const locIcon = L.divIcon({
        className: 'custom-loc-marker',
        html: `
          <div style="position: relative; width: ${isSelected ? '28px' : '22px'}; height: ${isSelected ? '28px' : '22px'}; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${color}; opacity: 0.45; transform: scale(1.6);"></div>
            <div style="position: absolute; inset: 2px; border-radius: 9999px; background-color: ${color}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color};">
              <div style="width: 6px; height: 6px; background-color: white; border-radius: 9999px;"></div>
            </div>
          </div>
        `,
        iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
        iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: locIcon }).addTo(layersGroup);

      marker.on('click', () => {
        if (onSelectLocation) onSelectLocation(loc.id);
      });

      const roadColor =
        loc.accessRoadStatus === 'COMPLETELY_FLOODED'
          ? '#f87171'
          : loc.accessRoadStatus === 'WATERLOGGED'
          ? '#fbbf24'
          : '#34d399';

      marker.bindPopup(`
        <div style="padding: 6px; font-size: 12px; color: #f8fafc; font-family: sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <strong style="color: #ffffff; font-size: 13px;">${loc.name}</strong>
            <span style="background: ${color}33; color: ${color}; border: 1px solid ${color}88; padding: 1px 6px; border-radius: 9999px; font-weight: bold; font-size: 10px;">${loc.urgencyLevel}</span>
          </div>
          <div style="color: #cbd5e1; margin-bottom: 2px;">Population: <strong>${loc.populationAffected.toLocaleString()}</strong></div>
          <div style="color: #fde047; font-size: 11px;">Requirements: <strong>${loc.requiredFoodPackets.toLocaleString()} Rations • ${loc.requiredDrinkingWaterLiters.toLocaleString()}L Water • ${loc.requiredMedicalKits} Kits</strong></div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #334155; font-size: 11px; color: ${roadColor};">
            Road Corridor: <strong>${loc.accessRoadStatus.replace('_', ' ')}</strong>
          </div>
        </div>
      `);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Draw Polylines for Active Routes
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
        ).addTo(layersGroup);

        polyline.bindPopup(`
          <div style="padding: 6px; font-size: 12px; color: #f8fafc; font-family: sans-serif;">
            <strong style="color: #38bdf8;">Route: ${ord.orderNumber}</strong><br/>
            <span style="color: #94a3b8;">${originWh.name.split(' ')[0]} Hub ➔ ${destLoc.name}</span><br/>
            <span style="color: #cbd5e1;">Distance: <strong>${ord.estimatedDistanceKm} km</strong> (~${ord.estimatedTravelMinutes} mins)</span><br/>
            <span style="color: #e2e8f0;">Vehicle: <strong>${ord.assignedVehicleType ? ord.assignedVehicleType.replace('_', ' ') : 'Truck'}</strong></span><br/>
            ${
              ord.roadHazardWarning
                ? `<div style="margin-top: 4px; color: #f87171; font-size: 11px; background: rgba(239, 68, 68, 0.15); padding: 4px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.3);">⚠️ ${ord.roadHazardWarning}</div>`
                : ''
            }
          </div>
        `);
      }
    });

    // If a location is selected, fly to it smoothly
    if (selectedLocationId) {
      const targetLoc = affectedLocations.find((l) => l.id === selectedLocationId);
      if (targetLoc) {
        map.flyTo([targetLoc.latitude, targetLoc.longitude], 10, {
          duration: 1.2,
        });
      }
    }
  }, [warehouses, affectedLocations, orders, selectedLocationId, isMapReady, onSelectLocation]);

  return (
    <div className="relative w-full h-[580px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0b1120]">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Theme Toggle (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 shadow-lg backdrop-blur-sm text-xs">
        <button
          onClick={() => setMapTheme('dark')}
          className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
            mapTheme === 'dark'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dark Tile
        </button>
        <button
          onClick={() => setMapTheme('osm')}
          className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
            mapTheme === 'osm'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Street Map
        </button>
      </div>

      {/* Floating Map Legend (Bottom-Left) */}
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
