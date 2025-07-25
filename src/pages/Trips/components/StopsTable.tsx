import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, GripVertical } from "lucide-react"
import { useRouteStore } from "@/store"
import { STOP_TYPE_OPTIONS, LOAD_STATUS_OPTIONS } from "@/constants"
import type { ITripStopResponse, LoadStatus, StopType } from "@/types"
import { useState } from "react"
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
  formatDuration,
  isRecentlyMoved,
  isDragActive
}: SortableRowProps & { isRecentlyMoved?: boolean; isDragActive?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${stop.address}-${stop.latitude}-${stop.longitude}`,
    disabled: isFirst || isLast, // Disable dragging AND dropping for start and delivery rows
    animateLayoutChanges: () => true
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition || "transform 0.25s cubic-bezier(0.2, 0, 0, 1)"
  }

  // Dynamic row styling
  let rowClassName = "transition-all duration-300 ease-in-out "

  // Grey background for middle stops with hover effect
  if (!isFirst && !isLast) {
    rowClassName += "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/50 "
  } else {
    // Add hover effect for start and delivery rows too
    rowClassName += "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 "
  }

  // Highlight recently moved items with smooth transition
  if (isRecentlyMoved) {
    rowClassName += "!bg-green-50 dark:!bg-green-900/20 border-l-2 border-green-400 "
  }

  // Dragging state
  if (isDragging) {
    rowClassName += "opacity-50 shadow-lg scale-105 !transition-none "
  }

  // Global drag state
  if (isDragActive && !isDragging) {
    rowClassName += "opacity-75 "
  }

  return (
    <TableRow ref={setNodeRef} style={style} className={rowClassName.trim()}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {/* Drag handle - only for middle stops */}
          {!isFirst && !isLast && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab rounded p-1 hover:bg-zinc-200 active:cursor-grabbing dark:hover:bg-zinc-700"
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
        <Select
          value={stop.stopType}
          onValueChange={(value: StopType) => onStopUpdate(index, "stopType", value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STOP_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className={option.className}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={stop.loadStatus} onValueChange={(value: LoadStatus) => onStopUpdate(index, "loadStatus", value)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOAD_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className={option.className}>{option.label}</span>
              </SelectItem>
            ))}
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

  // State for visual feedback
  const [recentlyMoved, setRecentlyMoved] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    if (active.id !== over?.id) {
      // Find indices by matching the unique ID
      const oldIndex = stops.findIndex((stop) => `${stop.address}-${stop.latitude}-${stop.longitude}` === active.id)
      const newIndex = stops.findIndex((stop) => `${stop.address}-${stop.latitude}-${stop.longitude}` === over?.id)

      // Don't allow moving start (index 0) or delivery (last index)
      if (oldIndex === 0 || oldIndex === stops.length - 1 || newIndex === 0 || newIndex === stops.length - 1) {
        return
      }

      const newStops = arrayMove(stops, oldIndex, newIndex)

      // Update orderIndex and stopType for all stops
      const updatedStops = newStops.map((stop, index) => ({
        ...stop,
        orderIndex: index,
        stopType: index === 0 ? ("START" as StopType) : 
                  index === newStops.length - 1 ? ("DELIVERY" as StopType) : 
                  stop.stopType
      }))

      // Visual feedback - highlight moved items
      setRecentlyMoved([Math.min(oldIndex, newIndex), Math.max(oldIndex, newIndex)])

      // Show success feedback with smooth fade-out
      setTimeout(() => {
        setRecentlyMoved([])
      }, 1500) // Clear highlight after 1.5 seconds

      onReorderStops(updatedStops)
    }
  }

  if (stops.length === 0) return null

  return (
    <div className="space-y-2">
      <Label>Route Stops</Label>
      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stops
              .filter((_, index) => index !== 0 && index !== stops.length - 1) // Only middle stops
              .map((stop) => `${stop.address}-${stop.latitude}-${stop.longitude}`)}
            strategy={verticalListSortingStrategy}
          >
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
                      key={`${stop.address}-${stop.latitude}-${stop.longitude}`}
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
                      isRecentlyMoved={recentlyMoved.includes(index)}
                      isDragActive={isDragging}
                    />
                  )
                })}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

export default StopsTable
