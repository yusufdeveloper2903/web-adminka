import type { HereAutosuggestResult } from "./here-maps"
import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"
import type { IDriverResponse, ITruckResponse } from "."

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
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
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
  active?: boolean
  truckId?: string
  driverId?: string
  loadNumber?: string
  trailerNumber?: string
  fromDate?: string // MM/DD/YYYY format
  toDate?: string // MM/DD/YYYY format
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
  trailerNumber: string | null
  dispatcherName: string
  miles: number
  totalEmpty: number
  pu: number
  identifierType: IdentifierType
  trl: number
  totalMiles: number
  totalOdometers: number | null
  payableMileage?: number | null
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
  trailerNumber: string
  tripStatus: string
  identifierType: IdentifierType
  identifierValue: string
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
  mileStats: ITripSummary & {
    id: number
    created: string
    updated: string
  }
  truck: ITruckResponse
  dispatcher: IDriverResponse
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

export interface ITripReportSummaryResponse {
  hereStats?: ITripSummary
  gleStats?: ITripSummary
  samsaraStats?: ITripSummary
}

// Trips List Response (paginated)
export type ITripsResponse = IPaginatedResponse<ITripListResponse>

// Base Trip Data (common fields for create/update)
export interface ITripData {
  truckId: number
  driverId?: number
  dispatcherId: number
  identifierType: IdentifierType
  identifierValue: string
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
  number: string
  identifierType?: IdentifierType
}

export interface ITripSummaryResponse {
  id: number
  truckId: number
  unitNumber: string
  driverId: number
  driverName: string
  loadNumber: string
  trailerNumber: string
  identifierType: IdentifierType
  mileStats: {
    id: number
    miles: number
    totalEmpty: number
    pu: number
    trl: number
    totalMiles: number
    totalDuration: number
    totalOdometers: number | null
    created: string
    updated: string
  }
  gleLocation: {
    polyline: string
    distance: number
    duration: number
    nearbyPoints: Array<{
      lat: number
      lng: number
      type: "START" | "PICKUP" | "HOME" | "SHOP" | "DELIVERY"
    }>
  }
  samsaraLocation: {
    polyline: string
    distance: number
    duration: number
    nearbyPoints: Array<{
      lat: number
      lng: number
      type: "START" | "PICKUP" | "HOME" | "SHOP" | "DELIVERY"
    }>
  }
  tripStops: Array<{
    id: number
    address: string
    distance: number
    totalDistance: number
    duration: number
    loadStatus: "EMPTY" | "LOADED"
    orderIndex: number
    latitude: number
    longitude: number
    stopType: "START" | "PICKUP" | "TRAILER" | "SHOP" | "DELIVERY"
    active: boolean
    created: string
    updated: string
  }>
}

interface ITripSummary {
  miles: number
  totalEmpty: number
  pu: number
  trl: number
  totalMiles: number
  totalOdometers: number | null
  payableMileage: number | null
}

export interface ILoadNumberResponse {
  id: number
  loadNumber: string
  active: boolean
}

export type ILoadNumbersResponse = IPaginatedResponse<ILoadNumberResponse>

// Identifier numbers (Load/Trailer) unified API
export type IdentifierType = "LOAD_NUMBER" | "TRAILER_NUMBER"

export interface IIdentifierNumbersRequest extends IBaseFiltersRequest {
  type: IdentifierType
}

export interface IIdentifierNumberItem {
  tripId: number
  identifierValue: string
  identifierType: IdentifierType
}

export type IIdentifierNumbersResponse = IPaginatedResponse<IIdentifierNumberItem>

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

export interface ITripVehicleByLoadNumberResponse {
  trucks: {
    id: number
    unitNumber: string
  }[]
  drivers: {
    id: number
    firstName: string
    lastName: string
  }[]
}

// Change Trip Status DTOs
export interface IChangeTripStatusRequest {
  id: number
  tripStatus: TripStatus | string
}

export interface IChangeTripStatusResponse {
  id: number
  tripStatus: string
  message: string
}
