// Date and time format constants for consistent usage across the application

// Display formats for UI components
export const UI_DATE_FORMAT = "MMMM D, YYYY" // January 15, 2025
export const UI_DATETIME_FORMAT = "MMMM D, YYYY [at] HH:mm" // January 15, 2025 at 14:30
export const UI_TIME_FORMAT = "HH:mm" // 14:30
export const TABLE_UI_FORMAT = "DD.MM.YYYY HH:mm" // 01.15.2025 14:30

// Input formats for form fields
export const INPUT_DATETIME_LOCAL_FORMAT = "YYYY-MM-DDTHH:mm" // 2025-01-15T14:30
export const INPUT_DATE_FORMAT = "YYYY-MM-DD" // 2025-01-15
export const INPUT_TIME_FORMAT = "HH:mm" // 14:30

// Backend API formats
export const API_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss" // 2025-01-15 14:30:00
export const API_DATE_FORMAT = "YYYY-MM-DD" // 2025-01-15
export const BACKEND_DATETIME_FORMAT = "MM/DD/YYYY HH:mm:ss" // 01/15/2025 14:30:00

// Common display formats
export const DISPLAY_DATE_SHORT = "MMM D, YYYY" // Jan 15, 2025
export const DISPLAY_DATE_LONG = "dddd, MMMM D, YYYY" // Monday, January 15, 2025
export const DISPLAY_TIME_12H = "h:mm A" // 2:30 PM
export const DISPLAY_TIME_24H = "HH:mm" // 14:30
export const DISPLAY_DATETIME_SHORT = "MMM D, YYYY HH:mm" // Jan 15, 2025 14:30

// ISO formats
export const ISO_DATE_FORMAT = "YYYY-MM-DD" // 2025-01-15
export const ISO_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ" // 2025-01-15T14:30:00.000Z

// File naming formats
export const FILE_DATE_FORMAT = "YYYY-MM-DD" // 2025-01-15
export const FILE_DATETIME_FORMAT = "YYYY-MM-DD_HH-mm-ss" // 2025-01-15_14-30-00

// Default time values
export const DEFAULT_START_TIME = "09:00"
export const DEFAULT_END_TIME = "17:00"
export const DEFAULT_WORK_HOURS = 8

// Date range limits
export const MIN_DATE = "1900-01-01"
export const MAX_DATE_FUTURE_YEARS = 10
