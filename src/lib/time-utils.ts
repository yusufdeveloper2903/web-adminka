import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

// Enable dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Convert UTC to Central Time (handles CDT/CST automatically)
const convertUTCToCentral = (utcDateTime: string | Date) => {
  try {
    return dayjs.utc(utcDateTime).tz("America/Chicago")
  } catch (error) {
    // Fallback to manual offset calculation
    const utcDate = dayjs.utc(utcDateTime)
    const month = utcDate.month() + 1
    const isDST = month >= 3 && month <= 11
    const offset = isDST ? -5 : -6
    return utcDate.utcOffset(offset)
  }
}

// Format UTC datetime to Central Time with optional CT suffix
export const formatUTCToCentral = (utcDateTime: string | Date, format: string, showTimezone: boolean = false) => {
  const formatted = convertUTCToCentral(utcDateTime).format(format)
  return showTimezone ? `${formatted} CT` : formatted
}

// Convert UTC to Central Time Date object (for form inputs)
export const utcToCentralDate = (utcDateTime: string | Date): Date => {
  return convertUTCToCentral(utcDateTime).toDate()
}

// Convert Central Time to UTC string (for backend)
export const centralToUTC = (centralDateTime: Date | string): string => {
  return dayjs(centralDateTime).utc().format()
}

// Convert UTC string to Central Time string (for form display)
export const utcToCentralString = (utcDateTime: string): string => {
  if (!utcDateTime) return ""
  return convertUTCToCentral(utcDateTime).format("YYYY-MM-DDTHH:mm")
}

// Convert Central Time string to UTC string (for backend submission)
export const centralStringToUTC = (centralDateTime: string): string => {
  if (!centralDateTime) return ""
  return dayjs(centralDateTime).utc().format()
}
