import type { LoadStatus, StopType, TripStatus } from "@/types"

// Stop Types with labels and styling
export const STOP_TYPE_OPTIONS: { label: string; value: StopType; className: string }[] = [
  {
    value: "START" as StopType,
    label: "START",
    className: "text-blue-600"
  },
  {
    value: "PICKUP" as StopType,
    label: "PICKUP",
    className: ""
  },
  {
    value: "TRAILER" as StopType,
    label: "TRAILER",
    className: ""
  },
  {
    value: "SHOP" as StopType,
    label: "SHOP",
    className: ""
  },
  {
    value: "DELIVERY" as StopType,
    label: "DELIVERY",
    className: "text-blue-600"
  }
]

// Load Status options with styling
export const LOAD_STATUS_OPTIONS: {
  label: string
  value: LoadStatus
  className: string
}[] = [
  {
    value: "EMPTY" as LoadStatus,
    label: "EMPTY",
    className: "text-red-600"
  },
  {
    value: "LOADED" as LoadStatus,
    label: "LOADED",
    className: "text-blue-600"
  }
]

// Trip Status options
export const TRIP_STATUS_OPTIONS: {
  label: string
  value: keyof typeof TripStatus
  className: string
}[] = [
  {
    value: "UPCOMING",
    label: "Upcoming",
    className: "text-blue-600"
  },
  {
    value: "IN_TRANSIT",
    label: "In Transit",
    className: "text-yellow-600"
  },
  {
    value: "COMPLETED",
    label: "Completed",
    className: "text-green-600"
  }
]
