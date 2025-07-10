import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Trash2 } from "lucide-react"

const stops = [
  { id: "start", type: "Start", postCode: "10702", city: "Yonkers, NY, Westchester", miles: "", total: "" },
  { id: "stop1", type: "Stop 1", postCode: "11750", city: "ABMPS, NY, Suffolk", miles: "45.2", total: "45.2" },
  { id: "stop2", type: "Stop 2", postCode: "12025", city: "Broadalbin, NY, Fulton", miles: "225.0", total: "270.2" },
  { id: "stop3", type: "Stop 3", postCode: "12550", city: "Balmville, NY, Orange", miles: "127.2", total: "397.4" },
  {
    id: "delivery",
    type: "Delivery",
    postCode: "13051",
    city: "Delphi Falls, NY, Onondaga",
    miles: "203.7",
    total: "601.1"
  }
]

const NewRouteForm = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Truck" />
          </SelectTrigger>
          <SelectContent>{/* Add truck options here */}</SelectContent>
        </Select>
        <Input placeholder="Load Number" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">City</TableHead>
              <TableHead>Post Code</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Miles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops.map((stop) => (
              <TableRow key={stop.id}>
                <TableCell className="font-medium">{stop.type}</TableCell>
                <TableCell>{stop.postCode}</TableCell>
                <TableCell>{stop.city}</TableCell>
                <TableCell>{stop.miles}</TableCell>
                <TableCell className="font-medium">{stop.total}</TableCell>
                <TableCell>{/* Hours */}</TableCell>
                <TableCell>
                  <Select defaultValue="PICKUP">
                    <SelectTrigger>
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
                  <Select defaultValue="LOADED">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOADED">Loaded</SelectItem>
                      <SelectItem value="EMPTY">Empty</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input placeholder="Start DateTime" />
          <CalendarIcon className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
        <div className="relative">
          <Input placeholder="Delivery DateTime" />
          <CalendarIcon className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
        <div className="relative">
          <Input placeholder="Start Odometer" />
          <CalendarIcon className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
        <div className="relative">
          <Input placeholder="Delivery Odometer" />
          <CalendarIcon className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Add Route</Button>
      </div>
    </div>
  )
}

export default NewRouteForm
