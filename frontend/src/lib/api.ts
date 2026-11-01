// ResQ — Unified API Client
import { Incident, AffectedLocation, Warehouse, InventoryItem, ReliefOrder, AllocationPlanResult, ChatMessage } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('resq_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || errorBody.message || `API request failed with status ${res.status}`);
  }

  return res.json();
}

export interface HealthResponse {
  status: string;
  service?: string;
  uptimeSeconds?: number;
  postgresConnected?: boolean;
  incidentsMonitored?: number;
  operationalWarehouses?: number;
  aiModel?: string;
  timestamp?: string;
}

export const api = {
  // Health
  checkHealth: () => apiFetch<HealthResponse>('/health'),

  // Incidents
  getIncidents: () => apiFetch<Incident[]>('/incidents'),
  getIncidentById: (id: string) => apiFetch<Incident>(`/incidents/${id}`),

  // Locations
  getLocations: (incidentId?: string) =>
    apiFetch<AffectedLocation[]>(`/locations${incidentId ? `?incidentId=${incidentId}` : ''}`),

  // Warehouses
  getWarehouses: () => apiFetch<Warehouse[]>('/warehouses'),
  getWarehouseById: (id: string) => apiFetch<Warehouse>(`/warehouses/${id}`),

  // Inventory
  getInventory: (warehouseId?: string) =>
    apiFetch<InventoryItem[]>(`/inventory${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  getTransactions: (warehouseId?: string) =>
    apiFetch<any[]>(`/inventory/transactions${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  // Routing & Weather
  getWeather: (lat: number, lon: number, name?: string) =>
    apiFetch<any>(`/weather/forecast?lat=${lat}&lon=${lon}${name ? `&name=${encodeURIComponent(name)}` : ''}`),
  getBiharWeather: () => apiFetch<any>('/weather/bihar'),
  getRoute: (fromLat: number, fromLon: number, toLat: number, toLon: number, roadStatus?: string) =>
    apiFetch<any>(
      `/routing/route?fromLat=${fromLat}&fromLon=${fromLon}&toLat=${toLat}&toLon=${toLon}${
        roadStatus ? `&roadStatus=${roadStatus}` : ''
      }`
    ),

  // Allocation Optimizer
  generateReliefPlan: (payload?: { incidentId?: string; prioritizeUrgency?: boolean; warehouseIds?: string[] }) =>
    apiFetch<AllocationPlanResult>('/relief-plans/generate', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  createDraftOrdersFromPlan: (planId: string, incidentId?: string) =>
    apiFetch<{ success: boolean; count: number; orders: ReliefOrder[] }>('/relief-plans/create-draft-orders', {
      method: 'POST',
      body: JSON.stringify({ planId, incidentId }),
    }),

  // Orders Lifecycle
  getOrders: (filters?: { status?: string; warehouseId?: string }) =>
    apiFetch<ReliefOrder[]>(`/orders${filters?.status ? `?status=${filters.status}` : ''}`),
  getOrderById: (id: string) => apiFetch<ReliefOrder>(`/orders/${id}`),
  approveOrder: (id: string, notes?: string, approvedBy?: string) =>
    apiFetch<ReliefOrder>(`/orders/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes, approvedBy }),
    }),
  dispatchOrder: (id: string, vehicleNumber?: string) =>
    apiFetch<ReliefOrder>(`/orders/${id}/dispatch`, {
      method: 'POST',
      body: JSON.stringify({ vehicleNumber }),
    }),
  deliverOrder: (id: string) => apiFetch<ReliefOrder>(`/orders/${id}/deliver`, { method: 'POST' }),
  cancelOrder: (id: string, reason?: string) =>
    apiFetch<ReliefOrder>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // AI Copilot
  sendAIChat: (message: string, incidentId?: string) =>
    apiFetch<ChatMessage>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, incidentId }),
    }),
};
