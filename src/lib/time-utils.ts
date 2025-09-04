import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { INPUT_DATETIME_LOCAL_FORMAT } from "@/constants/time-formats"

// Enable dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Convert UTC to Central Time (handles CDT/CST automatically)
const convertUTCToCentral = (utcDateTime: string | Date) => {
  try {
    return dayjs.utc(utcDateTime).tz("America/Chicago")
  } catch {
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
  // Interpret input as America/Chicago (CT) and convert to UTC
  // Handles strings without timezone like "YYYY-MM-DDTHH:mm"
  const ct =
    typeof centralDateTime === "string"
      ? dayjs.tz(centralDateTime, "America/Chicago")
      : dayjs(centralDateTime).tz("America/Chicago")
  return ct.utc().format()
}

// Convert UTC string to Central Time string (for form display)
export const utcToCentralString = (utcDateTime: string): string => {
  if (!utcDateTime) return ""
  return convertUTCToCentral(utcDateTime).format(INPUT_DATETIME_LOCAL_FORMAT)
}

// Convert Central Time string to UTC string (for backend submission)
export const centralStringToUTC = (centralDateTime: string): string => {
  if (!centralDateTime) return ""
  // Parse as CT then convert to UTC to avoid off-by-one date issues
  return dayjs.tz(centralDateTime, "America/Chicago").utc().format()
}
