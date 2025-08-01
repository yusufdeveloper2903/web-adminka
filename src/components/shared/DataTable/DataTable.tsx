import React, { useRef, useCallback, useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
  type RowData
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

// Interface for DataTable props
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  isFetching: boolean
  fetchNextPage: () => void
  totalDBRowCount: number
  hasNextPage: boolean
  onSortingChange?: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
  sorting?: { sortName?: string; sortDir?: string }
}

function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  fetchNextPage,
  totalDBRowCount,
  hasNextPage,
  onSortingChange,
  sorting: externalSorting
}: DataTableProps<TData, TValue>) {
  // Reference to scrolling element
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Convert external sorting to TanStack format
  const sorting: SortingState = useMemo(() => {
    if (externalSorting?.sortName && externalSorting?.sortDir) {
      return [
        {
          id: externalSorting.sortName,
          desc: externalSorting.sortDir === "desc"
        }
      ]
    }
    return []
  }, [externalSorting])

  // Flatten data like in TanStack example
  const flatData = useMemo(() => data ?? [], [data])
  const totalFetched = flatData.length

  // Fetch more data on scroll
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement
        // Fetch more data when within 500px of bottom
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount &&
          hasNextPage
        ) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount, hasNextPage]
  )

  // Check on mount if need to fetch more
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [fetchMoreOnBottomReached])

  // Create table instance
  const table = useReactTable({
    data: flatData,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, // Server-side sorting
    debugTable: true
  })

  const { rows } = table.getRowModel()

  // Create virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 36,
    getScrollElement: () => tableContainerRef.current,
    overscan: 5
  })

  // Handle sorting change
  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      if (typeof updater === "function") {
        const newSorting = updater(sorting)
        if (newSorting.length > 0) {
          const sort = newSorting[0]
          onSortingChange?.(sort.id, sort.desc ? "desc" : "asc")
        } else {
          onSortingChange?.(null, null)
        }
      }
    },
    [sorting, onSortingChange]
  )

  // Set table options
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange
  }))

  if (isLoading) {
    return (
      <div className="max-h-[calc(100vh-6rem)] overflow-auto rounded-lg border">
        <Table className="grid w-full">
          <TableHeader className="bg-background sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn("flex items-center font-medium", header.column.columnDef.meta?.className)}
                  >
                    {!header.isPlaceholder && (
                      <div className="w-full p-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: 20 }).map((_, index) => (
              <TableRow key={index} className="flex w-full">
                {table.getAllColumns().map((column) => (
                  <TableCell key={column.id} className={cn("flex items-center", column.columnDef.meta?.className)}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="sticky bottom-0">
            <TableRow className="flex w-full">
              <TableCell colSpan={table.getAllColumns().length}>Loading...</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    )
  }

  return (
    <div className="relative overflow-auto rounded-[8px] border bg-white">
      <div
        ref={tableContainerRef}
        onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
        className="h-full overflow-auto"
      >
        <Table className={cn("grid w-full", { "pointer-events-none": isFetching && !isLoading })}>
          <TableHeader className="bg-blue-primary sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-blue-primary dark:bg-back flex w-full text-xs">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn("flex items-center font-medium", header.column.columnDef.meta?.className)}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex w-full cursor-pointer items-center text-white select-none"
                            : "flex w-full text-white"
                        }
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === "asc"
                              ? "Sort ascending"
                              : header.column.getNextSortingOrder() === "desc"
                                ? "Sort descending"
                                : "Clear sort"
                            : undefined
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (
                          header.column.getIsSorted() === "asc" ? (
                            <ArrowUpIcon
                              className={cn(
                                "ml-1 h-4 w-4 flex-shrink-0",
                                header.column.columnDef.meta?.className?.includes("bg-gray")
                                  ? "text-gray-900 dark:text-gray-100"
                                  : "text-white"
                              )}
                            />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDownIcon
                              className={cn(
                                "ml-1 h-4 w-4 flex-shrink-0",
                                header.column.columnDef.meta?.className?.includes("bg-gray")
                                  ? "text-gray-900 dark:text-gray-100"
                                  : "text-white"
                              )}
                            />
                          ) : (
                            <ArrowUpDownIcon
                              className={cn(
                                "ml-1 h-4 w-4 flex-shrink-0 opacity-50",
                                header.column.columnDef.meta?.className?.includes("bg-gray")
                                  ? "text-gray-900 dark:text-gray-100"
                                  : "text-white"
                              )}
                            />
                          )
                        ) : null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <TableRow
                key={rows[virtualRow.index].id}
                data-index={virtualRow.index}
                className="hover:bg-muted/100 absolute top-0 left-0 flex !h-9 w-full text-xs"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                {rows[virtualRow.index].getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    title={cell.getValue() != null ? String(cell.getValue()) : undefined}
                    className={cn("flex items-center", cell.column.columnDef.meta?.className)}
                  >
                    <div className="w-full truncate">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Shimmer Wave Overlay for Sorting/Filtering */}
      {isFetching && !isLoading && (
        <div className="bg-background/20 pointer-events-none absolute inset-0 z-30 overflow-hidden backdrop-blur-[1px]">
          <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent dark:via-white/30" />
          <div className="bg-background/95 absolute top-4 right-4 flex items-center space-x-2 rounded-lg border px-3 py-1.5 shadow-lg">
            <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
            <span className="text-xs font-medium">Updating...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
