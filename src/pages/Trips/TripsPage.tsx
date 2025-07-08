import { useState, useEffect, useMemo, useRef } from "react"
import { useHeaderStore } from "@/store/header-store"
import useTripsColumns from "./hooks/useTripsColumns"
import { DataTable } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, RefreshCw, Loader2 } from "lucide-react"
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import { fetchTrips } from "./api"
import { useReactTable, getCoreRowModel, getSortedRowModel, type SortingState } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

const TripsPage = () => {
  // Header state
  const setHeaderElements = useHeaderStore((state) => state.setHeaderElements)
  // const [searchTerm, setSearchTerm] = useState("")

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useTripsColumns()

  // Data fetching
  const { data, fetchNextPage, isFetching, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["trips", sorting],
    queryFn: ({ pageParam }) => fetchTrips({ pageParam, sorting }),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => allPages.length,
    placeholderData: keepPreviousData
  })

  const flatData = useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data])
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0
  const totalFetched = flatData.length

  // Table instance
  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true
  })

  // Virtualization
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: totalFetched,
    estimateSize: () => 41, // row height
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5
  })

  // Infinite scroll moved to onScroll handler
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 400 && !isFetching && totalFetched < totalDBRowCount) {
      fetchNextPage()
    }
  }

  // Update header on state change
  useEffect(() => {
    setHeaderElements({
      title: "Trips",
      filters: (
        <>
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder={`Search in ${totalFetched} of ${totalDBRowCount} records...`}
              className="bg-background w-full rounded-lg pl-8"
              // Note: Searching on client side is disabled for infinite scroll
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            {isFetching && !isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </>
      ),
      actions: (
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Trip
        </Button>
      )
    })

    return () => {
      setHeaderElements({ title: "", filters: null, actions: null })
    }
  }, [setHeaderElements, isFetching, isLoading, refetch, totalFetched, totalDBRowCount])

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <DataTable
        table={table}
        virtualizer={rowVirtualizer}
        tableContainerRef={tableContainerRef}
        onScroll={handleScroll}
      />
      <div className="text-muted-foreground py-2 text-center text-sm">
        {isFetching ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading more...
          </span>
        ) : (
          <span>
            Fetched {totalFetched} of {totalDBRowCount} rows.
          </span>
        )}
      </div>
    </div>
  )
}

export default TripsPage
