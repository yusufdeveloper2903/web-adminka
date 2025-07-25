import type { HereAutosuggestResult } from "./here-maps"
import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"
import type { IDispatcherResponse, ITruckResponse } from "."

// Enums
export enum LoadStatus {
  EMPTY = "EMPTY",
  LOADED = "LOADED"
}

export enum StopType {
  START = "START",
  PICKUP = "PICKUP",
  TRAILER = "TRAILER",
  SHOP = "SHOP",
  DELIVERY = "DELIVERY"
}

export enum TripStatus {
  UPCOMING = "UPCOMING",
  IN_TRANSIT = "IN TRANSIT",
  COMPLETED = "COMPLETED"
}

// Trip Stop DTOs
export interface ITripStopResponse {
  id?: number
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

// Trip API Request/Response interfaces with I prefix

// GET /trips filters
export interface ITripsFiltersRequest extends IBaseFiltersRequest {
  truckId?: number
  driverId?: number
  loadNumber?: string
  tripStatus?: string
}

// Trip List Item Response (for infinite query)
export interface ITripListResponse {
  id: number
  truckId: number
  unitNumber: string
  driverId: number
  driverName: string
  companyId: number
  companyName: string
  loadNumber: string
  dispatcherName: string
  miles: number
  totalEmpty: number
  pu: number
  trl: number
  totalMiles: number
  totalOdometers: number | null
  pickupLocation: string | null
  pickupLatitude: number | null
  pickupLongitude: number | null
  deliveryLocation: string | null
  deliveryLatitude: number | null
  deliveryLongitude: number | null
  tripStatus: string
  active: boolean
  created: string
  updated: string
}

// Trip Detail Response (for single trip by ID)
export interface ITripDetailResponse {
  id: number
  loadNumber: string
  tripStatus: string
  startDateTime: string
  endDateTime: string
  startOdometer: number | null
  endOdometer: number | null
  pickupLocation: string | null
  pickupLatitude: number | null
  pickupLongitude: number | null
  deliveryLocation: string | null
  deliveryLatitude: number | null
  deliveryLongitude: number | null
  active: boolean
  created: string
  updated: string
  mileStats: {
    id: number
    miles: number
    totalEmpty: number
    pu: number
    trl: number
    totalMiles: number
    totalOdometers: number | null
    created: string
    updated: string
  }
  truck: ITruckResponse
  dispatcher: IDispatcherResponse
  driver: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    active: boolean
    truckId: number
    created: string
    updated: string
  }
  tripStops: ITripStopResponse[]
  driverIds: string[]
}

// Trips List Response (paginated)
export type ITripsResponse = IPaginatedResponse<ITripListResponse>

// Base Trip Data (common fields for create/update)
export interface ITripData {
  truckId: number
  dispatcherId: number
  loadNumber: string
  startDateTime: string
  endDateTime: string
  startOdometer: number
  endOdometer: number
  tripStatus: TripStatus
  tripStops: ITripStopResponse[]
}

// Create Trip Request (POST /trips)
export type ICreateTripRequest = ITripData

// Update Trip Request (PUT /trips/{id})
export type IUpdateTripRequest = ITripData

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
