import type { HereAutosuggestResult } from "./here-maps"
import type { IBaseFiltersRequest, IPaginatedResponse, IChangeStatusRequest, IChangeStatusResponse } from "./api"

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
export interface ITripsFiltersRequest extends IBaseFiltersRequest {
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
export type ITripsResponse = IPaginatedResponse<ITripResponse>

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
export type ILoadNumbersFiltersRequest = IBaseFiltersRequest

export interface ILoadNumberResponse {
  id: number
  loadNumber: string
  active: boolean
}

export type ILoadNumbersResponse = IPaginatedResponse<ILoadNumberResponse>

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
