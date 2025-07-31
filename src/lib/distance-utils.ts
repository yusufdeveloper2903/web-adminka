/**
 * Distance conversion utilities
 */

// Conversion constants
const METERS_TO_MILES = 0.000621371
const MILES_TO_METERS = 1609.34
const METERS_TO_KM = 0.001
const KM_TO_METERS = 1000

/**
 * Convert meters to miles
 */
export const metersToMiles = (meters: number): number => {
  return meters * METERS_TO_MILES
}

/**
 * Convert miles to meters
 */
export const milesToMeters = (miles: number): number => {
  return miles * MILES_TO_METERS
}

/**
 * Convert meters to kilometers
 */
export const metersToKm = (meters: number): number => {
  return meters * METERS_TO_KM
}

/**
 * Convert kilometers to meters
 */
export const kmToMeters = (km: number): number => {
  return km * KM_TO_METERS
}

/**
 * Format distance with appropriate unit
 */
export const formatDistance = (meters: number, unit: "miles" | "km" = "miles"): string => {
  if (unit === "miles") {
    return metersToMiles(meters).toFixed(1)
  } else {
    return metersToKm(meters).toFixed(1)
  }
}

/**
 * Format duration from seconds to hours
 */
export const formatDuration = (seconds: number): string => {
  const hours = seconds / 3600
  return hours.toFixed(2)
}
