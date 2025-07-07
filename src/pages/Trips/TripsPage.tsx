import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, RefreshCw, Edit, Printer, Map } from "lucide-react"

// Mock ma'lumotlar
const mockTripsData = [
  {
    id: 1,
    unit: 714,
    driver: "ALI ANWAR",
    company: "FATBOY",
    loadNumber: "GLT06654841",
    dispatcher: "Henry",
    miles: 635,
    totalEmpty: 635,
    pu: 635,
    trl: 635,
    totalMiles: 635,
    pickupLocation: "Plainfield, IN 46168",
    deliveryLocation: "Huntley, IL 60142",
    updated: "10.22.2024 19:18"
  },
  {
    id: 2,
    unit: 554,
    driver: "ABDUKHALIMOV BAHODIR",
    company: "FATBOY",
    loadNumber: "5390251",
    dispatcher: "Henry",
    miles: 635,
    totalEmpty: 635,
    pu: 635,
    trl: 635,
    totalMiles: 635,
    pickupLocation: "Plainfield, IN 46168",
    deliveryLocation: "Huntley, IL 60142",
    updated: "10.22.2024 19:18"
  },
  {
    id: 3,
    unit: 636,
    driver: "TOLIB KULIYEV",
    company: "Robertson",
    loadNumber: "747566",
    dispatcher: "Lily Collins",
    miles: 635,
    totalEmpty: 635,
    pu: 635,
    trl: 635,
    totalMiles: 635,
    pickupLocation: "Plainfield, IN 46168",
    deliveryLocation: "Huntley, IL 60142",
    updated: "10.22.2024 19:18"
  },
  {
    id: 4,
    unit: 762,
    driver: "RUSLAN SHARIPOV",
    company: "FATBOY",
    loadNumber: "418526369 LP3D34854",
    dispatcher: "Kennedy",
    miles: 635,
    totalEmpty: 635,
    pu: 635,
    trl: 635,
    totalMiles: 635,
    pickupLocation: "Plainfield, IN 46168",
    deliveryLocation: "Huntley, IL 60142",
    updated: "10.22.2024 19:18"
  },
  {
    id: 5,
    unit: 362,
    driver: "PHILLIP FEY",
    company: "FATBOY",
    loadNumber: "200226154",
    dispatcher: "Alan Becker",
    miles: 635,
    totalEmpty: 635,
    pu: 635,
    trl: 635,
    totalMiles: 635,
    pickupLocation: "Plainfield, IN 46168",
    deliveryLocation: "Huntley, IL 60142",
    updated: "10.22.2024 19:18"
  },
  {
    id: 6,
    unit: 887,
    driver: "REICHEL FERGUSON WALKER",
    company: "Robertson",
    loadNumber: "9618558",
    dispatcher: "Eren",
    miles: 635,
    totalEmpty: 635,
    pu: 635,
    trl: 635,
    totalMiles: 635,
    pickupLocation: "Plainfield, IN 46168",
    deliveryLocation: "Huntley, IL 60142",
    updated: "10.22.2024 19:18"
  },
  {
    id: 7,
    unit: 225,
    driver: "MOHAMED MOHAMED OSMAN",
    company: "Robertson",
    loadNumber: "LD69999",
    dispatcher: "Austin",
    miles: 635,
    totalEmpty: 635,
    pu: 635,
    trl: 635,
    totalMiles: 635,
    pickupLocation: "Plainfield, IN 46168",
    deliveryLocation: "Huntley, IL 60142",
    updated: "10.22.2024 19:18"
  }
]

type Trip = (typeof mockTripsData)[0]

const columns: ColumnDef<Trip>[] = [
  {
    accessorKey: "id",
    header: "No",
    cell: ({ row }) => <div className="w-12">{row.original.id}</div>
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => <div className="font-medium">{row.original.unit}</div>
  },
  {
    accessorKey: "driver",
    header: "Driver",
    cell: ({ row }) => <div className="font-medium">{row.original.driver}</div>
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => <Badge variant="secondary">{row.original.company}</Badge>
  },
  {
    accessorKey: "loadNumber",
    header: "Load Number"
  },
  {
    accessorKey: "dispatcher",
    header: "Dispatcher"
  },
  {
    accessorKey: "miles",
    header: "📍 Miles",
    cell: ({ row }) => <div className="text-center">{row.original.miles}</div>
  },
  {
    accessorKey: "totalEmpty",
    header: "🏃 Total Empty",
    cell: ({ row }) => <div className="text-center">{row.original.totalEmpty}</div>
  },
  {
    accessorKey: "pu",
    header: "🚛 PU",
    cell: ({ row }) => <div className="text-center">{row.original.pu}</div>
  },
  {
    accessorKey: "trl",
    header: "🚚 TRL",
    cell: ({ row }) => <div className="text-center">{row.original.trl}</div>
  },
  {
    accessorKey: "totalMiles",
    header: "🛣️ TOTAL MILES",
    cell: ({ row }) => <div className="text-center font-bold">{row.original.totalMiles}</div>
  },
  {
    accessorKey: "pickupLocation",
    header: "Pickup Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Map className="h-4 w-4" />
        {row.original.pickupLocation}
      </div>
    )
  },
  {
    accessorKey: "deliveryLocation",
    header: "Delivery Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Map className="h-4 w-4" />
        {row.original.deliveryLocation}
      </div>
    )
  },
  {
    accessorKey: "updated",
    header: "Updated",
    cell: ({ row }) => <div className="text-muted-foreground text-xs">{row.original.updated}</div>
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost">
          <Printer className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]

// Mock API funksiyasi
const fetchTrips = async (): Promise<Trip[]> => {
  // Real API call bu yerda bo'ladi
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockTripsData
}

const TripsPage = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: trips = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["trips"],
    queryFn: fetchTrips
  })

  const filteredTrips = trips.filter(
    (trip) =>
      trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.loadNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const table = useReactTable({
    data: filteredTrips,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trips</h1>
          <p className="text-muted-foreground">Total Trips {trips.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Load</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trip List</span>
            <Badge variant="outline">Total: {filteredTrips.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs font-medium">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-xs">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TripsPage
