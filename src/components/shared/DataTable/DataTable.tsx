import React from "react"
import { flexRender, type Table } from "@tanstack/react-table"
import { type Virtualizer } from "@tanstack/react-virtual"
import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps<TData> {
  table: Table<TData>
  virtualizer: Virtualizer<HTMLDivElement, Element>
  tableContainerRef: React.RefObject<HTMLDivElement | null>
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void
}

function DataTable<TData>({ table, virtualizer, tableContainerRef, onScroll }: DataTableProps<TData>) {
  const { rows } = table.getRowModel()
  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0
  const paddingBottom = virtualItems.length > 0 ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0) : 0

  return (
    <div
      ref={tableContainerRef}
      onScroll={onScroll}
      className="h-[calc(100vh-220px)] w-full overflow-auto rounded-md border" // Adjusted height for better layout
    >
      <ShadcnTable style={{ display: "grid" }}>
        <TableHeader className="bg-card sticky top-0 z-10 grid shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="flex w-full">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    flex: `0 0 ${header.getSize()}px`
                  }}
                  className="flex items-center"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          style={{
            height: `${totalSize}px`,
            position: "relative",
            width: "100%",
            display: "grid"
          }}
        >
          {paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }} />}
          {virtualItems.map((virtualItem) => {
            const row = rows[virtualItem.index]
            return (
              <TableRow
                key={row.id}
                data-index={virtualItem.index}
                ref={(node) => virtualizer.measureElement(node)}
                className="absolute flex w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      flex: `0 0 ${cell.column.getSize()}px`
                    }}
                    className="flex items-center"
                  >
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
  )
}

export default DataTable
