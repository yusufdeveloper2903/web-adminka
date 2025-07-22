// Trip creation types based on backend DTOs

import type { HereAutosuggestResult } from "./here-maps"

export enum LoadStatus {
  EMPTY = "EMPTY",
  LOADED = "LOADED"
}

export enum StopType {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
  TRAILER = "TRAILER",
  SHOP = "SHOP"
}

export interface TripStopCreateDto {
  postCode: string
  address: string
  distance: number
  totalDistance: number
  durationMs: number
  loadStatus: LoadStatus
  orderIndex: number
  latitude: number
  longitude: number
  stopType: StopType
}

export interface TripCreateDto {
  truckId: number
  dispatcherId: number
  loadNumber: string
  startDateTime: string // Format: "2025-07-18 08:00:00"
  endDateTime: string // Format: "2025-07-18 18:00:00"
  startOdometer: number
  endOdometer: number
  tripStops: TripStopCreateDto[]
}

// Form state types
export interface NewStopFormData {
  city: string
  stopType: StopType
  loadStatus: LoadStatus
  selectedLocation?: HereAutosuggestResult
}

export interface TripFormData {
  truckId: string
  dispatcherId: string
  loadNumber: string
  startDateTime: string
  endDateTime: string
  startOdometer: string
  endOdometer: string
  stops: TripStopCreateDto[]
}
