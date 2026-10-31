/**
 * Haversine geographic calculation for disaster relief logistics
 */

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;

  // Rural India & flood zone road detour coefficient: roads are ~28% longer than straight line
  const roadDetourFactor = 1.28;
  return Number((straightLineDistance * roadDetourFactor).toFixed(1));
}

export function estimateTravelMinutes(
  distanceKm: number,
  roadCondition: 'OPEN' | 'WATERLOGGED' | 'COMPLETELY_FLOODED' | 'UNVERIFIED' = 'OPEN'
): number {
  // Base average speed on rural highways: 42 km/h
  let avgSpeedKmh = 42;

  if (roadCondition === 'WATERLOGGED') {
    avgSpeedKmh = 18; // Heavy waterlogging slows down high-clearance 4x4 trucks
  } else if (roadCondition === 'COMPLETELY_FLOODED') {
    avgSpeedKmh = 12; // Requires amphibious rescue boats or tractors
  }

  const hours = distanceKm / avgSpeedKmh;
  return Math.max(15, Math.round(hours * 60)); // minimum 15 mins
}
