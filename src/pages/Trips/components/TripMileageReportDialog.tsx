import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared"
import { useMemo, useState, useRef, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useTripReportSummaryQuery } from "@/hooks/trips"
import { useRouteStore } from "@/store"
import type { IdentifierType } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { useUpdatePayableMileageMutation } from "@/hooks/trips"
interface TripMileageReportDialogProps {
  isOpen: boolean
  onClose: () => void
}

const TripMileageReportDialog = ({ isOpen, onClose }: TripMileageReportDialogProps) => {
  const { currentTripData } = useRouteStore()

  const { data: tripReportData, isFetching } = useTripReportSummaryQuery(
    {
      truckId: currentTripData?.truckId as number,
      driverId: currentTripData?.driverId,
      number:
        currentTripData?.identifierType === "TRAILER_NUMBER"
          ? (currentTripData?.trailerNumber as string)
          : (currentTripData?.loadNumber as string),
      identifierType: currentTripData?.identifierType as IdentifierType
    },
    !!currentTripData?.truckId && (!!currentTripData?.loadNumber || !!currentTripData?.trailerNumber)
  )

  const { hereStats, samsaraStats, gleStats } = tripReportData || {}

  // Generate report data
  const reportData = useMemo(() => {
    if (!currentTripData) return []

    const hereData = {
      no: 1,
      system: "HERE",
      tripId: currentTripData?.id,
      miles: hereStats?.miles,
      totalEmpty: hereStats?.totalEmpty,
      pu: hereStats?.pu,
      trl: hereStats?.trl,
      totalMiles: hereStats?.totalMiles,
      totalOdometers: hereStats?.totalOdometers,
      payableMileage: hereStats?.payableMileage,
      differences: 0 // HERE is baseline
    }

    const samsaraData = {
      no: 2,
      system: "SAMSARA",
      miles: samsaraStats?.miles,
      totalEmpty: samsaraStats?.totalEmpty,
      pu: samsaraStats?.pu,
      trl: samsaraStats?.trl,
      totalMiles: samsaraStats?.totalMiles,
      totalOdometers: samsaraStats?.totalOdometers,
      differences: Number((Number(samsaraStats?.totalMiles) - Number(hereStats?.totalMiles)).toFixed(1)) || 0
    }

    const gleData = {
      no: 3,
      system: "GLE",
      miles: gleStats?.miles,
      totalEmpty: gleStats?.totalEmpty,
      pu: gleStats?.pu,
      trl: gleStats?.trl,
      totalMiles: gleStats?.totalMiles,
      totalOdometers: gleStats?.totalOdometers,
      differences: Number((Number(gleStats?.totalMiles) - Number(hereStats?.totalMiles)).toFixed(1)) || 0
    }

    return [hereData, samsaraData, gleData]
  }, [
    currentTripData,
    gleStats?.miles,
    gleStats?.pu,
    gleStats?.totalEmpty,
    gleStats?.totalMiles,
    gleStats?.totalOdometers,
    gleStats?.trl,
    hereStats?.miles,
    hereStats?.pu,
    hereStats?.totalEmpty,
    hereStats?.totalMiles,
    hereStats?.totalOdometers,
    hereStats?.trl,
    samsaraStats?.miles,
    samsaraStats?.pu,
    samsaraStats?.totalEmpty,
    samsaraStats?.totalMiles,
    samsaraStats?.totalOdometers,
    samsaraStats?.trl,
    hereStats?.payableMileage
  ])

  const payableMileageRef = useRef<number | "">("")
  const [, forceRerender] = useState(0)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const { mutateAsync: updatePayableMileage } = useUpdatePayableMileageMutation()

  // Initialize/keep controlled value from backend when data arrives
  useEffect(() => {
    const serverValue = (hereStats as any)?.payableMileage
    payableMileageRef.current = serverValue != null ? Number(serverValue) : ""
    forceRerender((x) => x + 1)
  }, [hereStats])

  // Define columns
  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "no",
        header: "No",
        meta: {
          className: "min-w-[60px] w-[8%] text-center"
        },
        cell: ({ row }) => <span className="font-medium">{row.original.no ?? "-"}</span>,
        enableSorting: false
      },
      {
        accessorKey: "system",
        header: "System",
        meta: {
          className: "min-w-[100px] w-[15%] text-left"
        },
        cell: ({ row }) => <span className="font-bold">{row.original.system ?? "-"}</span>,
        enableSorting: false
      },
      {
        accessorKey: "miles",
        header: "Miles",
        meta: {
          className: "min-w-[80px] w-[12%] text-left"
        },
        cell: ({ row }) => <span className="font-medium">{row.original.miles == null ? "-" : row.original.miles}</span>,
        enableSorting: false
      },
      {
        accessorKey: "totalEmpty",
        header: "Total Empty",
        meta: {
          className: "min-w-[100px] w-[15%] text-left"
        },
        cell: ({ row }) => (
          <span className="font-medium">{row.original.totalEmpty == null ? "-" : row.original.totalEmpty}</span>
        ),
        enableSorting: false
      },

      {
        accessorKey: "totalMiles",
        header: "TOTAL MILES",
        meta: {
          className: "min-w-[120px] w-[15%] text-left"
        },
        cell: ({ row }) => (
          <span className="font-bold text-blue-600">
            {row.original.totalMiles == null ? "-" : row.original.totalMiles}
          </span>
        ),
        enableSorting: false
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
      },
      {
        accessorKey: "totalOdometers",
        header: "TOTAL ODOMETERS",
        meta: {
          className: "min-w-[120px] w-[15%] text-left"
        },
        cell: ({ row }) => (
          <span className="font-bold text-blue-600">
            {row.original.totalOdometers == null ? "-" : row.original.totalOdometers}
          </span>
        ),
        enableSorting: false
      },
      {
        accessorKey: "payableMileage",
        header: "PAYABLE MILEAGE",
        meta: {
          className: "min-w-[180px] w-[20%] text-left"
        },
        cell: ({ row }) => {
          return row.original.tripId ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={payableMileageRef.current}
                onChange={(e) => {
                  const v = e.target.value
                  payableMileageRef.current = v === "" ? "" : Number(v)
                  forceRerender((x) => x + 1)
                }}
                className="h-6 w-full"
              />
              <Button
                type="button"
                className="h-6 px-2"
                disabled={
                  isSaving ||
                  payableMileageRef.current === "" ||
                  payableMileageRef.current == null ||
                  Number.isNaN(Number(payableMileageRef.current))
                }
                onClick={async () => {
                  const tripId = row.original.tripId as number | undefined
                  const payableMileage = Number(payableMileageRef.current)
                  if (!tripId) {
                    toast.error("Trip ID not found")
                    return
                  }
                  try {
                    setIsSaving(true)
                    await updatePayableMileage({ tripId, payableMileage })
                  } catch (error: any) {
                    toast.error(error?.response?.data?.message || "Error updating payable mileage")
                  } finally {
                    setIsSaving(false)
                  }
                }}
                title="Save"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span className="font-medium">-</span>
          )
        },
        enableSorting: false
      }
    ],
    [isSaving, updatePayableMileage]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-hidden pb-6 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Mileage Report -{" "}
            {currentTripData?.identifierType === "LOAD_NUMBER"
              ? currentTripData?.loadNumber
              : currentTripData?.trailerNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Info */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Truck:</span>
              <span className="font-medium">{currentTripData?.unitNumber}</span>
              <span className="font-medium">{currentTripData?.driverName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground"> Number:</span>
              <span className="font-medium">
                {currentTripData?.identifierType === "LOAD_NUMBER"
                  ? currentTripData?.loadNumber
                  : currentTripData?.trailerNumber}
              </span>
            </div>
          </div>

          <div className="rounded-[8px] border">
            <DataTable
              columns={columns}
              data={reportData}
              isLoading={false}
              isFetching={isFetching}
              fetchNextPage={() => {}}
              totalDBRowCount={reportData.length}
              hasNextPage={false}
              onSortingChange={() => {}}
              className="h-[160px]"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TripMileageReportDialog
