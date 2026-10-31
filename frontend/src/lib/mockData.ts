import {
  Incident,
  AffectedLocation,
  Warehouse,
  InventoryItem,
  ReliefOrder,
  WeatherTelemetry,
  AllocationPlanResult
} from '@/types';

export const mockIncidents: Incident[] = [
  {
    id: 'inc-bihar-2026-01',
    title: 'North Bihar Monsoon Deluge 2026 (Kosi & Gandak Basins)',
    disasterType: 'FLOOD',
    severity: 'CRITICAL',
    state: 'Bihar',
    region: 'Kosi & Mithila Division',
    status: 'ACTIVE',
    reportedAt: '2026-07-28T04:30:00Z',
    affectedPopulationTotal: 184500,
    activeVillagesCount: 28,
    riverBasin: 'Kosi - Bagmati - Gandak System',
    rainfallPast24hMm: 142.5,
    description: 'Catastrophic river swell following heavy cloudbursts in upstream Nepal catchment. Embankments breached at 3 locations in Supaul and Madhubani. Multiple road corridors inundated.'
  },
  {
    id: 'inc-bihar-2026-02',
    title: 'Ganga Basin Urban Waterlogging Threat',
    disasterType: 'HEAVY_RAINFALL',
    severity: 'MODERATE',
    state: 'Bihar',
    region: 'Patna Urban & Rural Border',
    status: 'ACTIVE',
    reportedAt: '2026-07-29T10:15:00Z',
    affectedPopulationTotal: 34000,
    activeVillagesCount: 8,
    riverBasin: 'Ganga Mainstem',
    rainfallPast24hMm: 68.2,
    description: 'Sustained monsoon showers causing storm drain backflow. Sump pump stations operating at 95% capacity.'
  }
];

export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-pat-01',
    name: 'Patna Central Relief Logistics Superhub',
    code: 'WH-PAT-01',
    address: 'Plot 14, Transport Nagar, Kumhrar, Patna, Bihar 800026',
    district: 'Patna',
    latitude: 25.5941,
    longitude: 85.1376,
    totalCapacitySqft: 45000,
    utilizedCapacityPercent: 68,
    contactPhone: '+91 612 234 8920',
    isOperational: true,
    availableVehicles: 14,
    availableRescueBoats: 6
  },
  {
    id: 'wh-muz-02',
    name: 'Muzaffarpur North Rapid Staging Depot',
    code: 'WH-MUZ-02',
    address: 'NH-28 Bypass, Maripur, Muzaffarpur, Bihar 842001',
    district: 'Muzaffarpur',
    latitude: 26.1209,
    longitude: 85.3647,
    totalCapacitySqft: 32000,
    utilizedCapacityPercent: 78,
    contactPhone: '+91 621 289 1104',
    isOperational: true,
    availableVehicles: 9,
    availableRescueBoats: 11
  },
  {
    id: 'wh-bha-03',
    name: 'Bhagalpur Eastern Riverine Relief Hub',
    code: 'WH-BHA-03',
    address: 'Industrial Area, Barari, Bhagalpur, Bihar 812003',
    district: 'Bhagalpur',
    latitude: 25.2425,
    longitude: 86.9842,
    totalCapacitySqft: 28000,
    utilizedCapacityPercent: 54,
    contactPhone: '+91 641 240 5519',
    isOperational: true,
    availableVehicles: 8,
    availableRescueBoats: 8
  }
];

export const mockAffectedLocations: AffectedLocation[] = [
  {
    id: 'loc-sup-01',
    incidentId: 'inc-bihar-2026-01',
    name: 'Supaul Village Ward 4 & River Bend',
    district: 'Supaul',
    latitude: 26.1260,
    longitude: 86.6056,
    populationAffected: 14200,
    requiredFoodPackets: 4200,
    requiredDrinkingWaterLiters: 12000,
    requiredMedicalKits: 450,
    requiredBlankets: 1800,
    urgencyLevel: 'CRITICAL',
    deliveryStatus: 'UNASSIGNED',
    accessRoadStatus: 'WATERLOGGED',
    contactPerson: 'Mukhiya R. K. Yadav',
    contactPhone: '+91 94310 88219',
    lastUpdated: '2026-07-31T05:30:00Z'
  },
  {
    id: 'loc-dar-02',
    incidentId: 'inc-bihar-2026-01',
    name: 'Darbhanga Lowland Settlement (Biraul)',
    district: 'Darbhanga',
    latitude: 26.1542,
    longitude: 85.8918,
    populationAffected: 18600,
    requiredFoodPackets: 5500,
    requiredDrinkingWaterLiters: 15000,
    requiredMedicalKits: 600,
    requiredBlankets: 2400,
    urgencyLevel: 'CRITICAL',
    deliveryStatus: 'UNASSIGNED',
    accessRoadStatus: 'COMPLETELY_FLOODED',
    contactPerson: 'Dr. Anamika Das (PHC Medical Officer)',
    contactPhone: '+91 98350 44102',
    lastUpdated: '2026-07-31T05:45:00Z'
  },
  {
    id: 'loc-mad-03',
    incidentId: 'inc-bihar-2026-01',
    name: 'Madhubani Relief Camp 2 (Jhanjharpur)',
    district: 'Madhubani',
    latitude: 26.2625,
    longitude: 86.2758,
    populationAffected: 9800,
    requiredFoodPackets: 2800,
    requiredDrinkingWaterLiters: 8000,
    requiredMedicalKits: 320,
    requiredBlankets: 1200,
    urgencyLevel: 'HIGH',
    deliveryStatus: 'ALLOCATED',
    accessRoadStatus: 'WATERLOGGED',
    contactPerson: 'Inspector Sunil Thakur',
    contactPhone: '+91 94700 31289',
    lastUpdated: '2026-07-31T04:15:00Z'
  },
  {
    id: 'loc-sah-04',
    incidentId: 'inc-bihar-2026-01',
    name: 'Saharsa Riparian Sector (Nauhatta)',
    district: 'Saharsa',
    latitude: 25.8835,
    longitude: 86.6006,
    populationAffected: 7400,
    requiredFoodPackets: 2100,
    requiredDrinkingWaterLiters: 6500,
    requiredMedicalKits: 200,
    requiredBlankets: 900,
    urgencyLevel: 'MEDIUM',
    deliveryStatus: 'UNASSIGNED',
    accessRoadStatus: 'OPEN',
    contactPerson: 'Gram Pradhan B. Paswan',
    contactPhone: '+91 99342 19044',
    lastUpdated: '2026-07-31T03:00:00Z'
  },
  {
    id: 'loc-sam-05',
    incidentId: 'inc-bihar-2026-01',
    name: 'Samastipur Riverbank Colony (Rosera)',
    district: 'Samastipur',
    latitude: 25.7533,
    longitude: 86.0125,
    populationAffected: 11200,
    requiredFoodPackets: 3200,
    requiredDrinkingWaterLiters: 9000,
    requiredMedicalKits: 380,
    requiredBlankets: 1400,
    urgencyLevel: 'HIGH',
    deliveryStatus: 'UNASSIGNED',
    accessRoadStatus: 'OPEN',
    contactPerson: 'SDO Control Room',
    contactPhone: '+91 6274 222119',
    lastUpdated: '2026-07-31T05:00:00Z'
  }
];

export const mockInventory: InventoryItem[] = [
  // Patna Superhub
  {
    id: 'inv-01',
    warehouseId: 'wh-pat-01',
    warehouseName: 'Patna Central Relief Logistics Superhub',
    category: 'FOOD',
    itemName: 'Ready-to-Eat High-Calorie Ration Pack (72h Survival)',
    unit: 'packets',
    quantityAvailable: 18500,
    quantityReserved: 3500,
    reorderThreshold: 5000,
    lastRestocked: '2026-07-29T18:00:00Z'
  },
  {
    id: 'inv-02',
    warehouseId: 'wh-pat-01',
    warehouseName: 'Patna Central Relief Logistics Superhub',
    category: 'WATER',
    itemName: 'Chlorine-Treated Potable Bottled Water (5L Jerrycan)',
    unit: 'liters',
    quantityAvailable: 42000,
    quantityReserved: 8000,
    reorderThreshold: 10000,
    lastRestocked: '2026-07-30T09:00:00Z'
  },
  {
    id: 'inv-03',
    warehouseId: 'wh-pat-01',
    warehouseName: 'Patna Central Relief Logistics Superhub',
    category: 'MEDICAL',
    itemName: 'Emergency Flood Trauma & ORS Antidiarrheal Kit',
    unit: 'kits',
    quantityAvailable: 1950,
    quantityReserved: 350,
    reorderThreshold: 400,
    lastRestocked: '2026-07-28T14:30:00Z'
  },
  {
    id: 'inv-04',
    warehouseId: 'wh-pat-01',
    warehouseName: 'Patna Central Relief Logistics Superhub',
    category: 'SHELTER',
    itemName: 'Waterproof Thermal Insulation Blanket',
    unit: 'blankets',
    quantityAvailable: 6400,
    quantityReserved: 1200,
    reorderThreshold: 1500,
    lastRestocked: '2026-07-25T11:00:00Z'
  },
  // Muzaffarpur North Hub
  {
    id: 'inv-05',
    warehouseId: 'wh-muz-02',
    warehouseName: 'Muzaffarpur North Rapid Staging Depot',
    category: 'FOOD',
    itemName: 'Ready-to-Eat High-Calorie Ration Pack (72h Survival)',
    unit: 'packets',
    quantityAvailable: 9200,
    quantityReserved: 2800,
    reorderThreshold: 3000,
    lastRestocked: '2026-07-30T14:00:00Z'
  },
  {
    id: 'inv-06',
    warehouseId: 'wh-muz-02',
    warehouseName: 'Muzaffarpur North Rapid Staging Depot',
    category: 'WATER',
    itemName: 'Chlorine-Treated Potable Bottled Water (5L Jerrycan)',
    unit: 'liters',
    quantityAvailable: 21500,
    quantityReserved: 6000,
    reorderThreshold: 5000,
    lastRestocked: '2026-07-30T17:00:00Z'
  },
  {
    id: 'inv-07',
    warehouseId: 'wh-muz-02',
    warehouseName: 'Muzaffarpur North Rapid Staging Depot',
    category: 'MEDICAL',
    itemName: 'Emergency Flood Trauma & ORS Antidiarrheal Kit',
    unit: 'kits',
    quantityAvailable: 840,
    quantityReserved: 250,
    reorderThreshold: 200,
    lastRestocked: '2026-07-29T12:00:00Z'
  },
  // Bhagalpur Hub
  {
    id: 'inv-08',
    warehouseId: 'wh-bha-03',
    warehouseName: 'Bhagalpur Eastern Riverine Relief Hub',
    category: 'FOOD',
    itemName: 'Ready-to-Eat High-Calorie Ration Pack (72h Survival)',
    unit: 'packets',
    quantityAvailable: 7800,
    quantityReserved: 1000,
    reorderThreshold: 2000,
    lastRestocked: '2026-07-27T08:00:00Z'
  },
  {
    id: 'inv-09',
    warehouseId: 'wh-bha-03',
    warehouseName: 'Bhagalpur Eastern Riverine Relief Hub',
    category: 'WATER',
    itemName: 'Chlorine-Treated Potable Bottled Water (5L Jerrycan)',
    unit: 'liters',
    quantityAvailable: 16000,
    quantityReserved: 2000,
    reorderThreshold: 4000,
    lastRestocked: '2026-07-28T16:00:00Z'
  }
];

export const mockOrders: ReliefOrder[] = [
  {
    id: 'ord-2026-001',
    orderNumber: 'ORD-2026-001',
    incidentId: 'inc-bihar-2026-01',
    warehouseId: 'wh-muz-02',
    warehouseName: 'Muzaffarpur North Rapid Staging Depot',
    destinationLocationId: 'loc-mad-03',
    destinationLocationName: 'Madhubani Relief Camp 2 (Jhanjharpur)',
    status: 'IN_TRANSIT',
    assignedVehicleType: 'TRUCK_4x4',
    assignedVehicleReg: 'BR-06-GB-4819',
    items: [
      { itemCategory: 'FOOD', itemName: 'Ration Pack 72h', unit: 'packets', quantityRequested: 2800, quantityAllocated: 2800 },
      { itemCategory: 'WATER', itemName: 'Potable Water 5L', unit: 'liters', quantityRequested: 8000, quantityAllocated: 6000 },
      { itemCategory: 'MEDICAL', itemName: 'Trauma & ORS Kits', unit: 'kits', quantityRequested: 320, quantityAllocated: 250 }
    ],
    estimatedDistanceKm: 78.4,
    estimatedTravelMinutes: 135,
    roadHazardWarning: 'Caution: NH-57 section near Kamla Balan river approach has 15cm standing water. Passable for heavy 4x4 trucks only.',
    routeConfidence: 'VERIFIED_SAFE',
    createdAt: '2026-07-30T22:15:00Z',
    approvedBy: 'Officer M. Sharma (Disaster Lead)',
    approvedAt: '2026-07-30T22:30:00Z',
    dispatchedAt: '2026-07-31T01:00:00Z',
    notes: 'Escorted by State Disaster Response Force (SDRF) Unit 4.'
  },
  {
    id: 'ord-2026-002',
    orderNumber: 'ORD-2026-002',
    incidentId: 'inc-bihar-2026-01',
    warehouseId: 'wh-muz-02',
    warehouseName: 'Muzaffarpur North Rapid Staging Depot',
    destinationLocationId: 'loc-dar-02',
    destinationLocationName: 'Darbhanga Lowland Settlement (Biraul)',
    status: 'PENDING_APPROVAL',
    assignedVehicleType: 'RESCUE_BOAT',
    assignedVehicleReg: 'NDRF-BOAT-07',
    items: [
      { itemCategory: 'FOOD', itemName: 'Ration Pack 72h', unit: 'packets', quantityRequested: 5500, quantityAllocated: 4000 },
      { itemCategory: 'WATER', itemName: 'Potable Water 5L', unit: 'liters', quantityRequested: 15000, quantityAllocated: 10000 },
      { itemCategory: 'MEDICAL', itemName: 'Trauma & ORS Kits', unit: 'kits', quantityRequested: 600, quantityAllocated: 400 }
    ],
    estimatedDistanceKm: 58.2,
    estimatedTravelMinutes: 110,
    roadHazardWarning: 'SH-88 road completely submerged at Biraul culvert. Requires amphibious boat dispatch directly from Hayaghat.',
    routeConfidence: 'POTENTIALLY_INUNDATED',
    createdAt: '2026-07-31T04:45:00Z',
    notes: 'AI Agent Generated Draft. Awaiting supervisor human approval before inventory lock.'
  },
  {
    id: 'ord-2026-003',
    orderNumber: 'ORD-2026-003',
    incidentId: 'inc-bihar-2026-01',
    warehouseId: 'wh-pat-01',
    warehouseName: 'Patna Central Relief Logistics Superhub',
    destinationLocationId: 'loc-sup-01',
    destinationLocationName: 'Supaul Village Ward 4 & River Bend',
    status: 'DRAFT',
    assignedVehicleType: 'TRUCK_4x4',
    items: [
      { itemCategory: 'FOOD', itemName: 'Ration Pack 72h', unit: 'packets', quantityRequested: 4200, quantityAllocated: 3500 },
      { itemCategory: 'WATER', itemName: 'Potable Water 5L', unit: 'liters', quantityRequested: 12000, quantityAllocated: 8000 },
      { itemCategory: 'MEDICAL', itemName: 'Trauma & ORS Kits', unit: 'kits', quantityRequested: 450, quantityAllocated: 350 }
    ],
    estimatedDistanceKm: 184.6,
    estimatedTravelMinutes: 260,
    roadHazardWarning: 'Long haul corridor across Kosi Mahasetu. Check bridge wind speed telemetry before final departure.',
    routeConfidence: 'VERIFIED_SAFE',
    createdAt: '2026-07-31T05:10:00Z',
    notes: 'Draft plan generated by ResQFlow AI Solver.'
  }
];

export const mockWeather: WeatherTelemetry[] = [
  {
    locationName: 'Supaul / Kosi Embankment',
    latitude: 26.1260,
    longitude: 86.6056,
    currentTempC: 27.8,
    rainfallPast24hMm: 168.4,
    forecastPrecipitation72hMm: 210.0,
    windSpeedKmh: 24.5,
    floodRiskScore: 94,
    floodRiskCategory: 'CRITICAL',
    dataSource: 'OPEN_METEO_API',
    lastUpdated: '2026-07-31T05:30:00Z'
  },
  {
    locationName: 'Darbhanga / Bagmati Basin',
    latitude: 26.1542,
    longitude: 85.8918,
    currentTempC: 28.2,
    rainfallPast24hMm: 134.0,
    forecastPrecipitation72hMm: 180.5,
    windSpeedKmh: 19.8,
    floodRiskScore: 89,
    floodRiskCategory: 'CRITICAL',
    dataSource: 'OPEN_METEO_API',
    lastUpdated: '2026-07-31T05:30:00Z'
  },
  {
    locationName: 'Muzaffarpur Staging Hub',
    latitude: 26.1209,
    longitude: 85.3647,
    currentTempC: 29.1,
    rainfallPast24hMm: 74.2,
    forecastPrecipitation72hMm: 95.0,
    windSpeedKmh: 16.2,
    floodRiskScore: 58,
    floodRiskCategory: 'MODERATE',
    dataSource: 'OPEN_METEO_API',
    lastUpdated: '2026-07-31T05:30:00Z'
  },
  {
    locationName: 'Patna Central Logistics Base',
    latitude: 25.5941,
    longitude: 85.1376,
    currentTempC: 30.5,
    rainfallPast24hMm: 42.1,
    forecastPrecipitation72hMm: 50.0,
    windSpeedKmh: 12.0,
    floodRiskScore: 35,
    floodRiskCategory: 'LOW',
    dataSource: 'OPEN_METEO_API',
    lastUpdated: '2026-07-31T05:30:00Z'
  }
];

export const mockDeterministicPlan: AllocationPlanResult = {
  planId: 'plan-opt-2026-07-31-01',
  timestamp: '2026-07-31T05:20:00Z',
  incidentTitle: 'North Bihar Monsoon Deluge 2026 (Kosi & Gandak Basins)',
  allocations: [
    {
      locationId: 'loc-dar-02',
      locationName: 'Darbhanga Lowland Settlement (Biraul)',
      urgency: 'CRITICAL',
      warehouseId: 'wh-muz-02',
      warehouseName: 'Muzaffarpur North Rapid Staging Depot',
      distanceKm: 58.2,
      allocatedFood: 4000,
      allocatedWater: 10000,
      allocatedMedical: 400,
      fulfillmentRatePercent: 73,
      notes: 'Rank 1 priority: Population 18,600 trapped by Bagmati backflow. Allocated nearest warehouse with rescue boat capability.'
    },
    {
      locationId: 'loc-sup-01',
      locationName: 'Supaul Village Ward 4 & River Bend',
      urgency: 'CRITICAL',
      warehouseId: 'wh-pat-01',
      warehouseName: 'Patna Central Relief Logistics Superhub',
      distanceKm: 184.6,
      allocatedFood: 3500,
      allocatedWater: 8000,
      allocatedMedical: 350,
      fulfillmentRatePercent: 78,
      notes: 'Rank 2 priority: Breach at ward 4. Patna Superhub reserves deployed via high-capacity convoy.'
    },
    {
      locationId: 'loc-mad-03',
      locationName: 'Madhubani Relief Camp 2 (Jhanjharpur)',
      urgency: 'HIGH',
      warehouseId: 'wh-muz-02',
      warehouseName: 'Muzaffarpur North Rapid Staging Depot',
      distanceKm: 78.4,
      allocatedFood: 2800,
      allocatedWater: 6000,
      allocatedMedical: 250,
      fulfillmentRatePercent: 88,
      notes: 'Rank 3 priority: Relief camp established on elevated school grounds. Muzaffarpur supplying remaining requirements.'
    }
  ],
  totalLocationsServed: 3,
  overallFulfillmentPercent: 79.6,
  unmetShortages: [
    { category: 'Potable Drinking Water', deficit: 7000 },
    { category: 'High-Calorie Ration Pack', deficit: 2400 },
    { category: 'Trauma & ORS Kits', deficit: 370 }
  ],
  mathematicalExplanation: 'Deterministic Constrained Optimization: Multi-hub priority knapsack executed. High/Critical urgency locations weighted with 2.5x multiplier. Distances evaluated via OSRM shortest navigable corridors. Patna and Muzaffarpur stock levels bound upper allocation constraints.'
};
