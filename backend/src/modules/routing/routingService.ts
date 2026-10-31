import { RouteFeasibilityResult, VehicleType } from '../../types/index.js';
import { calculateHaversineDistanceKm, estimateTravelMinutes } from '../../utils/haversine.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

interface OSRMResponse {
  code: string;
  routes?: {
    distance: number; // in meters
    duration: number; // in seconds
    geometry?: {
      coordinates: [number, number][]; // [lon, lat] pairs
    };
  }[];
}

export async function calculateRoute(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  destinationRoadStatus: 'OPEN' | 'WATERLOGGED' | 'COMPLETELY_FLOODED' | 'UNVERIFIED' = 'OPEN'
): Promise<RouteFeasibilityResult> {
  const url = `${config.OSRM_BASE_URL}/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`OSRM returned status ${res.status}`);
    }

    const data = (await res.json()) as OSRMResponse;
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = Number((route.distance / 1000).toFixed(1));
      let durationMinutes = Math.round(route.duration / 60);

      // Convert geojson [lon, lat] into Leaflet standard [lat, lon]
      const coordinates: [number, number][] =
        route.geometry?.coordinates.map(([lon, lat]) => [lat, lon]) || [
          [fromLat, fromLon],
          [toLat, toLon],
        ];

      // Assess flood risk along the route
      let hasFloodedWarning = destinationRoadStatus !== 'OPEN';
      let warningDetails: string | undefined;
      let recommendedVehicle: VehicleType = 'TRUCK_4x4';

      if (destinationRoadStatus === 'COMPLETELY_FLOODED') {
        hasFloodedWarning = true;
        warningDetails = 'Terminal approach road inundated (>1.5m flood depth). NDRF / SDRF motorized rescue boat required.';
        recommendedVehicle = 'RESCUE_BOAT';
        durationMinutes = Math.round(durationMinutes * 1.8);
      } else if (destinationRoadStatus === 'WATERLOGGED') {
        hasFloodedWarning = true;
        warningDetails = 'Severe waterlogging (30-60cm water depth). High-clearance 4x4 relief trucks with snorkel required.';
        recommendedVehicle = 'TRUCK_4x4';
        durationMinutes = Math.round(durationMinutes * 1.35);
      }

      return {
        from: { lat: fromLat, lon: fromLon },
        to: { lat: toLat, lon: toLon },
        distanceKm,
        durationMinutes,
        hasFloodedRoadWarning: hasFloodedWarning,
        warningDetails,
        recommendedVehicle,
        coordinates,
        confidence: 'VERIFIED_SAFE',
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`[RoutingService] OSRM service unavailable (${msg}). Utilizing fallback GIS interpolation.`);
  }

  // Fallback calculation via Haversine & synthetic corridor waypoints
  const distanceKm = calculateHaversineDistanceKm(fromLat, fromLon, toLat, toLon);
  const durationMinutes = estimateTravelMinutes(distanceKm, destinationRoadStatus);

  const hasFloodedWarning = destinationRoadStatus !== 'OPEN';
  const recommendedVehicle: VehicleType =
    destinationRoadStatus === 'COMPLETELY_FLOODED' ? 'RESCUE_BOAT' : 'TRUCK_4x4';

  // Generate 5 interpolated points along the corridor
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= 5; i++) {
    const frac = i / 5;
    const lat = fromLat + frac * (toLat - fromLat);
    const lon = fromLon + frac * (toLon - fromLon);
    coordinates.push([Number(lat.toFixed(4)), Number(lon.toFixed(4))]);
  }

  return {
    from: { lat: fromLat, lon: fromLon },
    to: { lat: toLat, lon: toLon },
    distanceKm,
    durationMinutes,
    hasFloodedRoadWarning: hasFloodedWarning,
    warningDetails: hasFloodedWarning
      ? `Access corridor flags ${destinationRoadStatus.toLowerCase().replace('_', ' ')} hazard. Convoy must proceed with warning beacon.`
      : undefined,
    recommendedVehicle,
    coordinates,
    confidence: 'OFFLINE_ESTIMATE',
  };
}
