import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { metersToMiles, formatDuration } from "@/lib/distance-utils"
import type { ITripSummaryResponse } from "@/types"

interface TripReportDialogProps {
  isOpen: boolean
  onClose: () => void
  tripData?: ITripSummaryResponse
  mapType?: "here" | "samsara" | "gle" // Which map was clicked
}

const TripReportDialog = ({ isOpen, onClose, tripData, mapType = "here" }: TripReportDialogProps) => {
  // Early return if no trip data
  if (!tripData) return null

  // Generate report data for each map type
  const generateReportData = () => {
    const baseStops = tripData.tripStops.map((stop) => ({
      id: stop.id,
      city: stop.address,
      stopType: stop.stopType,
      miles: metersToMiles(stop.distance), // Convert meters to miles
      totalMiles: metersToMiles(stop.totalDistance), // Convert meters to miles
      hours: formatDuration(stop.duration) // Duration is already in seconds from API
    }))

    // Use backend mileStats for totals (no HERE API calculation needed)
    const backendTotalMiles = tripData.mileStats.totalMiles.toFixed(1)
    const backendTotalHours = formatDuration(tripData.mileStats.totalDuration)

    return {
      here: {
        title: "HERE Trip",
        stops: baseStops,
        totalMiles: backendTotalMiles,
        totalHours: backendTotalHours
      },
      samsara: {
        title: "Samsara Trip",
        stops: tripData.samsaraLocation?.nearbyPoints?.length
          ? [
              ...tripData.samsaraLocation.nearbyPoints.map((point, pointIndex) => ({
                id: `nearby-${pointIndex}`,
                city: `${point.type} Location`,
                stopType: point.type,
                miles: 0,
                totalMiles: 0,
                hours: "0.00"
              }))
            ]
          : [],
        totalMiles: tripData.samsaraLocation ? metersToMiles(tripData.samsaraLocation.distance).toFixed(1) : "0.0",
        totalHours: tripData.samsaraLocation ? formatDuration(tripData.samsaraLocation.duration) : "0.00"
      },
      gle: {
        title: "GLE Trip",
        stops: tripData.gleLocation?.nearbyPoints?.length
          ? [
              ...tripData.gleLocation.nearbyPoints.map((point, pointIndex) => ({
                id: `nearby-${pointIndex}`,
                city: `${point.type} Location`,
                stopType: point.type,
                miles: 0,
                totalMiles: 0,
                hours: "0.00"
              }))
            ]
          : [],
        totalMiles: tripData.gleLocation ? metersToMiles(tripData.gleLocation.distance).toFixed(1) : "0.0",
        totalHours: tripData.gleLocation ? formatDuration(tripData.gleLocation.duration) : "0.00"
      }
    }
  }

  const reportData = generateReportData()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-x-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {mapType.toUpperCase()} Trip Report - {tripData.loadNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Show only the selected map type data */}
          <div className="space-y-4">
            {/* Show message for Samsara/GLE when no nearby points */}
            {(mapType === "samsara" || mapType === "gle") && !tripData[`${mapType}Location`]?.nearbyPoints?.length && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Limited Data Available</span>
                </div>
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  Additional location data has not been provided by the backend system. Statistics are calculated based
                  on available trip stops only.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <section className="flex justify-between">
                <div className="text-muted-foreground text-xs">
                  <strong>Miles/Hours:</strong> Distance and time from previous stop to current stop
                  <br />
                  <strong>Total Miles:</strong> Total distance from trip start to current stop
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Total Miles:</span>
                      <span className="font-medium text-[#0061A0]">{reportData[mapType].totalMiles}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Total Hours:</span>
                      <span className="font-medium text-[#0061A0]">{reportData[mapType].totalHours}</span>
                    </div>
                  </div>
                </div>
              </section>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#30B0C7]">
                      <TableHead className="max-w-[120px] pl-4 text-left">
                        <div className="truncate">Stop Type</div>
                      </TableHead>
                      <TableHead className="max-w-[250px] text-left">
                        <div className="truncate">City</div>
                      </TableHead>
                      <TableHead className="max-w-[100px] text-left font-medium">
                        <div className="truncate">Miles</div>
                      </TableHead>
                      <TableHead className="max-w-[120px] text-left font-semibold text-[#0061A0]">
                        <div className="truncate">Total Miles</div>
                      </TableHead>
                      <TableHead className="max-w-[100px] text-left font-medium">
                        <div className="truncate">Hours</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData[mapType].stops.map((stop, index) => (
                      <TableRow key={stop.id} className={index !== 0 ? "dark:bg-background bg-[#F1F1F6]" : ""}>
                        <TableCell className="max-w-[120px] pl-4 font-medium">
                          <div className="truncate">
                            {stop.stopType === "START"
                              ? "Start"
                              : stop.stopType === "PICKUP"
                                ? "Stop 1"
                                : stop.stopType === "DELIVERY"
                                  ? "Delivery"
                                  : stop.stopType === "HOME"
                                    ? "Home"
                                    : stop.stopType === "SHOP"
                                      ? "Shop"
                                      : stop.stopType}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="truncate" title={stop.city}>
                            {stop.city}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[100px] text-left">
                          <div className="truncate">{stop.miles > 0 ? stop.miles.toFixed(1) : "-"}</div>
                        </TableCell>
                        <TableCell className="max-w-[120px] text-left font-medium text-[#0061A0]">
                          <div className="truncate">{stop.totalMiles > 0 ? stop.totalMiles.toFixed(1) : "-"}</div>
                        </TableCell>
                        <TableCell className="max-w-[100px] text-left">
                          <div className="truncate">{stop.hours !== "0.00" ? stop.hours : "-"}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total row */}
                    <TableRow className="font-medium">
                      <TableCell className="pl-4" colSpan={3}>
                        Total
                      </TableCell>
                      <TableCell className="text-left font-bold text-[#0061A0]">
                        {reportData[mapType].totalMiles}
                      </TableCell>
                      <TableCell className="text-left font-bold">{reportData[mapType].totalHours}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TripReportDialog
