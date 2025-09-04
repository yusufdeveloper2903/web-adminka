"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// We keep value composition timezone-agnostic to avoid TZ shifts.
import dayjs from "dayjs"
import { DEFAULT_START_TIME, UI_DATETIME_FORMAT } from "@/constants/time-formats"

export interface DateTimePickerProps {
  value?: string // expected format: YYYY-MM-DDTHH:mm (local/CT string without timezone)
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  className,
  disabled
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse incoming value into date, hour and minute WITHOUT timezone interpretation
  const initial = React.useMemo(() => {
    if (!value) {
      const [dh, dm] = DEFAULT_START_TIME.split(":")
      return { date: undefined as Date | undefined, hour: dh ?? "09", minute: dm ?? "00" }
    }
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    if (!m) {
      const [dh, dm] = DEFAULT_START_TIME.split(":")
      return { date: undefined as Date | undefined, hour: dh ?? "09", minute: dm ?? "00" }
    }
    const [, y, mo, d, hh, mm] = m
    const dateOnly = new Date(Number(y), Number(mo) - 1, Number(d))
    return { date: dateOnly, hour: hh, minute: mm }
  }, [value])

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(initial.date)
  const [hour, setHour] = React.useState<string>(initial.hour)
  const [minute, setMinute] = React.useState<string>(initial.minute)

  React.useEffect(() => {
    // Keep internal state in sync if external value changes
    setSelectedDate(initial.date)
    setHour(initial.hour)
    setMinute(initial.minute)
  }, [initial])

  const pad = (n: number) => String(n).padStart(2, "0")
  const emitChange = React.useCallback(
    (nextDate: Date | undefined, nextHour: string, nextMinute: string) => {
      if (!onChange) return
      if (!nextDate) {
        onChange("")
        return
      }
      const y = nextDate.getFullYear()
      const m = pad(nextDate.getMonth() + 1)
      const d = pad(nextDate.getDate())
      onChange(`${y}-${m}-${d}T${nextHour}:${nextMinute}`)
    },
    [onChange]
  )

  const displayText = React.useMemo(() => {
    if (!selectedDate) return placeholder
    const y = selectedDate.getFullYear()
    const m = pad(selectedDate.getMonth() + 1)
    const d = pad(selectedDate.getDate())
    // Use dayjs only for nicer UI formatting, not for value composition
    return dayjs(`${y}-${m}-${d}T${hour}:${minute}`).format(UI_DATETIME_FORMAT)
  }, [selectedDate, hour, minute, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={"w-full justify-between font-normal " + (className ? className : "")}
          disabled={disabled}
        >
          {displayText}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={(d) => {
              setSelectedDate(d)
              emitChange(d, hour, minute)
            }}
          />
          {/* Native time input at the bottom of the calendar */}
          <div className="flex items-center gap-3 border-t p-3">
            <span className="text-muted-foreground text-sm">Time</span>
            <Input
              type="time"
              lang="en-GB" /* Hint browsers to use 24-hour format */
              step={60} /* minutes granularity, no seconds */
              value={`${hour}:${minute}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":")
                const hh = (h ?? "00").padStart(2, "0")
                const mm = (m ?? "00").padStart(2, "0")
                setHour(hh)
                setMinute(mm)
                emitChange(selectedDate, hh, mm)
              }}
              className="w-28"
              disabled={!selectedDate || disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
