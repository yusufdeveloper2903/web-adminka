// GET /api/v1/trucks filters
export interface ITrucksFiltersRequest {
  id?: number
  keyword?: string
  active?: boolean
  page?: number
  size?: number
  sortName?: string
  sortDir?: string
  driverId?: number
}

// Truck Response
export interface ITruckResponse {
  id: number
  active: boolean
  companyId: number
  companyName: string
  createdAt: string
  driverNames: string
  homeLatitude: number
  homeLocation: string
  homeLongitude: number
  licencePlate: string
  unitNumber: string
  samsaraVin: string
  updated: string
  vehicleId: string
  vinNumber: string
}

// Trucks List Response (paginated)
export interface ITrucksResponse {
  content: ITruckResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Create Truck Request (POST /api/v1/trucks)
export interface ICreateTruckRequest {
  vinNumber: string
  unitNumber: string
  samsaraVin: string
  homeLocation: string
  homeLatitude: number
  homeLongitude: number
  licencePlate: string
}

// Update Truck Request (PUT /api/v1/trucks/{id})
export interface IUpdateTruckRequest {
  vinNumber: string
  unitNumber: string
  samsaraVin: string
  homeLocation: string
  homeLatitude: number
  homeLongitude: number
  licencePlate: string
}

// Change Status Request (PATCH /api/v1/trucks/change-status/{id})
export interface IChangeTruckStatusRequest {
  id: number
  active: boolean
}

export interface IChangeTruckStatusResponse {
  id: number
  active: boolean
  message: string
}
