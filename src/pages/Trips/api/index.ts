import { type SortingState } from "@tanstack/react-table"
import { type Trip } from "../hooks/useTripsColumns"
import { mockTripsData } from "../data/mockTripsData"
import { Gle_polyline1 } from "./polyline1"
import { Gle_polyline2 } from "./polyline2"

export type TripAPIResponse = {
  data: Trip[]
  meta: {
    totalRowCount: number
    nextOffset: number | undefined
  }
}

// Use our new mock data format and expand it for pagination testing
const allTrips: Trip[] = [
  ...mockTripsData,
  // Add more variations for pagination testing (997 more to make 1000 total)
  ...Array.from({ length: 997 }).map((_, i) => ({
    id: i + 4,
    unitNumber: `${626 + (i % 10)}`,
    driverName: `Driver ${String.fromCharCode(65 + (i % 26))}`,
    company: i % 3 === 0 ? "FATBOY" : i % 3 === 1 ? "DISPATCH" : "LOGISTICS",
    loadNumber: `LOAD${(123456 + i).toString()}`,
    dispatcher: i % 4 === 0 ? "Mike Johnson" : i % 4 === 1 ? "Sarah Wilson" : i % 4 === 2 ? "Tom Brown" : "Lisa Davis",
    miles: Math.floor(Math.random() * 2000) + 500,
    totalEmpty: Math.floor(Math.random() * 1000) + 200,
    pu: Math.floor(Math.random() * 800) + 100,
    trl: Math.floor(Math.random() * 1200) + 300,
    totalMiles: Math.floor(Math.random() * 3000) + 1000,
    pickupLocation:
      i % 5 === 0
        ? "New York, NY"
        : i % 5 === 1
          ? "Los Angeles, CA"
          : i % 5 === 2
            ? "Chicago, IL"
            : i % 5 === 3
              ? "Houston, TX"
              : "Miami, FL",
    deliveryLocation:
      i % 5 === 0
        ? "Seattle, WA"
        : i % 5 === 1
          ? "Denver, CO"
          : i % 5 === 2
            ? "Atlanta, GA"
            : i % 5 === 3
              ? "Phoenix, AZ"
              : "Boston, MA",
    updated: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    status: (i % 3 === 0 ? "COMPLETED" : i % 3 === 1 ? "IN_TRANSIT" : "PENDING") as Trip["status"],
    gleLocation: { polyline: [Gle_polyline1, Gle_polyline2] },
    samsaraLocation: { polyline: [Gle_polyline1, Gle_polyline2] },
    tripStops: [
      {
        id: i * 2 + 1,
        address: `${i + 100} Main Street, City ${i}`,
        latitude: 40 + (Math.random() - 0.5) * 10,
        longitude: -100 + (Math.random() - 0.5) * 20,
        stopType: "PICKUP",
        loadStatus: "LOADED"
      },
      {
        id: i * 2 + 2,
        address: `${i + 200} Oak Avenue, City ${i + 1}`,
        latitude: 35 + (Math.random() - 0.5) * 10,
        longitude: -95 + (Math.random() - 0.5) * 20,
        stopType: "DELIVERY",
        loadStatus: "EMPTY"
      }
    ]
  }))
]

function sortData(data: Trip[], sorting: SortingState) {
  if (!sorting.length) {
    return data
  }

  const [sort] = sorting
  const { id, desc } = sort

  return [...data].sort((a, b) => {
    const valA = a[id as keyof Trip]
    const valB = b[id as keyof Trip]

    // Handle undefined values
    if (valA == null && valB == null) return 0
    if (valA == null) return desc ? 1 : -1
    if (valB == null) return desc ? -1 : 1

    // Handle different data types
    if (typeof valA === "string" && typeof valB === "string") {
      return desc ? valB.localeCompare(valA) : valA.localeCompare(valB)
    }

    if (typeof valA === "number" && typeof valB === "number") {
      return desc ? valB - valA : valA - valB
    }

    // Convert to string for comparison as fallback
    const strA = String(valA)
    const strB = String(valB)
    return desc ? strB.localeCompare(strA) : strA.localeCompare(strB)
  })
}

export const fetchTrips = async ({ pageParam = 0, sorting = [] }: { pageParam?: number; sorting?: SortingState }) => {
  const fetchSize = 50
  const start = pageParam * fetchSize

  const sortedData = sortData(allTrips, sorting)
  const data = sortedData.slice(start, start + fetchSize)

  // API javobini imitatsiya qilish
  await new Promise((r) => setTimeout(r, 500))

  const nextOffset = start + data.length < allTrips.length ? pageParam + 1 : undefined

  return {
    data,
    meta: {
      totalRowCount: allTrips.length,
      nextOffset
    }
  }
}
