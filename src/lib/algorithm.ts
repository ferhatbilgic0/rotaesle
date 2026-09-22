import { Province } from "@/data/provinces";
import { Load, haversineDistance } from "@/data/mockData";

/**
 * Point-to-segment distance.
 * Given a line segment from A to B and a point P,
 * returns the minimum great-circle distance (km) from P to the segment AB.
 *
 * We work in 2D lat/lng space (adequate for Turkey's geographic extent).
 */
function pointToSegmentDistance(
  pLat: number, pLng: number,
  aLat: number, aLng: number,
  bLat: number, bLng: number
): number {
  // Vector AB
  const abLat = bLat - aLat;
  const abLng = bLng - aLng;
  // Vector AP
  const apLat = pLat - aLat;
  const apLng = pLng - aLng;

  const ab2 = abLat * abLat + abLng * abLng;
  if (ab2 === 0) {
    // Degenerate: A === B
    return haversineDistance(pLat, pLng, aLat, aLng);
  }

  // t is the projection parameter [0, 1] clamped to the segment
  const t = Math.max(0, Math.min(1, (apLat * abLat + apLng * abLng) / ab2));

  // Closest point on the segment to P
  const closestLat = aLat + t * abLat;
  const closestLng = aLng + t * abLng;

  return haversineDistance(pLat, pLng, closestLat, closestLng);
}

/**
 * Extra distance incurred by detouring through an intermediate city.
 * i.e., dist(start → waypoint) + dist(waypoint → end) − dist(start → end)
 */
export function deviationDistance(
  start: Province,
  waypoint: Province,
  end: Province
): number {
  const direct = haversineDistance(start.lat, start.lng, end.lat, end.lng);
  const via =
    haversineDistance(start.lat, start.lng, waypoint.lat, waypoint.lng) +
    haversineDistance(waypoint.lat, waypoint.lng, end.lat, end.lng);
  return Math.max(0, via - direct);
}

export interface MatchedLoad {
  load: Load;
  /** Perpendicular km off the main route line */
  perpendicularKm: number;
  /** Extra km added to total journey */
  extraKm: number;
  /** Earnings in TL for taking this load */
  earningsTL: number;
  /** Effective TL per extra km driven */
  tlPerExtraKm: number;
  /** Efficiency score for sorting (higher = better) */
  score: number;
  /** Whether surge pricing applies */
  isSurge: boolean;
  surgePercent: number;
}

/**
 * Core route-matching algorithm.
 *
 * Finds loads whose pickup city (from) lies within `maxDeviationKm` of the
 * straight line between `startCity` and `endCity`, AND whose drop-off city (to)
 * also lies reasonably along the onward path (within 1.5× the direct distance
 * from the pickup to the end city — so we don't send the driver backwards).
 *
 * Returns matches sorted by score (earnings per extra km).
 */
export function findMatchingLoads(
  startCity: Province,
  endCity: Province,
  allLoads: Load[],
  maxDeviationKm: number
): MatchedLoad[] {
  const directKm = haversineDistance(
    startCity.lat, startCity.lng,
    endCity.lat, endCity.lng
  );

  const results: MatchedLoad[] = [];

  for (const load of allLoads) {
    if (load.status !== "available") continue;
    // Can't pick up from origin or destination
    if (load.from.id === startCity.id || load.from.id === endCity.id) continue;
    if (load.to.id === startCity.id) continue;

    const pickupCity = load.from;
    const dropoffCity = load.to;

    // 1. How far is the pickup city from the straight-line route?
    const perpKm = pointToSegmentDistance(
      pickupCity.lat, pickupCity.lng,
      startCity.lat, startCity.lng,
      endCity.lat, endCity.lng
    );

    if (perpKm > maxDeviationKm) continue;

    // 2. The drop-off city should lie "forward" — not massively behind us.
    //    We allow it if it's within 1.4× the direct pickup→end distance.
    const pickupToEnd = haversineDistance(
      pickupCity.lat, pickupCity.lng,
      endCity.lat, endCity.lng
    );
    const dropoffToEnd = haversineDistance(
      dropoffCity.lat, dropoffCity.lng,
      endCity.lat, endCity.lng
    );

    // Dropoff shouldn't be further from end than pickup is (going backwards)
    if (dropoffToEnd > pickupToEnd * 1.5) continue;

    // 3. Calculate total extra km for this detour
    const extraKm = deviationDistance(startCity, pickupCity, endCity);

    // 4. Earnings with surge
    const baseEarnings = load.recommendedPriceTL;
    const surgeMultiplier = 1 + load.surgePercent / 100;
    const earnings = Math.round(baseEarnings * surgeMultiplier);

    // 5. Score: TL per km of deviation (prefer high-paying, low-deviation loads)
    const denominator = Math.max(extraKm, 10); // avoid div/0
    const score = earnings / denominator;

    results.push({
      load,
      perpendicularKm: Math.round(perpKm),
      extraKm: Math.round(extraKm),
      earningsTL: earnings,
      tlPerExtraKm: Math.round(earnings / Math.max(extraKm, 1)),
      score,
      isSurge: load.isSurgePricing,
      surgePercent: load.surgePercent,
    });
  }

  // Sort: best score first
  results.sort((a, b) => b.score - a.score);
  return results;
}

/** Format a number as Turkish Lira string */
export function formatTL(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format kg weight with appropriate unit */
export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} ton`;
  return `${kg} kg`;
}

/** Time ago string in Turkish */
export function timeAgoTR(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (mins > 0) return `${mins} dakika önce`;
  return "Az önce";
}

/** Deadline string in Turkish */
export function deadlineTR(date: Date): string {
  const diff = date.getTime() - Date.now();
  if (diff < 0) return "Süresi doldu";
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} gün ${hours % 24} saat kaldı`;
  if (hours > 0) return `${hours} saat kaldı`;
  return "1 saatten az";
}
