// ResQFlow AI — Domain Type Definitions

export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DeliveryStatus = 'UNASSIGNED' | 'ALLOCATED' | 'IN_TRANSIT' | 'DELIVERED';
export type OrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type UserRole = 'ADMIN' | 'DISASTER_MANAGER' | 'WAREHOUSE_OPERATOR' | 'VIEWER';
export type ResourceCategory = 'FOOD' | 'WATER' | 'MEDICAL' | 'SHELTER' | 'EQUIPMENT';

export interface Incident {
  id: string;
  title: string;
  disasterType: 'FLOOD' | 'CYCLONE' | 'HEAVY_RAINFALL' | 'HEATWAVE';
  severity: SeverityLevel;
  state: string;
  region: string;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  reportedAt: string;
  affectedPopulationTotal: number;
  activeVillagesCount: number;
  riverBasin?: string;
  rainfallPast24hMm: number;
  description: string;
}

export interface AffectedLocation {
  id: string;
  incidentId: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  populationAffected: number;
  requiredFoodPackets: number;
  requiredDrinkingWaterLiters: number;
  requiredMedicalKits: number;
  requiredBlankets: number;
  urgencyLevel: UrgencyLevel;
  deliveryStatus: DeliveryStatus;
  accessRoadStatus: 'OPEN' | 'WATERLOGGED' | 'COMPLETELY_FLOODED' | 'UNVERIFIED';
  contactPerson?: string;
  contactPhone?: string;
  lastUpdated: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  totalCapacitySqft: number;
  utilizedCapacityPercent: number;
  contactPhone: string;
  isOperational: boolean;
  availableVehicles: number;
  availableRescueBoats: number;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  category: ResourceCategory;
  itemName: string;
  unit: string;
  quantityAvailable: number;
  quantityReserved: number;
  reorderThreshold: number;
  lastRestocked: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  warehouseId: string;
  type: 'STOCK_IN' | 'RESERVED' | 'DISPATCH_OUT' | 'ADJUSTMENT';
  deltaQuantity: number;
  orderId?: string;
  notes: string;
  timestamp: string;
  actor: string;
}

export interface ReliefOrderItem {
  itemCategory: ResourceCategory;
  itemName: string;
  unit: string;
  quantityRequested: number;
  quantityAllocated: number;
}

export interface ReliefOrder {
  id: string;
  orderNumber: string;
  incidentId: string;
  warehouseId: string;
  warehouseName: string;
  destinationLocationId: string;
  destinationLocationName: string;
  status: OrderStatus;
  assignedVehicleType: 'TRUCK_4x4' | 'RESCUE_BOAT' | 'TRACTOR' | 'LIGHT_VAN';
  assignedVehicleReg?: string;
  items: ReliefOrderItem[];
  estimatedDistanceKm: number;
  estimatedTravelMinutes: number;
  roadHazardWarning?: string;
  routeConfidence: 'VERIFIED_SAFE' | 'POTENTIALLY_INUNDATED' | 'OFFLINE_ESTIMATE';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  notes?: string;
}

export interface AllocationPlanResult {
  planId: string;
  timestamp: string;
  incidentTitle: string;
  allocations: {
    locationId: string;
    locationName: string;
    urgency: UrgencyLevel;
    warehouseId: string;
    warehouseName: string;
    distanceKm: number;
    allocatedFood: number;
    allocatedWater: number;
    allocatedMedical: number;
    fulfillmentRatePercent: number;
    notes: string;
  }[];
  totalLocationsServed: number;
  overallFulfillmentPercent: number;
  unmetShortages: {
    category: string;
    deficit: number;
  }[];
  mathematicalExplanation: string;
}

export interface ToolExecutionRecord {
  id: string;
  toolName: string;
  inputParameters: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  durationMs: number;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolExecutionRecord[];
  suggestedAction?: {
    type: 'APPROVE_ORDER' | 'VIEW_PLAN' | 'CHECK_WEATHER' | 'TRIGGER_SOLVER';
    label: string;
    payload: Record<string, unknown>;
  };
}

export interface WeatherTelemetry {
  locationName: string;
  latitude: number;
  longitude: number;
  currentTempC: number;
  rainfallPast24hMm: number;
  forecastPrecipitation72hMm: number;
  windSpeedKmh: number;
  floodRiskScore: number; // 0 - 100
  floodRiskCategory: SeverityLevel;
  dataSource: 'OPEN_METEO_API' | 'SIMULATION_OVERRIDE';
  lastUpdated: string;
}
