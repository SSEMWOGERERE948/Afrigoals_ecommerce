// lib/delivery/config.ts

/**
 * Delivery Configuration
 *
 * All values are read from environment variables with sensible fallbacks.
 * Update values in your .env.local or hosting dashboard (Vercel, etc.)
 * without needing a code change or redeploy.
 *
 * Fuel rate derivation:
 *   ratePerKm = (petrolPerLitre / motorcycleKmPerLitre) * roundTripFactor + riderMarginPerKm
 *   = (4,950 / 30) * 1.6 + 336 = ~600 UGX/km
 *
 * Benchmark: Kamwokya → Makerere Kikoni = 4.4km @ UGX 6,500 (moderate traffic) ✓
 */

function envNumber(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;
  const parsed = parseFloat(val);
  if (isNaN(parsed)) {
    console.warn(
      `[delivery/config] Invalid value for ${key}: "${val}", using fallback ${fallback}`,
    );
    return fallback;
  }
  return parsed;
}

export const DELIVERY_CONFIG = {
  origin: {
    name: process.env.STORE_NAME ?? "Main Shop",
    lat: envNumber("STORE_LAT", 0.31622566394454515),
    lng: envNumber("STORE_LNG", 32.57507330900026),
  },

  pricing: {
    baseFee: envNumber("DELIVERY_BASE_FEE", 2_500), // UGX flat handling charge
    minimumFee: envNumber("DELIVERY_MIN_FEE", 4_000), // floor price
    maxDistanceKm: envNumber("DELIVERY_MAX_DISTANCE_KM", 35), // service radius
    roundToNearest: envNumber("DELIVERY_ROUND_TO_NEAREST", 500), // UGX rounding increment
  },

  /**
   * Fuel model — update FUEL_PETROL_PER_LITRE in your env when
   * UEPRA publishes new pump prices. Everything else reprices automatically.
   */
  fuel: {
    petrolPerLitre: envNumber("FUEL_PETROL_PER_LITRE", 4_950), // UGX/L — UEPRA Mar 2026
    motorcycleKmPerLitre: envNumber("FUEL_MOTORCYCLE_KM_PER_LITRE", 30), // avg boda-boda economy
    roundTripFactor: envNumber("FUEL_ROUND_TRIP_FACTOR", 1.6), // rider returns empty
    riderMarginPerKm: envNumber("FUEL_RIDER_MARGIN_PER_KM", 336), // earnings + wear & tear
  },

  /**
   * Kampala traffic multipliers by hour (Africa/Kampala = UTC+3)
   * Adjust multipliers via env if your delivery SLA changes.
   */
  traffic: {
    peak: {
      multiplier: envNumber("TRAFFIC_PEAK_MULTIPLIER", 1.4),
      hours: [
        [7, 9],
        [17, 19],
      ] as [number, number][],
    },
    moderate: {
      multiplier: envNumber("TRAFFIC_MODERATE_MULTIPLIER", 1.15),
      hours: [
        [10, 16],
        [20, 21],
      ] as [number, number][],
    },
    offPeak: { multiplier: envNumber("TRAFFIC_OFF_PEAK_MULTIPLIER", 1.0) },
  },
} as const;

export type DeliveryConfig = typeof DELIVERY_CONFIG;
