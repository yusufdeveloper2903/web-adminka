import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AutosuggestInput } from "@/components/shared"
import { Check } from "lucide-react"
import type { LoadStatus, StopType, HereAutosuggestResult } from "@/types"

interface NewStopFormData {
  city: string
  stopType: StopType
  loadStatus: LoadStatus
  selectedLocation?: HereAutosuggestResult
}

interface AddStopFormProps {
  newStopForm: NewStopFormData
  setNewStopForm: React.Dispatch<React.SetStateAction<NewStopFormData>>
  onLocationSelect: (location: HereAutosuggestResult) => void
  onAddStop: () => void
}

const AddStopForm = ({ newStopForm, setNewStopForm, onLocationSelect, onAddStop }: AddStopFormProps) => {
  return (
    <div className="space-y-2">
      <Label>City</Label>
      <div className="flex items-center gap-4">
        <AutosuggestInput
          value={newStopForm.city}
          onChange={(value) => setNewStopForm((prev) => ({ ...prev, city: value }))}
          onLocationSelect={onLocationSelect}
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
          onClick={onAddStop}
          disabled={!newStopForm.selectedLocation}
          size="icon"
          className="bg-teal-500 hover:bg-teal-600"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default AddStopForm
