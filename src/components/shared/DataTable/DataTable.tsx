import { useRef, useState, useEffect } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  isFetching: boolean
  fetchNextPage: () => void
  totalDBRowCount: number
  hasNextPage: boolean
}

function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  fetchNextPage,
  totalDBRowCount,
  hasNextPage
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 41,
    overscan: 5
  })

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems()
    const [lastItem] = [...virtualItems].reverse()

    if (!lastItem) {
      return
    }

    if (lastItem.index >= rows.length - 1 && hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage, rows.length, isFetching, rowVirtualizer.getVirtualItems()])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-md border">
        <div className="bg-card sticky top-0 z-10 w-full">
          <ShadcnTable className="w-full table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={header.column.getCanSort() ? "flex cursor-pointer items-center select-none" : ""}
                            onClick={header.column.getToggleSortingHandler()}
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
                                <ArrowUpIcon className="animate-in fade-in ml-2 h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="animate-in fade-in ml-2 h-4 w-4" />
                              ) : (
                                <ChevronsUpDownIcon className="animate-in fade-in ml-2 h-4 w-4 opacity-50" />
                              )
                            ) : null}
                          </div>
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
          </ShadcnTable>
        </div>

        <div ref={tableContainerRef} className="flex-1 overflow-auto">
          <ShadcnTable className="w-full table-fixed">
            <TableBody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
                width: "100%"
              }}
            >
              {virtualItems.map((virtualItem) => {
                const isLoaderRow = virtualItem.index > rows.length - 1
                const row = rows[virtualItem.index]

                if (isLoaderRow) {
                  return (
                    <TableRow
                      key="loader"
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                        position: "absolute",
                        width: "100%"
                      }}
                    >
                      <TableCell colSpan={columns.length} className="flex items-center justify-center">
                        {hasNextPage ? "Loading more..." : "Nothing more to load"}
                      </TableCell>
                    </TableRow>
                  )
                }

                return (
                  <TableRow
                    key={row.id}
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      position: "absolute",
                      display: "flex",
                      width: "100%"
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="flex items-center p-4"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </ShadcnTable>
        </div>
      </div>

      <div className="text-muted-foreground shrink-0 py-2 text-center text-sm">
        Fetched {data.length} of {totalDBRowCount} rows.
        {isFetching && !isLoading ? " (Background updating...)" : ""}
      </div>
    </div>
  )
}

export default DataTable
