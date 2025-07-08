import React, { useRef, useState } from "react"
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
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  isFetching: boolean
  fetchNextPage: () => void
  totalDBRowCount: number
}

function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  fetchNextPage,
  totalDBRowCount
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: data,
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
    count: data.length,
    estimateSize: () => 41,
    getScrollElement: () => tableContainerRef.current,
    overscan: 5
  })

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 400 && !isFetching && data.length < totalDBRowCount) {
      fetchNextPage()
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()
  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualItems.length > 0 ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0) : 0

  return (
    <div className="flex h-full flex-col">
      {/* Table Container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-md border">
        {/* Sticky Header */}
        <div className="bg-card sticky top-0 z-10 w-full">
          <ShadcnTable>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="flex w-full">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="flex items-center" style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          </ShadcnTable>
        </div>

        {/* Scrollable Body */}
        <div ref={tableContainerRef} onScroll={handleScroll} className="flex-1 overflow-auto">
          <ShadcnTable>
            <TableBody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
                width: "100%"
              }}
            >
              {paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }} />}
              {virtualItems.map((virtualItem) => {
                const row = rows[virtualItem.index]
                return (
                  <TableRow
                    key={row.id}
                    data-index={virtualItem.index}
                    className="absolute flex w-full"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="flex items-center" style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
              {paddingBottom > 0 && <tr style={{ height: `${paddingBottom}px` }} />}
            </TableBody>
          </ShadcnTable>
        </div>
      </div>

      {/* Footer - Outside of scroll area */}
      <div className="text-muted-foreground shrink-0 py-2 text-center text-sm">
        {isFetching ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading more...
          </span>
        ) : (
          <span>
            Fetched {data.length} of {totalDBRowCount} rows.
          </span>
        )}
      </div>
    </div>
  )
}

export default DataTable
