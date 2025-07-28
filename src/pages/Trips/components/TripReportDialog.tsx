import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ITripSummaryResponse } from "@/types"

interface TripReportDialogProps {
  isOpen: boolean
  onClose: () => void
  tripData?: ITripSummaryResponse
}

const TripReportDialog = ({ isOpen, onClose, tripData }: TripReportDialogProps) => {
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

    return {
      here: {
        title: "HERE Trip",
        stops: baseStops,
        totalMiles: (tripData.mileStats.totalMiles * 0.95).toFixed(1),
        totalHours: ((tripData.mileStats.totalMiles * 0.95) / 65).toFixed(2)
      },
      samsara: {
        title: "Samsara Trip",
        stops: [
          ...baseStops,
          // Add nearby points from samsara data
          ...tripData.samsaraLocation.nearbyPoints.map((point, index) => ({
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
          ...tripData.gleLocation.nearbyPoints.map((point, index) => ({
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
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trip Report - {tripData.loadNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {Object.entries(reportData).map(([mapType, data]) => (
            <div key={mapType} className="space-y-4">
              <h3 className="text-lg font-semibold">{data.title}</h3>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stop Type</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Miles</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.stops.map((stop, index) => (
                      <TableRow key={`${stop.id}-${index}`}>
                        <TableCell className="font-medium">
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
                        <TableCell className="text-right">{stop.miles > 0 ? stop.miles.toFixed(1) : "-"}</TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {stop.totalMiles > 0 ? stop.totalMiles.toFixed(1) : "-"}
                        </TableCell>
                        <TableCell className="text-right">{stop.hours !== "0.00" ? stop.hours : "-"}</TableCell>
                      </TableRow>
                    ))}
                    {/* Total row */}
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">{data.totalMiles}</TableCell>
                      <TableCell className="text-right font-bold">{data.totalHours}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TripReportDialog
