import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

// Enable dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Convert UTC datetime to Central Time (CDT/CST) timezone
 * Automatically handles daylight saving time
 * @param utcDateTime - UTC datetime string from backend
 * @returns dayjs object in Central timezone
 */
export const convertUTCToCentral = (utcDateTime: string | Date) => {
  try {
    // Try using timezone plugin first
    return dayjs.utc(utcDateTime).tz("America/Chicago")
  } catch (error) {
    // Fallback to manual offset calculation
    const utcDate = dayjs.utc(utcDateTime)
    const month = utcDate.month() + 1 // dayjs months are 0-indexed

    // Daylight saving time roughly: March to November
    const isDST = month >= 3 && month <= 11
    const offset = isDST ? -5 : -6 // CDT: UTC-5, CST: UTC-6

    return utcDate.utcOffset(offset)
  }
}

/**
 * Convert UTC datetime to Central Time and format for display
 * @param utcDateTime - UTC datetime string from backend
 * @param format - dayjs format string
 * @returns formatted datetime string in Central timezone
 */
export const formatUTCToCentral = (utcDateTime: string | Date, format: string) => {
  return convertUTCToCentral(utcDateTime).format(format)
}

/**
 * Legacy function - now uses proper timezone conversion
 * @param utcDateTime - UTC datetime string from backend
 * @param format - dayjs format string
 * @returns formatted datetime string in Central timezone
 */
export const formatUTCToCDT = (utcDateTime: string | Date, format: string) => {
  return formatUTCToCentral(utcDateTime, format)
}

/**
 * Get current time in Central timezone (CDT/CST)
 * @returns dayjs object in Central timezone
 */
export const getCurrentCentralTime = () => {
  return dayjs().tz("America/Chicago")
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getCurrentCentralTime instead
 */
export const getCurrentCDTTime = () => {
  return getCurrentCentralTime()
}

export const convertLocalToUTC = (localDateTime: string | Date) => {
  return dayjs(localDateTime).utc().format()
}
