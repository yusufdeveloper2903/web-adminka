import React, { useRef, useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"

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
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true
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
          <ShadcnTable>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="flex w-full">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="flex items-center p-4" style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          </ShadcnTable>
        </div>

        <div ref={tableContainerRef} className="flex-1 overflow-auto">
          <ShadcnTable>
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
