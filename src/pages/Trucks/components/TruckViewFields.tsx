import { Label } from "@/components/ui/label"

import type { ITruckResponse } from "@/types"
import { format } from "date-fns"

interface TruckViewFieldsProps {
  truck: ITruckResponse
}

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="break-words">
    <Label className="text-muted-foreground text-sm font-medium">{label}</Label>
    <p className="text-foreground text-base">{value || "N/A"}</p>
  </div>
)

const TruckViewFields = ({ truck }: TruckViewFieldsProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "PPpp")
    } catch {
      return "Invalid Date"
    }
  }

  return (
    <div className="space-y-6">
      {/* General Information */}
      <div className="space-y-4">
        <h3 className="text-foreground text-lg font-semibold">General Information</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 border-t pt-4 sm:grid-cols-2 md:grid-cols-3">
          <DetailField label="Unit Number" value={truck.unitNumber} />
          <DetailField label="VIN Number" value={truck.vinNumber} />
          <DetailField label="Samsara VIN" value={truck.samsaraVin} />
          <DetailField label="License Plate" value={truck.licencePlate} />
          <DetailField label="Vehicle ID" value={truck.vehicleId} />
          <DetailField
            label="Status"
            value={
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${truck.active ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}
              >
                {truck.active ? "Active" : "Inactive"}
              </span>
            }
          />
        </div>
      </div>

      {/* Company & Driver */}
      <div className="space-y-4">
        <h3 className="text-foreground text-lg font-semibold">Company & Driver</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 border-t pt-4 sm:grid-cols-2">
          <DetailField label="Company Name" value={truck.companyName} />
          <DetailField label="Driver Names" value={truck.driverNames} />
        </div>
      </div>

      {/* Home Location */}
      <div className="space-y-4">
        <h3 className="text-foreground text-lg font-semibold">Home Location</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 border-t pt-4">
          <DetailField label="Location" value={truck.homeLocation} />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Latitude" value={truck.homeLatitude} />
            <DetailField label="Longitude" value={truck.homeLongitude} />
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="space-y-4">
        <h3 className="text-foreground text-lg font-semibold">System Information</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 border-t pt-4 sm:grid-cols-2">
          <DetailField label="Truck ID" value={truck.id} />
          <DetailField label="Company ID" value={truck.companyId} />
          <DetailField label="Created At" value={formatDate(truck.createdAt)} />
          <DetailField label="Last Updated" value={formatDate(truck.updated)} />
        </div>
      </div>
    </div>
  )
}

export default TruckViewFields
