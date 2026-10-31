import { dbStore } from '../../db/index.js';
import { fetchLiveWeather } from '../weather/weatherService.js';
import { calculateRoute } from '../routing/routingService.js';
import { optimizeReliefAllocation } from '../allocation/allocationEngine.js';
import { ReliefOrder, ToolExecutionRecord } from '../../types/index.js';
import { calculateHaversineDistanceKm, estimateTravelMinutes } from '../../utils/haversine.js';
import { v4 as uuidv4 } from 'uuid';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

export const registeredTools: Record<string, ToolDefinition> = {
  getActiveIncidents: {
    name: 'getActiveIncidents',
    description: 'Retrieve list of all active climate disaster incidents in Bihar with severity, affected population, and rainfall metrics.',
    parameters: { type: 'OBJECT', properties: {} },
    execute: () => {
      const incidents = dbStore.getIncidents().filter((i) => i.status === 'ACTIVE');
      return { incidents, count: incidents.length };
    },
  },

  getAffectedLocations: {
    name: 'getAffectedLocations',
    description: 'Retrieve list of affected villages/wards, their population, urgency level, road access status, and supply requirements.',
    parameters: {
      type: 'OBJECT',
      properties: {
        incidentId: { type: 'STRING', description: 'Optional incident ID filter' },
        urgency: { type: 'STRING', description: 'Urgency filter: CRITICAL, HIGH, MEDIUM, LOW' },
      },
    },
    execute: (params) => {
      let locs = dbStore.getLocations(params.incidentId as string);
      if (params.urgency) {
        locs = locs.filter((l) => l.urgencyLevel === params.urgency);
      }
      return { locations: locs, count: locs.length };
    },
  },

  getWarehouseInventory: {
    name: 'getWarehouseInventory',
    description: 'Query live stock levels of food, water, medical kits, and blankets across operational Bihar warehouses.',
    parameters: {
      type: 'OBJECT',
      properties: {
        warehouseId: { type: 'STRING', description: 'Optional warehouse ID filter' },
      },
    },
    execute: (params) => {
      const items = dbStore.getInventory(params.warehouseId as string);
      const warehouses = dbStore.getWarehouses();
      return { inventory: items, warehousesCount: warehouses.length };
    },
  },

  getWeatherRisk: {
    name: 'getWeatherRisk',
    description: 'Check real-time precipitation, 72h forecast, and flood risk score for given coordinates.',
    parameters: {
      type: 'OBJECT',
      properties: {
        latitude: { type: 'NUMBER', description: 'Latitude coordinate' },
        longitude: { type: 'NUMBER', description: 'Longitude coordinate' },
      },
      required: ['latitude', 'longitude'],
    },
    execute: async (params) => {
      const lat = Number(params.latitude);
      const lon = Number(params.longitude);
      const telemetry = await fetchLiveWeather(lat, lon, 'Operational Zone');
      return { telemetry };
    },
  },

  calculateRouteFeasibility: {
    name: 'calculateRouteFeasibility',
    description: 'Calculate road distance, driving time, flood inundation hazards, and recommended vehicle between a warehouse and destination.',
    parameters: {
      type: 'OBJECT',
      properties: {
        warehouseId: { type: 'STRING', description: 'ID of origin warehouse' },
        locationId: { type: 'STRING', description: 'ID of destination location' },
      },
      required: ['warehouseId', 'locationId'],
    },
    execute: async (params) => {
      const wh = dbStore.getWarehouseById(params.warehouseId as string);
      const loc = dbStore.getLocationById(params.locationId as string);
      if (!wh || !loc) {
        return { error: 'Warehouse or Location not found' };
      }
      const route = await calculateRoute(wh.latitude, wh.longitude, loc.latitude, loc.longitude, loc.accessRoadStatus);
      return {
        origin: wh.name,
        destination: loc.name,
        route,
      };
    },
  },

  optimizeReliefAllocation: {
    name: 'optimizeReliefAllocation',
    description: 'Run the deterministic multi-hub capacity-constrained optimization solver. Calculates exact allocation matrix without hallucinating stock.',
    parameters: {
      type: 'OBJECT',
      properties: {
        incidentId: { type: 'STRING', description: 'Target incident ID' },
      },
    },
    execute: (params) => {
      const incidentId = (params.incidentId as string) || dbStore.getIncidents()[0]?.id;
      const plan = optimizeReliefAllocation({ incidentId });
      return { plan };
    },
  },

  createDraftReliefOrder: {
    name: 'createDraftReliefOrder',
    description: 'Create a new DRAFT relief order awaiting mandatory Disaster Manager human approval. (AI cannot auto-dispatch).',
    parameters: {
      type: 'OBJECT',
      properties: {
        warehouseId: { type: 'STRING' },
        destinationLocationId: { type: 'STRING' },
        foodPackets: { type: 'NUMBER' },
        waterLiters: { type: 'NUMBER' },
        medicalKits: { type: 'NUMBER' },
      },
      required: ['warehouseId', 'destinationLocationId'],
    },
    execute: (params) => {
      const wh = dbStore.getWarehouseById(params.warehouseId as string);
      const loc = dbStore.getLocationById(params.destinationLocationId as string);
      if (!wh || !loc) {
        return { error: 'Warehouse or location not found' };
      }

      const dist = calculateHaversineDistanceKm(wh.latitude, wh.longitude, loc.latitude, loc.longitude);
      const travelMins = estimateTravelMinutes(dist, loc.accessRoadStatus);
      const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

      const draftOrder: ReliefOrder = {
        id: `ord-${uuidv4().substring(0, 8)}`,
        orderNumber,
        incidentId: loc.incidentId,
        warehouseId: wh.id,
        warehouseName: wh.name,
        destinationLocationId: loc.id,
        destinationLocationName: loc.name,
        status: 'DRAFT',
        assignedVehicleType: loc.accessRoadStatus === 'COMPLETELY_FLOODED' ? 'RESCUE_BOAT' : 'TRUCK_4x4',
        estimatedDistanceKm: dist,
        estimatedTravelMinutes: travelMins,
        roadHazardWarning:
          loc.accessRoadStatus !== 'OPEN' ? `Road hazard: ${loc.accessRoadStatus}` : undefined,
        routeConfidence: 'VERIFIED_SAFE',
        createdAt: new Date().toISOString(),
        items: [
          {
            itemCategory: 'FOOD',
            itemName: 'High-Energy Fortified Ration Packs (MRE)',
            unit: 'packets',
            quantityRequested: Number(params.foodPackets) || loc.requiredFoodPackets,
            quantityAllocated: Number(params.foodPackets) || loc.requiredFoodPackets,
          },
          {
            itemCategory: 'WATER',
            itemName: 'Potable Water Jerrycans (10L)',
            unit: 'liters',
            quantityRequested: Number(params.waterLiters) || loc.requiredDrinkingWaterLiters,
            quantityAllocated: Number(params.waterLiters) || loc.requiredDrinkingWaterLiters,
          },
          {
            itemCategory: 'MEDICAL',
            itemName: 'Emergency Waterborne Disease Trauma Kit',
            unit: 'kits',
            quantityRequested: Number(params.medicalKits) || loc.requiredMedicalKits,
            quantityAllocated: Number(params.medicalKits) || loc.requiredMedicalKits,
          },
        ],
        notes: 'Created autonomously by ResQ Copilot as DRAFT. Requires human manager approval.',
      };

      dbStore.saveOrder(draftOrder);
      return { success: true, order: draftOrder };
    },
  },

  getOrderStatus: {
    name: 'getOrderStatus',
    description: 'Get current status and convoy tracking for an order number or ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderIdOrNumber: { type: 'STRING' },
      },
      required: ['orderIdOrNumber'],
    },
    execute: (params) => {
      const q = String(params.orderIdOrNumber).toLowerCase();
      const order = dbStore.getOrders().find(
        (o) => o.id.toLowerCase() === q || o.orderNumber.toLowerCase() === q
      );
      if (!order) {
        return { error: `Order '${params.orderIdOrNumber}' not found` };
      }
      return { order };
    },
  },

  auditTrailQuery: {
    name: 'auditTrailQuery',
    description: 'Retrieve recent system transactions, approvals, and dispatch actions.',
    parameters: { type: 'OBJECT', properties: {} },
    execute: () => {
      return { logs: dbStore.auditLogs.slice(0, 10) };
    },
  },
};

export async function executeTool(
  toolName: string,
  params: Record<string, unknown>
): Promise<ToolExecutionRecord> {
  const start = Date.now();
  const tool = registeredTools[toolName];

  if (!tool) {
    return {
      id: uuidv4(),
      toolName,
      inputParameters: params,
      outputResult: { error: `Tool ${toolName} not found` },
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      status: 'ERROR',
    };
  }

  try {
    const result = await tool.execute(params);
    return {
      id: uuidv4(),
      toolName,
      inputParameters: params,
      outputResult: result,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      id: uuidv4(),
      toolName,
      inputParameters: params,
      outputResult: { error: msg },
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      status: 'ERROR',
    };
  }
}
