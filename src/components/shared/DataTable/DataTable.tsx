import { useRef, type ReactNode, useCallback, useMemo, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  flexRender,
  type RowData,
  type Table as TanStackTable,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

interface TableVirtualizedProps<TData> {
  table: TanStackTable<TData>
  data?: {
    pages: Array<{
      content: TData[]
      totalElements: number
    }>
  }
  isLoading?: boolean
  isLoadingMore?: boolean
  fetchNextPage?: () => void
  estimateSize?: number
  overscan?: number
  className?: string
  loadingRowCount?: number
  enableInfiniteScroll?: boolean
  scrollThreshold?: number
  footerContent?: ReactNode
  showFooter?: boolean
  skeletonHeight?: number
  rowClassName?: string | ((row: TData, index: number) => string)
}

// Legacy interface for backward compatibility
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  isFetching: boolean
  fetchNextPage: () => void
  totalDBRowCount: number
  hasNextPage: boolean
}

export const TableVirtualized = <TData,>({
  table,
  data,
  isLoading = false,
  isLoadingMore = false,
  fetchNextPage,
  estimateSize = 48,
  overscan = 15,
  className,
  loadingRowCount = 20,
  enableInfiniteScroll = false,
  scrollThreshold = 1000,
  footerContent,
  showFooter = true,
  skeletonHeight = 36,
  rowClassName
}: TableVirtualizedProps<TData>): ReactNode => {
  const { rows } = table.getRowModel()
  const tableRef = useRef<HTMLDivElement>(null)

  const totalFetched = useMemo(() => {
    return (data?.pages.flatMap((page) => page.content) || []).length
  }, [data?.pages])

  const totalDBRowCount = useMemo(() => {
    return data?.pages?.[0]?.totalElements ?? 0
  }, [data?.pages])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => estimateSize,
    getScrollElement: () => tableRef.current,
    overscan
  })

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (!containerRefElement || !enableInfiniteScroll || isLoadingMore) return

      const { scrollHeight, scrollTop, clientHeight } = containerRefElement

      if (
        scrollHeight - scrollTop - clientHeight < scrollThreshold &&
        !isLoadingMore &&
        totalFetched < totalDBRowCount
      ) {
        fetchNextPage?.()
      }
    },
    [fetchNextPage, isLoadingMore, enableInfiniteScroll, scrollThreshold, totalFetched, totalDBRowCount]
  )

  const renderTableHeader = useCallback(() => {
    return (
      <TableHeader className="sticky top-[0] z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="flex w-full">
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn("flex items-center px-4 py-1.5 font-medium", header.column.columnDef.meta?.className)}
              >
                {!header.isPlaceholder && (
                  <div className="w-full p-1">{flexRender(header.column.columnDef.header, header.getContext())}</div>
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
    )
  }, [table])

  const renderFooterContent = () => {
    if (footerContent) {
      return footerContent
    }

    if (enableInfiniteScroll && fetchNextPage) {
      return isLoadingMore ? "Loading..." : `Showing ${totalFetched} of ${totalDBRowCount} rows`
    }

    return `${rows.length} rows`
  }

  if (isLoading) {
    return (
      <div className={cn("max-h-[calc(100vh-6rem)] overflow-auto rounded-lg border", className)}>
        <Table className="grid w-full">
          {renderTableHeader()}
          <TableBody>
            {Array.from({ length: loadingRowCount }).map((_, index) => (
              <TableRow key={index} className="flex w-full">
                {table.getAllColumns().map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn("flex items-center px-1 py-1.5", column.columnDef.meta?.className)}
                  >
                    <Skeleton className="w-full" style={{ height: `${skeletonHeight}px` }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {showFooter && (
            <TableFooter className={"sticky bottom-0"}>
              <TableRow className="flex w-full">
                <TableCell colSpan={table.getAllColumns().length}>Loading...</TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    )
  }

  return (
    <div
      ref={tableRef}
      onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
      className={cn("max-h-[calc(100vh-6rem)] overflow-auto rounded-lg border", className)}
    >
      <Table className="grid w-full">
        {renderTableHeader()}
        <TableBody className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <TableRow
              key={rows[virtualRow.index].id}
              data-index={virtualRow.index}
              className={cn(
                "hover:bg-muted/50 absolute top-0 left-0 flex w-full px-4",
                typeof rowClassName === "function"
                  ? rowClassName(rows[virtualRow.index].original, virtualRow.index)
                  : rowClassName
              )}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`
              }}
            >
              {rows[virtualRow.index].getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  title={cell.getValue() != null ? String(cell.getValue()) : undefined}
                  className={cn("flex items-center px-1 py-1.5", cell.column.columnDef.meta?.className)}
                >
                  <div className="w-full truncate p-1">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {showFooter && (
          <TableFooter className={"sticky bottom-0"}>
            <TableRow className="flex w-full">
              <TableCell colSpan={table.getAllColumns().length}>{renderFooterContent()}</TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}

// Legacy DataTable component for backward compatibility
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
    enableSorting: false
  })

  return (
    <TableVirtualized
      table={table}
      data={{
        pages: [
          {
            content: data,
            totalElements: totalDBRowCount
          }
        ]
      }}
      isLoading={isLoading}
      isLoadingMore={isFetching}
      fetchNextPage={fetchNextPage}
      enableInfiniteScroll={hasNextPage}
      footerContent={`Fetched ${data.length} of ${totalDBRowCount} rows.${isFetching && !isLoading ? " (Background updating...)" : ""}`}
    />
  )
}

export default DataTable
