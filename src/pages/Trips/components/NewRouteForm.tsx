import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDrawerStore } from "@/store/drawer-store"
import { CalendarIcon, Check, Trash2, X } from "lucide-react"
import { useState } from "react"

interface Stop {
  id: string
  type: string
  postCode: string
  city: string
  miles: string
  total: string
  hours: string
  stopType: "PICKUP" | "DELIVERY" | "TRAILER" | "SHOP"
  status: "LOADED" | "EMPTY"
}

const truckOptions = [
  { value: "626", label: "626" },
  { value: "627", label: "627" },
  { value: "628", label: "628" }
]

const dispatcherOptions = [
  { value: "john-doe", label: "John Doe" },
  { value: "jane-smith", label: "Jane Smith" },
  { value: "mike-johnson", label: "Mike Johnson" }
]

const NewRouteForm = () => {
  const { closeDrawer } = useDrawerStore()

  // Form state
  const [selectedTruck, setSelectedTruck] = useState<string>("")
  const [dispatcher, setDispatcher] = useState<string>("")
  const [loadNumber, setLoadNumber] = useState<string>("")

  // New stop form state
  const [newCity, setNewCity] = useState<string>("")
  const [newStopType, setNewStopType] = useState<"PICKUP" | "DELIVERY" | "TRAILER" | "SHOP">("PICKUP")
  const [newStatus, setNewStatus] = useState<"LOADED" | "EMPTY">("LOADED")

  // Date/time state
  const [startDateTime, setStartDateTime] = useState<string>("")
  const [deliveryDateTime, setDeliveryDateTime] = useState<string>("")
  const [startOdometer, setStartOdometer] = useState<string>("")
  const [deliveryOdometer, setDeliveryOdometer] = useState<string>("")

  // Stops table state
  const [stops, setStops] = useState<Stop[]>([
    {
      id: "start",
      type: "Start",
      postCode: "10702",
      city: "Yonkers, NY, Westchester",
      miles: "",
      total: "",
      hours: "",
      stopType: "PICKUP",
      status: "LOADED"
    }
  ])

  // Calculate miles and total (simplified calculation)
  const calculateMiles = (stops: Stop[]) => {
    const baseMiles = [45.2, 225.0, 127.2, 203.7]
    let runningTotal = 0

    return stops.map((stop, index) => {
      if (index === 0) return stop // Start stop doesn't have miles

      const miles = baseMiles[index - 1] || Math.floor(Math.random() * 200) + 50
      runningTotal += miles

      return {
        ...stop,
        miles: miles.toString(),
        total: runningTotal.toString(),
        hours: (miles / 60).toFixed(2) // Simplified hours calculation
      }
    })
  }

  const handleAddStop = () => {
    if (!newCity.trim()) return

    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      type: `Stop ${stops.length}`,
      postCode: Math.floor(Math.random() * 90000 + 10000).toString(), // Random postcode
      city: newCity,
      miles: "",
      total: "",
      hours: "",
      stopType: newStopType,
      status: newStatus
    }

    const updatedStops = [...stops, newStop]
    const calculatedStops = calculateMiles(updatedStops)
    setStops(calculatedStops)

    // Reset form
    setNewCity("")
    setNewStopType("PICKUP")
    setNewStatus("LOADED")
  }

  const handleRemoveStop = (stopId: string) => {
    if (stopId === "start") return // Can't remove start stop

    const filteredStops = stops.filter((stop) => stop.id !== stopId)
    const recalculatedStops = calculateMiles(filteredStops)
    setStops(recalculatedStops)
  }

  const handleStopTypeChange = (stopId: string, newType: "PICKUP" | "DELIVERY" | "TRAILER" | "SHOP") => {
    setStops((prev) => prev.map((stop) => (stop.id === stopId ? { ...stop, stopType: newType } : stop)))
  }

  const handleStatusChange = (stopId: string, newStatus: "LOADED" | "EMPTY") => {
    setStops((prev) => prev.map((stop) => (stop.id === stopId ? { ...stop, status: newStatus } : stop)))
  }

  const handleSubmit = () => {
    const routeData = {
      truck: selectedTruck,
      dispatcher,
      loadNumber,
      stops,
      startDateTime,
      deliveryDateTime,
      startOdometer,
      deliveryOdometer,
      totalMiles: stops[stops.length - 1]?.total || "0"
    }

    console.log("Route data:", routeData)
    // Bu yerda backend API ga jo'natish kerak bo'ladi

    closeDrawer()
  }

  const handleDeleteTrip = () => {
    // Reset all form data
    setSelectedTruck("")
    setDispatcher("")
    setLoadNumber("")
    setStops([
      {
        id: "start",
        type: "Start",
        postCode: "10702",
        city: "Yonkers, NY, Westchester",
        miles: "",
        total: "",
        hours: "",
        stopType: "PICKUP",
        status: "LOADED"
      }
    ])
    setStartDateTime("")
    setDeliveryDateTime("")
    setStartOdometer("")
    setDeliveryOdometer("")
  }

  return (
    <div className="space-y-6">
      {/* Top section - Truck, Dispatcher, Load Number */}
      <div className="grid grid-cols-3 gap-4">
        <Select value={selectedTruck} onValueChange={setSelectedTruck}>
          <SelectTrigger>
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

        <Select value={dispatcher} onValueChange={setDispatcher}>
          <SelectTrigger>
            <SelectValue placeholder="Dispatcher" />
          </SelectTrigger>
          <SelectContent>
            {dispatcherOptions.map((disp) => (
              <SelectItem key={disp.value} value={disp.value}>
                {disp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input placeholder="Load Number" value={loadNumber} onChange={(e) => setLoadNumber(e.target.value)} />
      </div>

      {/* Add new stop section */}
      <div className="flex items-center gap-4">
        <Input placeholder="City" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="flex-1" />

        <Select
          value={newStopType}
          onValueChange={(value: "PICKUP" | "DELIVERY" | "TRAILER" | "SHOP") => setNewStopType(value)}
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

        <Select value={newStatus} onValueChange={(value: "LOADED" | "EMPTY") => setNewStatus(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOADED">LOADED</SelectItem>
            <SelectItem value="EMPTY">EMPTY</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleAddStop}
          disabled={!newCity.trim()}
          size="icon"
          className="bg-teal-500 hover:bg-teal-600"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>

      {/* Stops table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Stop</TableHead>
              <TableHead>Post Code</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Miles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops.map((stop) => (
              <TableRow key={stop.id}>
                <TableCell className="font-medium">{stop.type}</TableCell>
                <TableCell>{stop.postCode}</TableCell>
                <TableCell>{stop.city}</TableCell>
                <TableCell>{stop.miles}</TableCell>
                <TableCell className="font-medium text-blue-600">{stop.total}</TableCell>
                <TableCell>{stop.hours}</TableCell>
                <TableCell>
                  <Select
                    value={stop.stopType}
                    onValueChange={(value: "PICKUP" | "DELIVERY" | "TRAILER" | "SHOP") =>
                      handleStopTypeChange(stop.id, value)
                    }
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
                    value={stop.status}
                    onValueChange={(value: "LOADED" | "EMPTY") => handleStatusChange(stop.id, value)}
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
                  {stop.id !== "start" && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveStop(stop.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Date/time inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input
            placeholder="Start DateTime"
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
          />
          <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
        <div className="relative">
          <Input
            placeholder="Delivery DateTime"
            type="datetime-local"
            value={deliveryDateTime}
            onChange={(e) => setDeliveryDateTime(e.target.value)}
          />
          <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
        <div className="relative">
          <Input
            placeholder="Start Odometer"
            type="number"
            value={startOdometer}
            onChange={(e) => setStartOdometer(e.target.value)}
          />
        </div>
        <div className="relative">
          <Input
            placeholder="Delivery Odometer"
            type="number"
            value={deliveryOdometer}
            onChange={(e) => setDeliveryOdometer(e.target.value)}
          />
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleDeleteTrip}>
          Delete Trip
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={closeDrawer}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedTruck || !loadNumber || stops.length < 2}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NewRouteForm
