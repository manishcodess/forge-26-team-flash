// ResQFlow AI — Unified Frontend API Client

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
    throw new Error(errorBody.error || errorBody.message || `API error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: () => apiFetch<{ status: string }>('/health'),

  // Incidents
  getIncidents: () => apiFetch('/incidents'),
  getIncidentById: (id: string) => apiFetch(`/incidents/${id}`),

  // Locations
  getLocations: (incidentId?: string) =>
    apiFetch(`/locations${incidentId ? `?incidentId=${incidentId}` : ''}`),

  // Warehouses
  getWarehouses: () => apiFetch('/warehouses'),
  getWarehouseById: (id: string) => apiFetch(`/warehouses/${id}`),

  // Inventory
  getInventory: (warehouseId?: string) =>
    apiFetch(`/inventory${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  getTransactions: (warehouseId?: string) =>
    apiFetch(`/inventory/transactions${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  // Routing & Weather
  getWeather: (lat: number, lon: number, name?: string) =>
    apiFetch(`/weather/forecast?lat=${lat}&lon=${lon}${name ? `&name=${encodeURIComponent(name)}` : ''}`),
  getBiharWeather: () => apiFetch('/weather/bihar'),
  getRoute: (fromLat: number, fromLon: number, toLat: number, toLon: number, roadStatus?: string) =>
    apiFetch(
      `/routing/route?fromLat=${fromLat}&fromLon=${fromLon}&toLat=${toLat}&toLon=${toLon}${
        roadStatus ? `&roadStatus=${roadStatus}` : ''
      }`
    ),

  // Allocation Optimizer
  generateReliefPlan: (incidentId: string) =>
    apiFetch('/relief-plans/generate', {
      method: 'POST',
      body: JSON.stringify({ incidentId }),
    }),
  createDraftOrdersFromPlan: (planId: string, incidentId?: string) =>
    apiFetch('/relief-plans/create-draft-orders', {
      method: 'POST',
      body: JSON.stringify({ planId, incidentId }),
    }),

  // Orders State Machine
  getOrders: () => apiFetch('/orders'),
  getOrderById: (id: string) => apiFetch(`/orders/${id}`),
  approveOrder: (id: string) => apiFetch(`/orders/${id}/approve`, { method: 'POST' }),
  dispatchOrder: (id: string) => apiFetch(`/orders/${id}/dispatch`, { method: 'POST' }),
  deliverOrder: (id: string) => apiFetch(`/orders/${id}/deliver`, { method: 'POST' }),
  cancelOrder: (id: string) => apiFetch(`/orders/${id}/cancel`, { method: 'POST' }),

  // AI Copilot
  sendAIChat: (message: string, incidentId?: string) =>
    apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, incidentId }),
    }),
};
