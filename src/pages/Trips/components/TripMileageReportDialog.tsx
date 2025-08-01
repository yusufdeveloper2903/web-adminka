import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared"
import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { metersToMiles } from "@/lib/distance-utils"
import type { ITripSummaryResponse } from "@/types"

interface TripMileageReportDialogProps {
  isOpen: boolean
  onClose: () => void
  tripData?: ITripSummaryResponse
}

interface MileageReportRow {
  no: number
  system: string
  miles: number
  totalEmpty: number
  pu: number
  trl: number
  totalMiles: number
  differences: number
}

const TripMileageReportDialog = ({ isOpen, onClose, tripData }: TripMileageReportDialogProps) => {
  // Generate report data
  const reportData: MileageReportRow[] = useMemo(() => {
    if (!tripData) return []

    const hereData = {
      no: 1,
      system: "HERE",
      miles: tripData.mileStats.miles,
      totalEmpty: tripData.mileStats.totalEmpty,
      pu: tripData.mileStats.pu,
      trl: tripData.mileStats.trl,
      totalMiles: tripData.mileStats.totalMiles,
      differences: 0 // HERE is baseline
    }

    const samsaraData = {
      no: 2,
      system: "SAMSARA",
      miles: tripData.samsaraLocation ? Math.round(metersToMiles(tripData.samsaraLocation.distance)) : 0,
      totalEmpty: tripData.mileStats.totalEmpty, // Same as HERE
      pu: tripData.mileStats.pu, // Same as HERE
      trl: tripData.mileStats.trl, // Same as HERE
      totalMiles: tripData.samsaraLocation ? Math.round(metersToMiles(tripData.samsaraLocation.distance)) : 0,
      differences: tripData.samsaraLocation
        ? Math.round(metersToMiles(tripData.samsaraLocation.distance)) - tripData.mileStats.totalMiles
        : 0
    }

    const gleData = {
      no: 3,
      system: "GLE",
      miles: tripData.gleLocation ? Math.round(metersToMiles(tripData.gleLocation.distance)) : 0,
      totalEmpty: tripData.mileStats.totalEmpty, // Same as HERE
      pu: tripData.mileStats.pu, // Same as HERE
      trl: tripData.mileStats.trl, // Same as HERE
      totalMiles: tripData.gleLocation ? Math.round(metersToMiles(tripData.gleLocation.distance)) : 0,
      differences: tripData.gleLocation
        ? Math.round(metersToMiles(tripData.gleLocation.distance)) - tripData.mileStats.totalMiles
        : 0
    }

    return [hereData, samsaraData, gleData]
  }, [tripData])

  // Define columns
  const columns: ColumnDef<MileageReportRow>[] = useMemo(
    () => [
      {
        accessorKey: "no",
        header: "No",
        meta: {
          className: "min-w-[60px] w-[8%] text-center"
        },
        cell: ({ row }) => <span className="font-medium">{row.original.no}</span>,
        enableSorting: false
      },
      {
        accessorKey: "system",
        header: "System",
        meta: {
          className: "min-w-[100px] w-[15%] text-left"
        },
        cell: ({ row }) => <span className="font-bold">{row.original.system}</span>,
        enableSorting: false
      },
      {
        accessorKey: "miles",
        header: "Miles",
        meta: {
          className: "min-w-[80px] w-[12%] text-left"
        },
        cell: ({ row }) => <span className="font-medium">{row.original.miles.toLocaleString()}</span>
      },
      {
        accessorKey: "totalEmpty",
        header: "Total Empty",
        meta: {
          className: "min-w-[100px] w-[15%] text-left"
        },
        cell: ({ row }) => <span className="font-medium">{row.original.totalEmpty.toLocaleString()}</span>
      },
      {
        accessorKey: "pu",
        header: "PU",
        meta: {
          className: "min-w-[80px] w-[12%] text-left"
        },
        cell: ({ row }) => <span className="font-medium">{row.original.pu.toLocaleString()}</span>
      },
      {
        accessorKey: "trl",
        header: "TRL",
        meta: {
          className: "min-w-[80px] w-[12%] text-left"
        },
        cell: ({ row }) => <span className="font-medium">{row.original.trl.toLocaleString()}</span>
      },
      {
        accessorKey: "totalMiles",
        header: "TOTAL MILES",
        meta: {
          className: "min-w-[120px] w-[15%] text-left"
        },
        cell: ({ row }) => <span className="font-bold text-blue-600">{row.original.totalMiles.toLocaleString()}</span>
      },
      {
        accessorKey: "differences",
        header: "DIFFERENCES",
        meta: {
          className: "min-w-[120px] w-[15%] text-left"
        },
        cell: ({ row }) => {
          const diff = row.original.differences
          return (
            <span
              className={`font-bold ${diff === 0 ? "text-gray-600" : diff > 0 ? "text-orange-600" : "text-green-600"}`}
            >
              {diff === 0 ? "0" : diff > 0 ? `+${diff}` : diff.toString()}
            </span>
          )
        },
        enableSorting: false
      }
    ],
    []
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Mileage Report - {tripData?.loadNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Info */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Truck:</span>
              <span className="font-medium">{tripData?.unitNumber}</span>
              <span className="font-medium">{tripData?.driverName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Load Number:</span>
              <span className="font-medium">{tripData?.loadNumber}</span>
            </div>
          </div>

          {/* Data Table */}
          <div className="h-[400px]">
            <DataTable
              columns={columns}
              data={reportData}
              isLoading={false}
              isFetching={false}
              fetchNextPage={() => {}}
              totalDBRowCount={reportData.length}
              hasNextPage={false}
              onSortingChange={() => {}} // Enable sorting
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TripMileageReportDialog
