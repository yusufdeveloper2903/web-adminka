import * as React from "react"
import { CalendarIcon } from "lucide-react"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { UI_DATE_FORMAT, MIN_DATE } from "@/constants"

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
