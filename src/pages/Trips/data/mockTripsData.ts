import type { Trip } from "../hooks/useTripsColumns"
import { Gle_polyline } from "../api/polyline"

// Mock trip data based on backend response format
export const mockTripsData: Trip[] = [
  {
    id: 1,
    unitNumber: "626",
    driverName: "John Smith",
    company: "FATBOY",
    loadNumber: "LOAD123456",
    dispatcher: "Mike Johnson",
    miles: 1492,
    totalEmpty: 1678,
    pu: 746,
    trl: 932,
    totalMiles: 3170,
    pickupLocation: "New York, NY",
    deliveryLocation: "Dallas, TX",
    updated: "2025-01-21T10:30:00Z",
    status: "IN_TRANSIT",
    gleLocation: {
      polyline: Gle_polyline // Use the actual polyline data
    },
    samsaraLocation: {
      polyline: Gle_polyline // Same polyline for demo
    },
    tripStops: [
      {
        id: 1,
        address: "1600 Pennsylvania Avenue NW, Washington, DC",
        latitude: 38.8977,
        longitude: -77.0365,
        stopType: "PICKUP",
        loadStatus: "LOADED"
      },
      {
        id: 2,
        address: "1701 Bryant Street, Denver, CO",
        latitude: 39.7392,
        longitude: -104.9903,
        stopType: "TRAILER",
        loadStatus: "EMPTY"
      },
      {
        id: 3,
        address: "3799 S Las Vegas Blvd, Las Vegas, NV",
        latitude: 36.1699,
        longitude: -115.1398,
        stopType: "DELIVERY",
        loadStatus: "LOADED"
      }
    ]
  },
  {
    id: 2,
    unitNumber: "627",
    driverName: "Jane Doe",
    company: "FATBOY",
    loadNumber: "LOAD789012",
    dispatcher: "Sarah Wilson",
    miles: 2150,
    totalEmpty: 890,
    pu: 1200,
    trl: 1450,
    totalMiles: 4540,
    pickupLocation: "New York, NY",
    deliveryLocation: "Los Angeles, CA",
    updated: "2025-01-21T14:15:00Z",
    status: "COMPLETED",
    gleLocation: {
      polyline: [Gle_polyline.substring(0, 1000), Gle_polyline.substring(1000, 2000)] // Split into array for testing
    },
    samsaraLocation: {
      polyline: Gle_polyline
    },
    tripStops: [
      {
        id: 4,
        address: "Times Square, New York, NY",
        latitude: 40.758,
        longitude: -73.9855,
        stopType: "PICKUP",
        loadStatus: "LOADED"
      },
      {
        id: 5,
        address: "Hollywood Blvd, Los Angeles, CA",
        latitude: 34.0522,
        longitude: -118.2437,
        stopType: "DELIVERY",
        loadStatus: "EMPTY"
      }
    ]
  },
  {
    id: 3,
    unitNumber: "628",
    driverName: "Bob Johnson",
    company: "FATBOY",
    loadNumber: "LOAD345678",
    dispatcher: "Tom Brown",
    miles: 850,
    totalEmpty: 420,
    pu: 300,
    trl: 680,
    totalMiles: 1750,
    pickupLocation: "Chicago, IL",
    deliveryLocation: "Detroit, MI",
    updated: "2025-01-21T09:45:00Z",
    status: "PENDING",
    gleLocation: {
      polyline: [Gle_polyline.substring(0, 800), Gle_polyline.substring(800, 1600), Gle_polyline.substring(1600, 2400)] // Split into 3 parts for testing multiple polylines
    },
    samsaraLocation: {
      polyline: Gle_polyline
    },
    tripStops: [
      {
        id: 6,
        address: "Chicago Loop, Chicago, IL",
        latitude: 41.8781,
        longitude: -87.6298,
        stopType: "PICKUP",
        loadStatus: "LOADED"
      },
      {
        id: 7,
        address: "Downtown Detroit, MI",
        latitude: 42.3314,
        longitude: -83.0458,
        stopType: "DELIVERY",
        loadStatus: "EMPTY"
      }
    ]
  }
]
