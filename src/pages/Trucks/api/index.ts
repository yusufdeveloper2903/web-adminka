import { type SortingState } from "@tanstack/react-table"
import { type Trucks } from "../hooks/useTrucksColumns"

export type TripAPIResponse = {
  data: Trucks[]
  meta: {
    totalRowCount: number
    nextOffset: number | undefined
  }
}

const allTrips: Trucks[] = Array.from({ length: 1000 }).map((_, i) => ({
  id: `${i + 1}`,
  unit: "450",
  driver: `Driver ${String.fromCharCode(65 + (i % 26))}`, // A, B, C...
  company: "Fatboy",
  dispatcher: "Bob Hamilton",
  license_plate: "P1224736",
  samsara_vin: "3AKJHHF",
  gle_vin: "3AKJHHF",
  home_location: "603 Hill",
  current_location: "Huntley, IL 60142",
  updated: "10.22.2024 13:18"
}))

// Ma'lumotlarni sortirovka qilish uchun yordamchi funksiya
function sortData(data: Trucks[], sorting: SortingState) {
  if (!sorting.length) {
    return data
  }

  const [sort] = sorting
  const { id, desc } = sort

  return [...data].sort((a, b) => {
    const valA = a[id as keyof Trucks]
    const valB = b[id as keyof Trucks]

    if (valA > valB) return desc ? -1 : 1
    if (valB > valA) return desc ? 1 : -1
    return 0
  })
}

export const fetchTrucks = async ({ pageParam = 0, sorting = [] }: { pageParam?: number; sorting?: SortingState }) => {
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
