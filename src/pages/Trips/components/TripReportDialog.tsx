import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useHereRoutingQuery } from "@/hooks/trips/queries/useHereRoutingQuery"
import { useMemo } from "react"
import type { ITripSummaryResponse } from "@/types"

interface TripReportDialogProps {
  isOpen: boolean
  onClose: () => void
  tripData?: ITripSummaryResponse
  mapType?: "here" | "samsara" | "gle" // Which map was clicked
}

const TripReportDialog = ({ isOpen, onClose, tripData, mapType = "here" }: TripReportDialogProps) => {
  // Prepare HERE routing parameters from trip stops - ALWAYS call hooks
  const hereRoutingParams = useMemo(() => {
    if (!tripData?.tripStops || tripData.tripStops.length < 2) return null

    const stops = tripData.tripStops
    const origin = { lat: stops[0].latitude, lng: stops[0].longitude }
    const destination = { lat: stops[stops.length - 1].latitude, lng: stops[stops.length - 1].longitude }
    const waypoints = stops.slice(1, -1).map((stop) => ({ lat: stop.latitude, lng: stop.longitude }))

    return {
      origin,
      destination,
      waypoints: waypoints.length > 0 ? waypoints : undefined,
      transportMode: "truck" as const,
      routingMode: "fast" as const,
      return: "summary" as const
    }
  }, [tripData?.tripStops])

  // Get real route calculation from HERE API - ALWAYS call hooks
  const { data: hereRouteData } = useHereRoutingQuery(hereRoutingParams, !!hereRoutingParams)

  // Early return AFTER hooks
  if (!tripData) return null

  // Generate report data for each map type
  const generateReportData = () => {
    const baseStops = tripData.tripStops.map((stop, index) => ({
      id: stop.id,
      city: stop.address,
      stopType: stop.stopType,
      miles: stop.distance,
      totalMiles: stop.totalDistance,
      hours: (stop.duration / 3600000).toFixed(2) // Convert milliseconds to hours
    }))

    // Calculate HERE API totals
    let hereTotalMiles = 0
    let hereTotalHours = 0

    if (hereRouteData?.routes?.[0]?.sections) {
      const sections = hereRouteData.routes[0].sections
      const totalLength = sections.reduce((sum, section) => sum + section.summary.length, 0)
      const totalDuration = sections.reduce((sum, section) => sum + section.summary.duration, 0)

      hereTotalMiles = totalLength / 1609.34 // Convert meters to miles
      hereTotalHours = totalDuration / 3600 // Convert seconds to hours
    }

    return {
      here: {
        title: "HERE Trip",
        stops: baseStops,
        totalMiles: hereTotalMiles.toFixed(1),
        totalHours: hereTotalHours.toFixed(2)
      },
      samsara: {
        title: "Samsara Trip",
        stops: [
          ...baseStops,
          // Add nearby points from samsara data
          ...(tripData.samsaraLocation?.nearbyPoints || []).map((point, index) => ({
            id: `nearby-${index}`,
            city: `${point.type} Location`,
            stopType: point.type,
            miles: 0,
            totalMiles: 0,
            hours: "0.00"
          }))
        ],
        totalMiles: (tripData.mileStats.totalMiles * 1.1).toFixed(1),
        totalHours: ((tripData.mileStats.totalMiles * 1.1) / 60).toFixed(2)
      },
      gle: {
        title: "GLE Trip",
        stops: [
          ...baseStops,
          // Add nearby points from GLE data
          ...(tripData.gleLocation?.nearbyPoints || []).map((point, index) => ({
            id: `nearby-${index}`,
            city: `${point.type} Location`,
            stopType: point.type,
            miles: 0,
            totalMiles: 0,
            hours: "0.00"
          }))
        ],
        totalMiles: tripData.mileStats.totalMiles.toFixed(1),
        totalHours: (tripData.mileStats.totalMiles / 65).toFixed(2)
      }
    }
  }

  const reportData = generateReportData()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {mapType.toUpperCase()} Trip Report - {tripData.loadNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Show only the selected map type data */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{reportData[mapType].title}</h3>
              {mapType === "here" && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Total Miles:</span>
                    <span className="font-medium text-blue-600">{reportData[mapType].totalMiles}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Total Hours:</span>
                    <span className="font-medium text-blue-600">{reportData[mapType].totalHours}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Stop Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-left">Miles</TableHead>
                    <TableHead className="text-left">Total</TableHead>
                    <TableHead className="text-left">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData[mapType].stops.map((stop, index) => (
                    <TableRow key={`${stop.id}-${index}`}>
                      <TableCell className="font-medium pl-4">
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
                      </TableCell>
                      <TableCell>{stop.city}</TableCell>
                      <TableCell className="text-left">{stop.miles > 0 ? stop.miles.toFixed(1) : "-"}</TableCell>
                      <TableCell className="text-left font-medium text-blue-600">
                        {stop.totalMiles > 0 ? stop.totalMiles.toFixed(1) : "-"}
                      </TableCell>
                      <TableCell className="text-left">{stop.hours !== "0.00" ? stop.hours : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-left font-bold text-blue-600">
                      {reportData[mapType].totalMiles}
                    </TableCell>
                    <TableCell className="text-left font-bold">{reportData[mapType].totalHours}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TripReportDialog
