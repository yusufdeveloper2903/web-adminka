"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// We keep value composition timezone-agnostic to avoid TZ shifts.
import dayjs from "dayjs"
import { DEFAULT_START_TIME, UI_DATETIME_FORMAT } from "@/constants/time-formats"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  // Snap helper to 5-minute steps (00,05,...,55)
  const snapMinute5 = React.useCallback((mm: string) => {
    const n = Number(mm)
    if (Number.isNaN(n) || n < 0) return "00"
    const snapped = Math.floor(n / 5) * 5
    return String(snapped).padStart(2, "0")
  }, [])

  React.useEffect(() => {
    // Keep internal state in sync if external value changes
    setSelectedDate(initial.date)
    // hour doim 2 xonali, minute 5 ga snap
    const hh = String(Number(initial.hour)).padStart(2, "0")
    const mm = snapMinute5(initial.minute)
    setHour(hh)
    setMinute(mm)
  }, [initial, snapMinute5])

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
          {/* Stable custom 24h selectable controls at the bottom of the calendar */}
          <div className="flex items-center gap-3 border-t p-3">
            <span className="text-muted-foreground text-sm">Time</span>
            <div className="flex items-center gap-2">
              <HourSelect
                value={hour}
                onChange={(hh) => {
                  setHour(hh)
                  emitChange(selectedDate, hh, minute)
                }}
                disabled={!selectedDate || disabled}
              />
              <span className="text-muted-foreground">:</span>
              <MinuteSelect
                value={minute}
                onChange={(mm) => {
                  setMinute(mm)
                  emitChange(selectedDate, hour, mm)
                  // Tanlangandan keyin yopish
                  setOpen(false)
                }}
                disabled={!selectedDate || disabled}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Hour select (00-23)
function HourSelect({
  value,
  onChange,
  disabled
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), [])
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="HH" />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {hours.map((h) => (
          <SelectItem key={h} value={h}>
            {h}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Minute select (5-min increment)
function MinuteSelect({
  value,
  onChange,
  disabled
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const minutes = React.useMemo(() => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")), [])
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="mm" />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {minutes.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
