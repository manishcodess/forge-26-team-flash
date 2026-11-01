'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Package,
  Route,
  UserCheck,
  FileText,
  Ship,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { mockOrders } from '@/lib/mockData';
import { formatNumber, getStatusBadgeClasses } from '@/lib/utils';
import { ReliefOrder } from '@/types';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ReliefOrder[]>(mockOrders);
  const [selectedOrderForApproval, setSelectedOrderForApproval] = useState<ReliefOrder | null>(null);
  const [supervisorName, setSupervisorName] = useState<string>('Officer M. Sharma');
  const [approvalNotes, setApprovalNotes] = useState<string>('Approved for immediate dispatch via emergency response unit.');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch orders from API on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getOrders()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      })
      .catch(() => {
        // Fallback to initial mock orders if offline
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (orderId: string) => {
    try {
      const updated = await api.approveOrder(orderId, approvalNotes, supervisorName);
      setOrders((prev) => prev.map((ord) => (ord.id === orderId ? updated : ord)));
    } catch {
      // Local fallback update
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'APPROVED',
              approvedBy: supervisorName,
              approvedAt: new Date().toISOString(),
              notes: approvalNotes,
            };
          }
          return ord;
        })
      );
    }
    setSelectedOrderForApproval(null);
  };

  const handleDispatch = async (orderId: string) => {
    try {
      const updated = await api.dispatchOrder(orderId);
      setOrders((prev) => prev.map((ord) => (ord.id === orderId ? updated : ord)));
    } catch {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'DISPATCHED',
              dispatchedAt: new Date().toISOString(),
            };
          }
          return ord;
        })
      );
    }
  };

  const handleDeliver = async (orderId: string) => {
    try {
      const updated = await api.deliverOrder(orderId);
      setOrders((prev) => prev.map((ord) => (ord.id === orderId ? updated : ord)));
    } catch {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'DELIVERED',
              deliveredAt: new Date().toISOString(),
            };
          }
          return ord;
        })
      );
    }
  };

  const refreshOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      if (Array.isArray(data)) setOrders(data);
    } catch {
      // Keep existing
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <span>Relief Orders & Dispatch Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage requisition orders, supervisor authorizations, and transport dispatches to affected zones.
          </p>
        </div>
        <button
          onClick={refreshOrders}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Order Pipeline Stage Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Draft', filterKey: 'DRAFT' },
          { label: 'Pending Approval', filterKey: 'PENDING_APPROVAL' },
          { label: 'Approved', filterKey: 'APPROVED' },
          { label: 'Dispatched / In Transit', filterKey: 'DISPATCHED' },
        ].map((stage) => {
          const count = orders.filter((o) =>
            stage.filterKey === 'DISPATCHED'
              ? o.status === 'DISPATCHED' || o.status === 'IN_TRANSIT'
              : o.status === stage.filterKey
          ).length;

          return (
            <div key={stage.label} className="glass-panel p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stage.label}</span>
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders List Table */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Active Relief Orders</h3>
          <span className="text-xs text-slate-400 font-mono">{orders.length} Total Orders</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Origin Hub</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Distance & Route</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {orders.map((order) => {
                const isDraft = order.status === 'DRAFT' || order.status === 'PENDING_APPROVAL';
                const isApproved = order.status === 'APPROVED';
                const isDispatched = order.status === 'DISPATCHED' || order.status === 'IN_TRANSIT';

                return (
                  <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-cyan-400">{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getStatusBadgeClasses(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-medium">
                      {order.warehouseName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{order.destinationLocationName}</div>
                      {order.roadHazardWarning && (
                        <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>Road Caution</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {order.assignedVehicleType === 'RESCUE_BOAT' ? (
                          <Ship className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>{order.assignedVehicleType ? order.assignedVehicleType.replace('_', ' ') : 'Truck'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      <div>{order.estimatedDistanceKm} km</div>
                      <div className="text-[10px] text-slate-400">~{order.estimatedTravelMinutes} mins</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isDraft && (
                          <button
                            onClick={() => setSelectedOrderForApproval(order)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}
                        {isApproved && (
                          <button
                            onClick={() => handleDispatch(order.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] shadow-sm transition-colors cursor-pointer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        )}
                        {isDispatched && (
                          <button
                            onClick={() => handleDeliver(order.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Delivered</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedOrderForApproval && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Authorize Relief Order</h3>
                <p className="text-xs text-cyan-400 font-mono mt-0.5">{selectedOrderForApproval.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForApproval(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-bold text-white">{selectedOrderForApproval.destinationLocationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatching Hub:</span>
                  <span className="text-slate-200">{selectedOrderForApproval.warehouseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Distance / Transit:</span>
                  <span className="font-mono text-cyan-400">{selectedOrderForApproval.estimatedDistanceKm} km (~{selectedOrderForApproval.estimatedTravelMinutes} mins)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Authorizing Officer</label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dispatch Notes / Route Clearance</label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrderForApproval(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedOrderForApproval.id)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
