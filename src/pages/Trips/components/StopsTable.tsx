import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X } from "lucide-react"
import { useRouteStore } from "@/store"
import type { TripStopCreateDto, LoadStatus, StopType } from "@/types"

interface StopsTableProps {
  stops: TripStopCreateDto[]
  onRemoveStop: (index: number) => void
  onStopUpdate: (index: number, field: keyof TripStopCreateDto, value: any) => void
  formatDistance: (distance: number) => string
  formatDuration: (durationMs: number) => string
}

const StopsTable = ({ stops, onRemoveStop, onStopUpdate, formatDistance, formatDuration }: StopsTableProps) => {
  const { routeSettings } = useRouteStore()
  const distanceUnit = routeSettings.distanceUnit === 'km' ? 'KM' : 'Miles'
  
  if (stops.length === 0) return null

  return (
    <div className="space-y-2">
      <Label>Route Stops</Label>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Post Code</TableHead>
              <TableHead>{distanceUnit}</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops.map((stop, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">#{index + 1}</TableCell>
                <TableCell className="max-w-xs truncate" title={stop.address}>
                  {stop.address}
                </TableCell>
                <TableCell>{stop.postCode}</TableCell>
                <TableCell>{formatDistance(stop.distance)}</TableCell>
                <TableCell className="font-medium text-blue-600">{formatDistance(stop.totalDistance)}</TableCell>
                <TableCell>{formatDuration(stop.durationMs)}</TableCell>
                <TableCell>
                  <Select
                    value={stop.stopType}
                    onValueChange={(value: StopType) => onStopUpdate(index, "stopType", value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PICKUP">PICKUP</SelectItem>
                      <SelectItem value="DELIVERY">DELIVERY</SelectItem>
                      <SelectItem value="TRAILER">TRAILER</SelectItem>
                      <SelectItem value="SHOP">SHOP</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={stop.loadStatus}
                    onValueChange={(value: LoadStatus) => onStopUpdate(index, "loadStatus", value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOADED">
                        <span className="text-orange-600">LOADED</span>
                      </SelectItem>
                      <SelectItem value="EMPTY">
                        <span className="text-blue-600">EMPTY</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveStop(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default StopsTable
