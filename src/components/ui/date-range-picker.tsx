"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { UI_DATE_FORMAT, MIN_DATE } from "@/constants"
import type { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  value?: {
    from?: Date
    to?: Date
  }
  onChange: (range: { from?: Date; to?: Date }) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  displayFormat?: string
  allowFuture?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
  showApplyButton?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  displayFormat = UI_DATE_FORMAT,
  allowFuture = false,
  minDate,
  maxDate,
  showClearButton = true,
  showApplyButton = true
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  // Internal state for temporary selection
  const [tempRange, setTempRange] = React.useState<{ from?: Date; to?: Date }>({
    from: value?.from,
    to: value?.to
  })

  // Update temp range when value prop changes
  React.useEffect(() => {
    setTempRange({
      from: value?.from,
      to: value?.to
    })
  }, [value?.from, value?.to])

  const formatDateRange = (from?: Date, to?: Date) => {
    if (!from) return placeholder
    if (!to) return `${dayjs(from).format(displayFormat)} - ...`
    return `${dayjs(from).format(displayFormat)} - ${dayjs(to).format(displayFormat)}`
  }

  const handleSelect = (range: DateRange | undefined) => {
    // Only update internal temp state, don't call onChange yet
    if (range) {
      setTempRange({
        from: range.from,
        to: range.to
      })
    } else {
      setTempRange({ from: undefined, to: undefined })
    }
  }

  const handleApply = () => {
    // Call onChange with current temp range (even if it's empty)
    onChange(tempRange)
    setOpen(false)
  }

  const handleClear = () => {
    // Clear temp range but don't close picker or call onChange
    setTempRange({ from: undefined, to: undefined })
  }

  const handleCancel = () => {
    // Reset temp range to original value and close
    setTempRange({
      from: value?.from,
      to: value?.to
    })
    setOpen(false)
  }

  // Handle popover close - reset temp range if closed without applying
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // If closing without applying, reset temp range
      setTempRange({
        from: value?.from,
        to: value?.to
      })
    }
    setOpen(newOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDateRange(value?.from, value?.to)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="date-range-picker">
          <Calendar
            mode="range"
            selected={{
              from: tempRange?.from,
              to: tempRange?.to
            }}
            onSelect={handleSelect}
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
            numberOfMonths={2}
          />
        </div>
        {(showClearButton || showApplyButton) && (
          <div className="flex items-center justify-between border-t p-3">
            <div className="flex gap-2">
              {showClearButton && (
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
            {showApplyButton && (
              <Button size="sm" onClick={handleApply}>
                Apply
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
