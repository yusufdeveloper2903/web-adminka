import { type SortingState } from "@tanstack/react-table"
import { type Trip } from "../hooks/useTripsColumns"

const allTrips: Trip[] = Array.from({ length: 1000 }).map((_, i) => ({
  id: `#${i + 1}`,
  truck: `Volvo FH ${500 + (i % 10)}`,
  trailer: "Krone Cool Liner",
  driver: `Driver ${String.fromCharCode(65 + (i % 26))}`, // A, B, C...
  status: i % 3 === 0 ? "Delivered" : i % 3 === 1 ? "In Transit" : "Pending",
  origin: "Tashkent, Uzbekistan",
  destination: "Almaty, Kazakhstan"
}))

// Ma'lumotlarni sortirovka qilish uchun yordamchi funksiya
function sortData(data: Trip[], sorting: SortingState) {
  if (!sorting.length) {
    return data
  }

  const [sort] = sorting
  const { id, desc } = sort

  return [...data].sort((a, b) => {
    const valA = a[id as keyof Trip]
    const valB = b[id as keyof Trip]

    if (valA > valB) return desc ? -1 : 1
    if (valB > valA) return desc ? 1 : -1
    return 0
  })
}

export const fetchTrips = async ({ pageParam = 0, sorting = [] }: { pageParam?: number; sorting?: SortingState }) => {
  const fetchSize = 50
  const start = pageParam * fetchSize

  const sortedData = sortData(allTrips, sorting)
  const data = sortedData.slice(start, start + fetchSize)

  // API javobini imitatsiya qilish
  await new Promise((r) => setTimeout(r, 500))

  return {
    data,
    meta: {
      totalRowCount: allTrips.length
    }
  }
}
