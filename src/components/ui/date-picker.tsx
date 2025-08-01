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
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className
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
          {value ? dayjs(value).format(UI_DATE_FORMAT) : <span>{placeholder}</span>}
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
          disabled={(date) => date > new Date() || date < new Date(MIN_DATE)}
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
            <input
              id="time"
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              step="60"
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                colorScheme: "light dark"
              }}
              // Force 24-hour format using locale
              lang="en-GB"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
