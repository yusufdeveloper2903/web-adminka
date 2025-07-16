import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchTrucks, type TripAPIResponse } from "@/pages/Trucks/api"
import type { SortingState } from "@tanstack/react-table"

const useTrucksInfiniteQuery = (sorting: SortingState) => {
  return useInfiniteQuery<TripAPIResponse>({
    queryKey: ["trucks", sorting],
    queryFn: (context) => fetchTrucks({ pageParam: context.pageParam as number, sorting }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.meta.nextOffset
  })
}

export default useTrucksInfiniteQuery
