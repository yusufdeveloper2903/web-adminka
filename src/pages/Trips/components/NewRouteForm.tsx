import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { AutosuggestInput } from "@/components/shared"
import { useDrawerStore } from "@/store/drawer-store"
import { useForm } from "@tanstack/react-form"
import { CalendarIcon, Check, X } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import type { TripCreateDto, TripStopCreateDto, LoadStatus, StopType, HereAutosuggestResult } from "@/types"

// Zod validation schemas
const tripFormSchema = z.object({
  truckId: z.string().min(1, "Please select a truck"),
  dispatcherId: z.string().min(1, "Please select a dispatcher"),
  loadNumber: z.string().min(1, "Load number is required"),
  startDateTime: z.string().min(1, "Start date/time is required"),
  endDateTime: z.string().min(1, "End date/time is required"),
  startOdometer: z.string().min(1, "Start odometer is required"),
  endOdometer: z.string().min(1, "End odometer is required")
})

// Mock data - keyinchalik backend dan keladi
const truckOptions = [
  { value: "626", label: "Truck 626" },
  { value: "627", label: "Truck 627" },
  { value: "628", label: "Truck 628" }
]

const dispatcherOptions = [
  { value: "1", label: "John Doe" },
  { value: "2", label: "Jane Smith" },
  { value: "3", label: "Mike Johnson" }
]

interface NewStopFormData {
  city: string
  stopType: StopType
  loadStatus: LoadStatus
  selectedLocation?: HereAutosuggestResult
}

const NewRouteForm = () => {
  const { closeDrawer } = useDrawerStore()

  // Stops state
  const [stops, setStops] = useState<TripStopCreateDto[]>([])

  // New stop form state
  const [newStopForm, setNewStopForm] = useState<NewStopFormData>({
    city: "",
    stopType: "PICKUP" as StopType,
    loadStatus: "LOADED" as LoadStatus,
    selectedLocation: undefined
  })

  // Main form with Tanstack Form
  const form = useForm({
    defaultValues: {
      truckId: "",
      dispatcherId: "",
      loadNumber: "",
      startDateTime: "",
      endDateTime: "",
      startOdometer: "",
      endOdometer: ""
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate with Zod
        const validatedData = tripFormSchema.parse(value)

        if (stops.length === 0) {
          alert("Please add at least one stop")
          return
        }

        const tripData: TripCreateDto = {
          truckId: parseInt(validatedData.truckId),
          dispatcherId: parseInt(validatedData.dispatcherId),
          loadNumber: validatedData.loadNumber,
          startDateTime: formatDateTime(validatedData.startDateTime),
          endDateTime: formatDateTime(validatedData.endDateTime),
          startOdometer: parseFloat(validatedData.startOdometer),
          endOdometer: parseFloat(validatedData.endOdometer),
          tripStops: stops
        }

        console.log("Trip data for backend:", tripData)

        // TODO: Send to backend API
        // await createTrip(tripData)

        closeDrawer()
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        }
      }
    }
  })

  // Calculate distance and duration (simplified)
  const calculateStopMetrics = (
    existingStops: TripStopCreateDto[],
    newStop: Omit<TripStopCreateDto, "distance" | "totalDistance" | "durationMs">
  ): TripStopCreateDto => {
    const lastStop = existingStops[existingStops.length - 1]

    // Simplified distance calculation
    const distance = lastStop
      ? Math.floor(Math.random() * 300) + 50 // Random distance between 50-350 miles
      : 0

    const totalDistance = lastStop ? lastStop.totalDistance + distance : distance
    const durationMs = distance * 60000 // 1 minute per mile (simplified)

    return {
      ...newStop,
      distance,
      totalDistance,
      durationMs
    }
  }

  // Handle location selection from autosuggest
  const handleLocationSelect = (location: HereAutosuggestResult) => {
    setNewStopForm((prev) => ({
      ...prev,
      selectedLocation: location
    }))
  }

  // Add new stop
  const handleAddStop = () => {
    if (!newStopForm.selectedLocation) return

    const newStop: Omit<TripStopCreateDto, "distance" | "totalDistance" | "durationMs"> = {
      postCode: newStopForm.selectedLocation.address.postalCode || "",
      address: newStopForm.selectedLocation.address.label,
      loadStatus: newStopForm.loadStatus,
      orderIndex: stops.length,
      latitude: newStopForm.selectedLocation.position.lat,
      longitude: newStopForm.selectedLocation.position.lng,
      stopType: newStopForm.stopType
    }

    const calculatedStop = calculateStopMetrics(stops, newStop)
    setStops((prev) => [...prev, calculatedStop])

    // Reset new stop form
    setNewStopForm({
      city: "",
      stopType: "PICKUP" as StopType,
      loadStatus: "LOADED" as LoadStatus,
      selectedLocation: undefined
    })
  }

  // Remove stop
  const handleRemoveStop = (index: number) => {
    const updatedStops = stops.filter((_, i) => i !== index)

    // Recalculate distances and totals
    const recalculatedStops = updatedStops.map((stop, i) => {
      if (i === 0) return { ...stop, distance: 0, totalDistance: stop.distance }

      const prevStop = updatedStops[i - 1]
      return {
        ...stop,
        totalDistance: prevStop.totalDistance + stop.distance,
        orderIndex: i
      }
    })

    setStops(recalculatedStops)
  }

  // Update stop
  const handleStopUpdate = (index: number, field: keyof TripStopCreateDto, value: any) => {
    setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)))
  }

  // Format datetime for backend
  const formatDateTime = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return ""
    const date = new Date(dateTimeLocal)
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      })
      .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+:\d+:\d+)/, "$3-$1-$2 $4")
  }

  // Reset form
  const handleDeleteTrip = () => {
    form.reset()
    setStops([])
    setNewStopForm({
      city: "",
      stopType: "PICKUP" as StopType,
      loadStatus: "LOADED" as LoadStatus,
      selectedLocation: undefined
    })
  }

  // Format distance for display
  const formatDistance = (distance: number) => distance.toFixed(1)
  const formatDuration = (durationMs: number) => (durationMs / 3600000).toFixed(2)

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Top section - Truck, Dispatcher, Load Number */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="truck">Truck</Label>
            <form.Field
              name="truckId"
              children={(field) => {
                const fieldResult = tripFormSchema.shape.truckId.safeParse(field.state.value)
                const hasError = field.state.meta.isTouched && !fieldResult.success

                return (
                  <>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className={hasError ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select Truck" />
                      </SelectTrigger>
                      <SelectContent>
                        {truckOptions.map((truck) => (
                          <SelectItem key={truck.value} value={truck.value}>
                            {truck.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasError && <div className="text-sm text-red-500">{fieldResult.error?.errors[0]?.message}</div>}
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispatcher">Dispatcher</Label>
            <form.Field
              name="dispatcherId"
              children={(field) => {
                const fieldResult = tripFormSchema.shape.dispatcherId.safeParse(field.state.value)
                const hasError = field.state.meta.isTouched && !fieldResult.success

                return (
                  <>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className={hasError ? "border-red-500" : ""}>
                        <SelectValue placeholder="Dispatcher" />
                      </SelectTrigger>
                      <SelectContent>
                        {dispatcherOptions.map((dispatcher) => (
                          <SelectItem key={dispatcher.value} value={dispatcher.value}>
                            {dispatcher.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasError && <div className="text-sm text-red-500">{fieldResult.error?.errors[0]?.message}</div>}
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loadNumber">Load Number</Label>
            <form.Field
              name="loadNumber"
              children={(field) => {
                const fieldResult = tripFormSchema.shape.loadNumber.safeParse(field.state.value)
                const hasError = field.state.meta.isTouched && !fieldResult.success

                return (
                  <>
                    <Input
                      placeholder="Load Number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={hasError ? "border-red-500" : ""}
                    />
                    {hasError && <div className="text-sm text-red-500">{fieldResult.error?.errors[0]?.message}</div>}
                  </>
                )
              }}
            />
          </div>
        </div>

        {/* Add new stop section with HERE Maps autosuggest */}
        <div className="space-y-2">
          <Label>Add Stop</Label>
          <div className="flex items-center gap-4">
            <AutosuggestInput
              value={newStopForm.city}
              onChange={(value) => setNewStopForm((prev) => ({ ...prev, city: value }))}
              onLocationSelect={handleLocationSelect}
              placeholder="Search city or address..."
              className="flex-1"
            />

            <Select
              value={newStopForm.stopType}
              onValueChange={(value: StopType) => setNewStopForm((prev) => ({ ...prev, stopType: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PICKUP">PICKUP</SelectItem>
                <SelectItem value="DELIVERY">DELIVERY</SelectItem>
                <SelectItem value="TRAILER">TRAILER</SelectItem>
                <SelectItem value="SHOP">SHOP</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newStopForm.loadStatus}
              onValueChange={(value: LoadStatus) => setNewStopForm((prev) => ({ ...prev, loadStatus: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOADED">LOADED</SelectItem>
                <SelectItem value="EMPTY">EMPTY</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={handleAddStop}
              disabled={!newStopForm.selectedLocation}
              size="icon"
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stops table */}
        {stops.length > 0 && (
          <div className="space-y-2">
            <Label>Route Stops</Label>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Post Code</TableHead>
                    <TableHead>Miles</TableHead>
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
                          onValueChange={(value: StopType) => handleStopUpdate(index, "stopType", value)}
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
                          onValueChange={(value: LoadStatus) => handleStopUpdate(index, "loadStatus", value)}
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
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStop(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Date/time inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDateTime">Start Date/Time</Label>
            <form.Field
              name="startDateTime"
              children={(field) => {
                const fieldResult = tripFormSchema.shape.startDateTime.safeParse(field.state.value)
                const hasError = field.state.meta.isTouched && !fieldResult.success

                return (
                  <>
                    <div className="relative">
                      <Input
                        placeholder="Start DateTime"
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={hasError ? "border-red-500" : ""}
                      />
                      <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                    </div>
                    {hasError && <div className="text-sm text-red-500">{fieldResult.error?.errors[0]?.message}</div>}
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDateTime">End Date/Time</Label>
            <form.Field
              name="endDateTime"
              children={(field) => {
                const fieldResult = tripFormSchema.shape.endDateTime.safeParse(field.state.value)
                const hasError = field.state.meta.isTouched && !fieldResult.success

                return (
                  <>
                    <div className="relative">
                      <Input
                        placeholder="End DateTime"
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={hasError ? "border-red-500" : ""}
                      />
                      <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                    </div>
                    {hasError && <div className="text-sm text-red-500">{fieldResult.error?.errors[0]?.message}</div>}
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startOdometer">Start Odometer</Label>
            <form.Field
              name="startOdometer"
              children={(field) => {
                const fieldResult = tripFormSchema.shape.startOdometer.safeParse(field.state.value)
                const hasError = field.state.meta.isTouched && !fieldResult.success

                return (
                  <>
                    <Input
                      placeholder="Start Odometer"
                      type="number"
                      step="0.1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={hasError ? "border-red-500" : ""}
                    />
                    {hasError && <div className="text-sm text-red-500">{fieldResult.error?.errors[0]?.message}</div>}
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endOdometer">End Odometer</Label>
            <form.Field
              name="endOdometer"
              children={(field) => {
                const fieldResult = tripFormSchema.shape.endOdometer.safeParse(field.state.value)
                const hasError = field.state.meta.isTouched && !fieldResult.success

                return (
                  <>
                    <Input
                      placeholder="End Odometer"
                      type="number"
                      step="0.1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={hasError ? "border-red-500" : ""}
                    />
                    {hasError && <div className="text-sm text-red-500">{fieldResult.error?.errors[0]?.message}</div>}
                  </>
                )
              }}
            />
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleDeleteTrip}>
            Delete Trip
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting || stops.length === 0}>
              {form.state.isSubmitting ? "Creating..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewRouteForm
