'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Droplet,
  Package,
  HeartPulse,
  Phone,
  CloudRain,
  ExternalLink,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { mockIncidents, mockAffectedLocations } from '@/lib/mockData';
import { formatNumber, getUrgencyBadgeClasses } from '@/lib/utils';
import { AffectedLocation } from '@/types';

export default function IncidentsPage() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(mockIncidents[0].id);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewIncidentModal, setShowNewIncidentModal] = useState<boolean>(false);

  const selectedIncident = mockIncidents.find((i) => i.id === selectedIncidentId) || mockIncidents[0];

  const filteredLocations = mockAffectedLocations.filter((loc) => {
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
          <h2 className="text-xl font-bold text-white tracking-tight">Climate & Flood Incident Registry</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time monitoring of active climate disaster zones, embankment breaches, and village demand rosters.
          </p>
        </div>
        <button
          onClick={() => setShowNewIncidentModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Disaster Event</span>
        </button>
      </div>

      {/* Incident Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockIncidents.map((incident) => {
          const isSelected = incident.id === selectedIncidentId;
          return (
            <div
              key={incident.id}
              onClick={() => setSelectedIncidentId(incident.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-slate-900/90 border-blue-500/60 shadow-lg shadow-blue-500/10'
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

              <p className="text-xs text-slate-300/90 mt-3 line-clamp-2 leading-relaxed">
                {incident.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {formatNumber(incident.affectedPopulationTotal)} population
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <CloudRain className="w-3.5 h-3.5" />
                  {incident.rainfallPast24hMm}mm / 24h
                </span>
                <span className="text-emerald-400 font-semibold">{incident.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Incident Telemetry & Details Banner */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Selected Incident Overview</span>
            <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/relief-plans"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Solve Relief Allocation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Affected Locations Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search village, ward, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Urgency:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((urg) => (
              <button
                key={urg}
                onClick={() => setFilterUrgency(urg)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterUrgency === urg
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>
        </div>

        {/* Locations Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Location & District</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Pop. Affected</th>
                <th className="px-4 py-3">Relief Demands</th>
                <th className="px-4 py-3">Road Access</th>
                <th className="px-4 py-3">Ground Contact</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredLocations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{loc.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {loc.district} • {loc.latitude.toFixed(3)}°N, {loc.longitude.toFixed(3)}°E
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold border text-[10px] ${getUrgencyBadgeClasses(loc.urgencyLevel)}`}>
                      {loc.urgencyLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-medium">
                    {formatNumber(loc.populationAffected)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5 text-[11px]">
                      <div className="text-amber-300">{formatNumber(loc.requiredFoodPackets)} Food Packs</div>
                      <div className="text-cyan-300">{formatNumber(loc.requiredDrinkingWaterLiters)}L Water</div>
                      <div className="text-rose-300">{loc.requiredMedicalKits} Med Kits</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        loc.accessRoadStatus === 'COMPLETELY_FLOODED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : loc.accessRoadStatus === 'WATERLOGGED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {loc.accessRoadStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <div className="text-slate-300">{loc.contactPerson || 'Control Room'}</div>
                    <div className="text-[11px] flex items-center gap-1 text-slate-400">
                      <Phone className="w-3 h-3" />
                      {loc.contactPhone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href="/relief-plans"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
                    >
                      Allocate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Incident Creation Modal */}
      {showNewIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span>Simulate Emergency Incident</span>
              </h3>
              <button
                onClick={() => setShowNewIncidentModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  defaultValue="Kamla River Embankment Breach Scenario"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Disaster Type</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none">
                    <option>FLOOD</option>
                    <option>HEAVY_RAINFALL</option>
                    <option>CYCLONE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Severity Rating</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none">
                    <option>CRITICAL</option>
                    <option>HIGH</option>
                    <option>MODERATE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Region / District (Bihar)</label>
                <input
                  type="text"
                  defaultValue="Madhubani & Darbhanga Border"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Simulated Rainfall (mm / 24h)</label>
                <input
                  type="number"
                  defaultValue="185.0"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowNewIncidentModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Simulation incident registered in memory! Telemetry feed updated.');
                  setShowNewIncidentModal(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Inject Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
