import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TruckEditFormProps {
  truck?: {
    id: string
    unit: string
    driver: string
    company: string
    dispatcher: string
    license_plate: string
    samsara_vin: string
    gle_vin: string
    home_location: string
    current_location: string
    updated: string
  }
  onClose: () => void
  onSubmit: (data: any) => void
}

const TruckEditForm = ({ truck, onClose, onSubmit }: TruckEditFormProps) => {
  const [formData, setFormData] = useState({
    unit: truck?.unit || "",
    driver: truck?.driver || "",
    company: truck?.company || "",
    dispatcher: truck?.dispatcher || "",
    license_plate: truck?.license_plate || "",
    samsara_vin: truck?.samsara_vin || "",
    gle_vin: truck?.gle_vin || "",
    home_location: truck?.home_location || "",
    current_location: truck?.current_location || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="h-full w-full">
      <div className="h-full w-full overflow-y-auto bg-white">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Truck */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">Truck</Label>
              <Input
                value={formData.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                className="w-2/3"
                placeholder="Enter truck number"
              />
            </div>

            {/* Driver */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">Driver</Label>
              <Input
                value={formData.driver}
                onChange={(e) => handleInputChange("driver", e.target.value)}
                className="w-2/3"
                placeholder="Enter driver name"
              />
            </div>

            {/* Company */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">Company</Label>
              <Input
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="w-2/3"
                placeholder="Enter company name"
              />
            </div>

            {/* Home Location */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">Home Location</Label>
              <Input
                value={formData.home_location}
                onChange={(e) => handleInputChange("home_location", e.target.value)}
                className="w-2/3"
                placeholder="Enter home location"
              />
            </div>

            {/* License Plate */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">License Plate</Label>
              <Input
                value={formData.license_plate}
                onChange={(e) => handleInputChange("license_plate", e.target.value)}
                className="w-2/3"
                placeholder="Enter license plate"
              />
            </div>

            {/* Samsara VIN */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">Samsara VIN</Label>
              <Input
                value={formData.samsara_vin}
                onChange={(e) => handleInputChange("samsara_vin", e.target.value)}
                className="w-2/3"
                placeholder="Enter Samsara VIN"
              />
            </div>

            {/* GLE VIN */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">GLE VIN</Label>
              <Input
                value={formData.gle_vin}
                onChange={(e) => handleInputChange("gle_vin", e.target.value)}
                className="w-2/3"
                placeholder="Enter GLE VIN"
              />
            </div>

            {/* Dispatcher */}
            <div className="flex items-center border-b border-dotted border-gray-300 pb-3">
              <Label className="w-1/3 text-sm font-medium text-gray-700">Dispatcher</Label>
              <Select value={formData.dispatcher} onValueChange={(value) => handleInputChange("dispatcher", value)}>
                <SelectTrigger className="w-2/3">
                  <SelectValue placeholder="Select dispatcher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mason walker">Mason walker</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 px-6 hover:bg-blue-700">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TruckEditForm
