"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  UI_DATE_FORMAT,
  UI_DATETIME_FORMAT,
  INPUT_DATETIME_LOCAL_FORMAT,
  DEFAULT_START_TIME,
  MIN_DATE
} from "@/constants"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  displayFormat?: string
  allowFuture?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  displayFormat = UI_DATE_FORMAT,
  allowFuture = false,
  minDate,
  maxDate
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? dayjs(value).format(displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          disabled={(date) => {
            // Check future date restriction
            if (!allowFuture && date > new Date()) return true
            
            // Check minimum date
            if (date < new Date(MIN_DATE)) return true
            
            // Check custom minDate
            if (minDate && date < minDate) return true
            
            // Check custom maxDate
            if (maxDate && date > maxDate) return true
            
            return false
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [timeValue, setTimeValue] = React.useState(value ? dayjs(value).format("HH:mm") : DEFAULT_START_TIME)

  // Update internal state when value prop changes (for edit mode)
  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setTimeValue(dayjs(date).format("HH:mm"))
    } else {
      setSelectedDate(undefined)
      setTimeValue(DEFAULT_START_TIME)
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const [hours, minutes] = timeValue.split(":")
      const newDateTime = new Date(date)
      newDateTime.setHours(parseInt(hours), parseInt(minutes))

      // Format to datetime-local string
      const formattedDateTime = dayjs(newDateTime).format(INPUT_DATETIME_LOCAL_FORMAT)
      onChange(formattedDateTime)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (selectedDate) {
      const [hours, minutes] = time.split(":")
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(parseInt(hours), parseInt(minutes))

      const formattedDateTime = dayjs(newDateTime).format(INPUT_DATETIME_LOCAL_FORMAT)
      onChange(formattedDateTime)
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
            initialFocus
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
