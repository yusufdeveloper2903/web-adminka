import type { HereAutosuggestResult } from "./here-maps"

// Enums
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

// Trip Stop DTOs
export interface ITripStopResponse {
  address: string
  distance: number
  totalDistance: number
  duration: number
  loadStatus: LoadStatus
  orderIndex: number
  latitude: number
  longitude: number
  stopType: StopType
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
  stops: ITripStopResponse[]
}

// Trip API Request/Response interfaces with I prefix

// GET /trips filters
export interface ITripsFiltersRequest {
  id?: number
  keyword?: string
  active?: boolean
  page?: number
  size?: number
  sortName?: string
  sortDir?: string
  truckId?: number
  driverId?: number
  loadNumber?: string
  tripStatus?: string
}

// Trip Response
export interface ITripResponse {
  id: number
  truckId: number
  dispatcherId: number
  loadNumber: string
  startDateTime: string
  endDateTime: string
  startOdometer: number
  endOdometer: number
  tripStops: ITripStopResponse[]
}

// Trips List Response (paginated)
export interface ITripsResponse {
  content: ITripResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Create Trip Request (POST /trips)
export interface ICreateTripRequest {
  truckId: number
  dispatcherId: number
  loadNumber: string
  startDateTime: string
  endDateTime: string
  startOdometer: number
  endOdometer: number
  tripStops: ITripStopResponse[]
}

// Update Trip Request (PUT /trips/{id})
export interface IUpdateTripRequest {
  truckId: number
  dispatcherId: number
  loadNumber: string
  startDateTime: string
  endDateTime: string
  startOdometer: number
  endOdometer: number
  tripStops: ITripStopResponse[]
}

// Change Status Request (PATCH /trips/change-status/{id})
export interface IChangeStatusRequest {
  id: number
  active: boolean
}

export interface IChangeStatusResponse {
  id: number
  active: boolean
  message: string
}

// Trip Summary Request (GET /trips/summary)
export interface ITripSummaryRequest {
  truckId: number
  driverId?: number
  loadNumber: string
}

export interface ITripSummaryResponse {
  totalTrips: number
  completedTrips: number
  activeTrips: number
  totalDistance: number
  totalDuration: number
}

// Load Numbers Request (GET /trips/load-numbers)
export interface ILoadNumbersFiltersRequest {
  id?: number
  keyword?: string
  active?: boolean
  page?: number
  size?: number
  sortName?: string
  sortDir?: string
}

export interface ILoadNumberResponse {
  id: number
  loadNumber: string
  active: boolean
}

export interface ILoadNumbersResponse {
  content: ILoadNumberResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Trip Info Response (GET /trips/info/{id})
export interface ITripInfoResponse {
  id: number
  loadNumber: string
  truckNumber: string
  driverName: string
  dispatcherName: string
  status: string
  startDateTime: string
  endDateTime: string
  totalDistance: number
  totalDuration: number
  stopsCount: number
}
