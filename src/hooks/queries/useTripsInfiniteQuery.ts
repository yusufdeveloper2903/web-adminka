import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchTrips, type TripAPIResponse } from "@/pages/Trips/api"
import type { SortingState } from "@tanstack/react-table"

const useTripsInfiniteQuery = (sorting: SortingState) => {
  return useInfiniteQuery<TripAPIResponse>({
    queryKey: ["trips", sorting],
    queryFn: (context) => fetchTrips({ pageParam: context.pageParam as number, sorting }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.meta.nextOffset
  })
}

export default useTripsInfiniteQuery
