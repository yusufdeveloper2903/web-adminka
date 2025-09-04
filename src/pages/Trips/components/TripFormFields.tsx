import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { useMemo, useState, useEffect } from "react"
import { utcToCentralString, centralStringToUTC } from "@/lib"
import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useDispatchersInfiniteQuery } from "@/hooks/dispatchers"
import type { ITruckResponse, IDispatcherResponse, ITripStopResponse } from "@/types"
import StopsTable from "./StopsTable"
import AddStopForm from "./AddStopForm"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TRIP_STATUS_OPTIONS } from "@/constants"

interface TripFormFieldsProps {
  form: any // TanStack form instance
  tripFormSchema: any // Zod schema with shape property
  stops: any[]
  onRemoveStop: (index: number) => void
  onStopUpdate: (index: number, field: keyof ITripStopResponse, value: any) => void
  onReorderStops: (stops: ITripStopResponse[]) => void
  newStopForm: any
  setNewStopForm: any
  onLocationSelect: any
  onAddStop: any
  isCalculatingRoute?: boolean
  // Backend data for edit mode
  mileStats?: {
    totalMiles: number
    totalDuration: number
  }
}

interface TruckOption extends SearchableSelectOption {
  data: ITruckResponse
}

interface DispatcherOption extends SearchableSelectOption {
  data: IDispatcherResponse
}

const TripFormFields = ({
  form,
  stops,
  onRemoveStop,
  onStopUpdate,
  onReorderStops,
  newStopForm,
  setNewStopForm,
  onLocationSelect,
  onAddStop,
  isCalculatingRoute = false,
  mileStats
}: TripFormFieldsProps) => {
  const [truckSearchKeyword, setTruckSearchKeyword] = useState("")
  const [dispatcherSearchKeyword, setDispatcherSearchKeyword] = useState("")
  const [showDateTimeSection, setShowDateTimeSection] = useState(false)
  const [currentTripStatus, setCurrentTripStatus] = useState("")

  // Robust trip status tracking with multiple fallbacks
  useEffect(() => {
    // Get initial value from form state with multiple fallbacks
    const getFormValue = () => {
      return (
        form?.state?.values?.tripStatus ||
        form?.getFieldValue?.("tripStatus") ||
        form?.state?.fieldMeta?.tripStatus?.value ||
        ""
      )
    }

    const initialStatus = getFormValue()
    if (initialStatus) {
      setCurrentTripStatus(initialStatus)
      setShowDateTimeSection(initialStatus === "COMPLETED")
    }

    // Subscribe to form changes with robust error handling
    let unsubscribe: (() => void) | undefined

    try {
      if (form?.store?.subscribe) {
        unsubscribe = form.store.subscribe(() => {
          const newStatus = getFormValue()
          if (newStatus && newStatus !== currentTripStatus) {
            setCurrentTripStatus(newStatus)
            setShowDateTimeSection(newStatus === "COMPLETED")
          }
        })
      }
    } catch (error) {
      console.warn("Form subscription failed:", error)
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch (error) {
          console.warn("Form unsubscribe failed:", error)
        }
      }
    }
  }, [form, currentTripStatus])

  // Additional safety check - watch form state directly
  useEffect(() => {
    const formStatus = form?.state?.values?.tripStatus
    if (formStatus && formStatus !== currentTripStatus) {
      setCurrentTripStatus(formStatus)
      setShowDateTimeSection(formStatus === "COMPLETED")
    }
  }, [form?.state?.values?.tripStatus, currentTripStatus])

  // Initialize on mount with delay to ensure form is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      const formStatus = form?.state?.values?.tripStatus
      if (formStatus && !currentTripStatus) {
        setCurrentTripStatus(formStatus)
        setShowDateTimeSection(formStatus === "COMPLETED")

        // Force set field value if it's COMPLETED and not set
        if (formStatus === "COMPLETED" && form?.setFieldValue) {
          form.setFieldValue("tripStatus", "COMPLETED")
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [form, currentTripStatus])

  // Additional effect specifically for COMPLETED status
  useEffect(() => {
    if (currentTripStatus === "COMPLETED" && form?.setFieldValue) {
      const timer = setTimeout(() => {
        // Double-check and force set COMPLETED value
        const currentFieldValue = form?.state?.values?.tripStatus
        if (currentFieldValue !== "COMPLETED") {
          form.setFieldValue("tripStatus", "COMPLETED")
        }
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [currentTripStatus, form])

  // Prevent Select component reset by monitoring field state
  useEffect(() => {
    const fieldValue = form?.state?.values?.tripStatus
    if (fieldValue && fieldValue !== currentTripStatus) {
      setCurrentTripStatus(fieldValue)
      setShowDateTimeSection(fieldValue === "COMPLETED")
    }
  }, [form?.state?.values?.tripStatus, currentTripStatus])

  // Also listen to form state changes directly
  useEffect(() => {
    const unsubscribe = form?.store?.subscribe(() => {
      const newStatus = form?.state?.values?.tripStatus || ""
      const shouldShow = newStatus === "COMPLETED"
      setShowDateTimeSection(shouldShow)
    })

    return unsubscribe
  }, [form])

  useEffect(() => {
    const shouldShow = currentTripStatus === "COMPLETED"
    setShowDateTimeSection(shouldShow)
  }, [currentTripStatus])

  // Fetch trucks with search
  const {
    data: trucksData,
    fetchNextPage: fetchNextTrucksPage,
    hasNextPage: hasNextTrucksPage,
    isFetchingNextPage: isFetchingNextTrucksPage
  } = useTrucksInfiniteQuery({
    keyword: truckSearchKeyword,
    active: true
  })

  // Fetch dispatchers with search
  const {
    data: dispatchersData,
    fetchNextPage: fetchNextDispatchersPage,
    hasNextPage: hasNextDispatchersPage,
    isFetchingNextPage: isFetchingNextDispatchersPage
  } = useDispatchersInfiniteQuery({
    keyword: dispatcherSearchKeyword,
    active: true
  })

  // Convert trucks data to SearchableSelect options
  const truckOptions: TruckOption[] = useMemo(() => {
    if (!trucksData?.pages) return []

    return trucksData.pages
      .flatMap((page) => page.content)
      .map((truck) => ({
        value: truck.id.toString(),
        label: truck.unitNumber,
        data: truck
      }))
  }, [trucksData])

  // Convert dispatchers data to SearchableSelect options
  const dispatcherOptions: DispatcherOption[] = useMemo(() => {
    if (!dispatchersData?.pages) return []

    return dispatchersData.pages
      .flatMap((page) => page.content)
      .map((dispatcher) => ({
        value: dispatcher.id.toString(),
        label: `${dispatcher.firstName} ${dispatcher.lastName}`,
        data: dispatcher
      }))
  }, [dispatchersData])

  // Helper function to get error message from field
  const getErrorMessage = (field: any): string => {
    if (field.state.meta.errors.length === 0) return ""

    const error = field.state.meta.errors[0]
    // Handle Zod validation error objects
    if (typeof error === "object" && error.message) {
      return error.message
    }
    // Handle string errors
    if (typeof error === "string") {
      return error
    }
    return "Invalid value"
  }

  return (
    <>
      {/* Section 1: Truck, Load Number, Dispatcher */}
      <div className="rounded-lg border p-4">
        {/* First row - Truck and Load Number (50% each) */}
        <section className="mb-4 flex justify-between gap-4">
          <div className="w-1/2 space-y-2">
            <Label htmlFor="truckId">Truck</Label>
            <form.Field
              name="truckId"
              children={(field: any) => (
                <div>
                  <SearchableSelect
                    fullWidth
                    options={truckOptions}
                    value={truckOptions.find((option) => option.value === field.state.value) || null}
                    onChange={(selectedOption: any) => {
                      field.handleChange(selectedOption?.value || "")
                    }}
                    onDebouncedInputChange={(debouncedValue: string) => {
                      setTruckSearchKeyword(debouncedValue)
                    }}
                    onMenuScrollToBottom={() => {
                      if (hasNextTrucksPage && !isFetchingNextTrucksPage) {
                        fetchNextTrucksPage()
                      }
                    }}
                    placeholder="Search and select truck..."
                    isClearable
                    isSearchable
                    error={field.state.meta.errors.length > 0}
                    className="w-full"
                    debounceMs={300}
                    noOptionsMessage={({ inputValue }: { inputValue: string }) =>
                      inputValue ? `No trucks found for "${inputValue}"` : "No trucks available"
                    }
                    loadingMessage={() => "Loading trucks..."}
                    isLoading={isFetchingNextTrucksPage}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                  )}
                </div>
              )}
            />
          </div>

          <div className="w-1/2 space-y-2">
            <Label htmlFor="loadNumber">Load Number</Label>
            <form.Field
              name="loadNumber"
              children={(field: any) => (
                <div>
                  <Input
                    placeholder="Enter Load Number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                  )}
                </div>
              )}
            />
          </div>
        </section>

        {/* Second row - Dispatcher and Trip Status (50% each) */}
        <section className="flex justify-between gap-4">
          <div className="w-1/2 space-y-2 pr-2">
            <Label htmlFor="dispatcherId">Dispatcher</Label>
            <form.Field
              name="dispatcherId"
              children={(field: any) => (
                <div>
                  <SearchableSelect
                    fullWidth
                    options={dispatcherOptions}
                    value={dispatcherOptions.find((option) => option.value === field.state.value) || null}
                    onChange={(selectedOption: any) => {
                      field.handleChange(selectedOption?.value || "")
                    }}
                    onDebouncedInputChange={(debouncedValue: string) => {
                      setDispatcherSearchKeyword(debouncedValue)
                    }}
                    onMenuScrollToBottom={() => {
                      if (hasNextDispatchersPage && !isFetchingNextDispatchersPage) {
                        fetchNextDispatchersPage()
                      }
                    }}
                    placeholder="Search and select dispatcher..."
                    isClearable
                    isSearchable
                    error={field.state.meta.errors.length > 0}
                    className="w-full"
                    debounceMs={300}
                    noOptionsMessage={({ inputValue }: { inputValue: string }) =>
                      inputValue ? `No dispatchers found for "${inputValue}"` : "No dispatchers available"
                    }
                    loadingMessage={() => "Loading dispatchers..."}
                    isLoading={isFetchingNextDispatchersPage}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                  )}
                </div>
              )}
            />
          </div>
        </section>
      </div>

      {/* Section 2: Add Stop (bordersiz, "City" label bilan) */}
      <AddStopForm
        newStopForm={newStopForm}
        setNewStopForm={setNewStopForm}
        onLocationSelect={onLocationSelect}
        onAddStop={onAddStop}
        stopsCount={stops.length}
      />

      {/* Section 3: Stops Table - faqat stops mavjud bo'lsa ko'rsatish */}
      {stops && stops.length > 0 && (
        <div className="rounded-lg border p-4">
          <StopsTable
            stops={stops}
            onRemoveStop={onRemoveStop}
            onStopUpdate={onStopUpdate}
            onReorderStops={onReorderStops}
            isCalculatingRoute={isCalculatingRoute}
            backendTotals={
              mileStats
                ? {
                    miles: mileStats.totalMiles,
                    duration: mileStats.totalDuration
                  }
                : undefined
            }
          />
        </div>
      )}

      <div className="w-1/2 space-y-2">
        <Label htmlFor="tripStatus">Trip Status</Label>
        <form.Field
          name="tripStatus"
          children={(field: any) => {
            // Robust value handling with multiple fallbacks
            const selectValue = field.state.value || field.state.meta?.initialValue || currentTripStatus || ""

            // Debug logging for COMPLETED status

            return (
              <div>
                <Select
                  key={`tripStatus-${selectValue || "empty"}`} // Force re-mount on value change
                  value={selectValue || undefined} // Ensure undefined instead of empty string
                  onValueChange={(value) => {
                    // Prevent empty value changes that reset the select
                    if (!value || value === "") {
                      return
                    }

                    // Prevent unnecessary changes to same value
                    if (value === selectValue) {
                      return
                    }

                    // Update form field
                    field.handleChange(value)

                    // Update local state immediately
                    setCurrentTripStatus(value)
                    setShowDateTimeSection(value === "COMPLETED")

                    // Force form validation if needed
                    if (field.handleBlur) {
                      field.handleBlur()
                    }
                  }}
                >
                  <SelectTrigger
                    className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""} ${selectValue ? TRIP_STATUS_OPTIONS.find((opt) => opt.value === selectValue)?.className : ""}`}
                  >
                    <SelectValue placeholder="Select trip status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIP_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.className}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                )}
              </div>
            )
          }}
        />
      </div>

      {/* Section 4: Date/Time and Odometer - Conditional with Smooth Animation */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showDateTimeSection
            ? "max-h-96 translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-4 opacity-0"
        }`}
      >
        <div className="rounded-lg border p-4">
          {/* Date/time inputs */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDateTime">Start DateTime (CT)</Label>
              <form.Field
                name="startDateTime"
                children={(field: any) => (
                  <div>
                    <DateTimePicker
                      value={field.state.value ? utcToCentralString(field.state.value) : ""}
                      onChange={(value: string) => {
                        field.handleChange(value ? centralStringToUTC(value) : "")
                      }}
                      placeholder="Select start date and time (CT)"
                      className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDateTime">Delivery DateTime (CT)</Label>
              <form.Field
                name="endDateTime"
                children={(field: any) => (
                  <div>
                    <DateTimePicker
                      value={field.state.value ? utcToCentralString(field.state.value) : ""}
                      onChange={(value: string) => {
                        field.handleChange(value ? centralStringToUTC(value) : "")
                      }}
                      placeholder="Select end date and time (CT)"
                      className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Odometer inputs (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startOdometer">Start Odometer</Label>
              <form.Field
                name="startOdometer"
                children={(field: any) => (
                  <div>
                    <Input
                      placeholder="Start Odometer"
                      type="number"
                      step="0.1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endOdometer">Delivery Odometer</Label>
              <form.Field
                name="endOdometer"
                children={(field: any) => (
                  <div>
                    <Input
                      placeholder="End Odometer"
                      type="number"
                      step="0.1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TripFormFields
