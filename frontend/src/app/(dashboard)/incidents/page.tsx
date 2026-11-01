'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  Users,
  Droplet,
  Package,
  HeartPulse,
  CloudRain,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { mockIncidents, mockAffectedLocations } from '@/lib/mockData';
import { formatNumber, getUrgencyBadgeClasses } from '@/lib/utils';
import { Incident, AffectedLocation } from '@/types';
import { api } from '@/lib/api';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [locations, setLocations] = useState<AffectedLocation[]>(mockAffectedLocations);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(mockIncidents[0].id);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getIncidents().catch(() => mockIncidents),
      api.getLocations().catch(() => mockAffectedLocations),
    ]).then(([incData, locData]) => {
      if (!isMounted) return;
      if (Array.isArray(incData) && incData.length > 0) {
        setIncidents(incData);
        setSelectedIncidentId(incData[0].id);
      }
      if (Array.isArray(locData) && locData.length > 0) {
        setLocations(locData);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0] || mockIncidents[0];

  const filteredLocations = locations.filter((loc) => {
    const matchesUrgency = filterUrgency === 'ALL' || loc.urgencyLevel === filterUrgency;
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUrgency && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Disaster Incidents</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor active flood zones, affected population clusters, and emergency supply requirements.
          </p>
        </div>
        <Link
          href="/relief-plans"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          <span>Generate Allocation Plan</span>
        </Link>
      </div>

      {/* Incident Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((incident) => {
          const isSelected = incident.id === selectedIncidentId;
          return (
            <div
              key={incident.id}
              onClick={() => setSelectedIncidentId(incident.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-slate-900/90 border-blue-500/60 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      incident.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{incident.title}</h3>
                    <p className="text-xs text-slate-400">{incident.region} • {incident.state}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    incident.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {incident.severity}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                {incident.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <strong>{formatNumber(incident.affectedPopulationTotal)}</strong> people affected
                </span>
                <span className="flex items-center gap-1 text-cyan-300 font-mono">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  {incident.rainfallPast24hMm}mm / 24h
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search villages or districts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Urgency:</span>
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterUrgency(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterUrgency === lvl
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Affected Locations List */}
      <div className="space-y-3">
        {filteredLocations.map((loc) => (
          <div
            key={loc.id}
            className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-sm text-white">{loc.name}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getUrgencyBadgeClasses(loc.urgencyLevel)}`}>
                  {loc.urgencyLevel}
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {loc.district} District
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                    loc.accessRoadStatus === 'COMPLETELY_FLOODED'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : loc.accessRoadStatus === 'WATERLOGGED'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  Road: {loc.accessRoadStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <strong>{formatNumber(loc.populationAffected)}</strong> affected
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <strong>{formatNumber(loc.requiredFoodPackets)}</strong> rations
                </span>
                <span className="flex items-center gap-1 text-cyan-300">
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                  <strong>{formatNumber(loc.requiredDrinkingWaterLiters)}L</strong> water
                </span>
                <span className="flex items-center gap-1 text-rose-300">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  <strong>{loc.requiredMedicalKits}</strong> med kits
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <Link
                href="/map"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Locate on Map</span>
              </Link>
              <Link
                href="/relief-plans"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs text-blue-300 hover:text-blue-200 font-semibold transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Allocate</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
