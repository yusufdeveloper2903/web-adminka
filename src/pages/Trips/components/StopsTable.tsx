import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, GripVertical } from "lucide-react"
import { useRouteStore } from "@/store"
import type { ITripStopResponse, LoadStatus, StopType } from "@/types"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface StopsTableProps {
  stops: ITripStopResponse[]
  onRemoveStop: (index: number) => void
  onStopUpdate: (index: number, field: keyof ITripStopResponse, value: any) => void
  onReorderStops: (stops: ITripStopResponse[]) => void
  formatDistance: (distance: number) => string
  formatDuration: (duration: number) => string
}

interface SortableRowProps {
  stop: ITripStopResponse
  index: number
  isFirst: boolean
  isLast: boolean
  stopLabel: string
  distanceUnit: string
  onRemoveStop: (index: number) => void
  onStopUpdate: (index: number, field: keyof ITripStopResponse, value: any) => void
  formatDistance: (distance: number) => string
  formatDuration: (duration: number) => string
}

const SortableRow = ({
  stop,
  index,
  isFirst,
  isLast,
  stopLabel,
  onRemoveStop,
  onStopUpdate,
  formatDistance,
  formatDuration
}: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.orderIndex })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  // Grey background for middle stops (not start or delivery)
  const rowClassName = !isFirst && !isLast ? "bg-gray-50 dark:bg-gray-800/50" : ""

  return (
    <TableRow ref={setNodeRef} style={style} className={`${rowClassName} ${isDragging ? "opacity-50" : ""}`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {/* Drag handle - only for middle stops */}
          {!isFirst && !isLast && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab rounded p-1 hover:bg-gray-200 active:cursor-grabbing dark:hover:bg-gray-700"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <span className={`${isFirst ? "text-green-600" : isLast ? "text-red-600" : "text-blue-600"}`}>
            {stopLabel}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-xs truncate" title={stop.address}>
        {stop.address}
      </TableCell>
      <TableCell>-</TableCell>
      <TableCell>{formatDistance(stop.distance)}</TableCell>
      <TableCell className="font-medium text-blue-600">{formatDistance(stop.totalDistance)}</TableCell>
      <TableCell>{formatDuration(stop.duration)}</TableCell>
      <TableCell>
        <Select value={stop.stopType} onValueChange={(value: StopType) => onStopUpdate(index, "stopType", value)}>
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
        <Select value={stop.loadStatus} onValueChange={(value: LoadStatus) => onStopUpdate(index, "loadStatus", value)}>
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
  )
}

const StopsTable = ({
  stops,
  onRemoveStop,
  onStopUpdate,
  onReorderStops,
  formatDistance,
  formatDuration
}: StopsTableProps) => {
  const { routeSettings } = useRouteStore()
  const distanceUnit = routeSettings.distanceUnit === "km" ? "KM" : "Miles"

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = stops.findIndex((stop) => stop.orderIndex === active.id)
      const newIndex = stops.findIndex((stop) => stop.orderIndex === over?.id)

      // Don't allow moving start (index 0) or delivery (last index)
      if (oldIndex === 0 || oldIndex === stops.length - 1 || newIndex === 0 || newIndex === stops.length - 1) {
        return
      }

      const newStops = arrayMove(stops, oldIndex, newIndex)

      // Update orderIndex for all stops
      const updatedStops = newStops.map((stop, index) => ({
        ...stop,
        orderIndex: index
      }))

      onReorderStops(updatedStops)
    }
  }

  if (stops.length === 0) return null

  return (
    <div className="space-y-2">
      <Label>Route Stops</Label>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Stop</TableHead>
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={stops.map((stop) => stop.orderIndex)} strategy={verticalListSortingStrategy}>
                {stops.map((stop, index) => {
                  const isFirst = index === 0
                  const isLast = index === stops.length - 1

                  let stopLabel = `Stop ${index}`
                  if (isFirst) {
                    stopLabel = "Start"
                  } else if (isLast && stops.length > 1) {
                    stopLabel = "Delivery"
                  }

                  return (
                    <SortableRow
                      key={stop.orderIndex}
                      stop={stop}
                      index={index}
                      isFirst={isFirst}
                      isLast={isLast}
                      stopLabel={stopLabel}
                      distanceUnit={distanceUnit}
                      onRemoveStop={onRemoveStop}
                      onStopUpdate={onStopUpdate}
                      formatDistance={formatDistance}
                      formatDuration={formatDuration}
                    />
                  )
                })}
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default StopsTable
