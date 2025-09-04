import * as React from "react"
import { CalendarIcon } from "lucide-react"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { UI_DATETIME_FORMAT, MIN_DATE } from "@/constants"

interface DateTimePickerProps {
  value?: string // datetime-local format
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  className
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse value safely - NO internal state
  const currentDateTime = value ? dayjs(value) : null
  const selectedDate = currentDateTime?.toDate()
  // Fix: Use actual time from value, not DEFAULT_START_TIME
  const timeValue = value ? dayjs(value).format("HH:mm") : "09:00"

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log("Selected date from calendar:", date)
      console.log("Current time value:", timeValue)

      // Use UTC methods to avoid timezone issues with react-day-picker
      const year = date.getUTCFullYear()
      const month = date.getUTCMonth() + 1 // getUTCMonth() returns 0-11
      const day = date.getUTCDate()

      console.log("UTC date parts:", { year, month, day })

      // Use current time or default
      const [hours, minutes] = timeValue.split(":")

      // Create datetime string manually to avoid timezone conversion
      const dateTimeString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours}:${minutes}`

      console.log("Manual datetime string:", dateTimeString)

      onChange(dateTimeString)
    }
  }

  const handleTimeChange = (time: string) => {
    if (selectedDate) {
      // Extract date parts manually to avoid timezone issues
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth() + 1
      const day = selectedDate.getDate()

      const [hours, minutes] = time.split(":")

      // Create datetime string manually
      const dateTimeString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours}:${minutes}`

      onChange(dateTimeString)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? dayjs(value).format(UI_DATETIME_FORMAT) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-3 p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date(MIN_DATE)}
            defaultMonth={selectedDate || new Date()}
          />
          <div className="flex items-center gap-2 border-t pt-2">
            <label htmlFor="time" className="text-sm font-medium">
              Time:
            </label>
            <div className="flex w-full items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={timeValue.split(":")[0]}
                  onChange={(e) => {
                    const minutes = timeValue.split(":")[1] || "00"
                    handleTimeChange(`${e.target.value.padStart(2, "0")}:${minutes}`)
                  }}
                  className="border-input focus-visible:ring-ring h-9 w-full cursor-pointer appearance-none rounded-md border bg-transparent pr-8 pl-3 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="text-muted-foreground h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <span className="text-muted-foreground text-sm font-medium">:</span>
              <div className="relative flex-1">
                <select
                  value={timeValue.split(":")[1] || "00"}
                  onChange={(e) => {
                    const hours = timeValue.split(":")[0] || "00"
                    handleTimeChange(`${hours}:${e.target.value}`)
                  }}
                  className="border-input focus-visible:ring-ring h-9 w-full cursor-pointer appearance-none rounded-md border bg-transparent pr-8 pl-3 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="text-muted-foreground h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
