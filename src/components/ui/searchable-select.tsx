import Select, {
  components,
  type ActionMeta,
  type MultiValue,
  type Props as ReactSelectProps,
  type SingleValue
} from "react-select"
import { ChevronDownIcon, XIcon, Loader2 } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export interface SearchableSelectOption {
  value: string
  label: string
  data?: any
}

interface SearchableSelectProps
  extends Omit<ReactSelectProps<SearchableSelectOption>, "styles" | "components" | "onChange"> {
  className?: string
  error?: boolean
  onDebouncedInputChange?: (value: string) => void
  debounceMs?: number
  onFetchNextPage?: () => void
  onChange?: (value: SingleValue<SearchableSelectOption>) => void
  hasNextPage?: boolean
  fullWidth?: boolean
}

// Custom components to match shadcn/ui design
const DropdownIndicator = (props: any) => {
  const { isLoading } = props.selectProps

  return (
    <components.DropdownIndicator {...props}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin opacity-50" />
      ) : (
        <ChevronDownIcon className="h-4 w-4 opacity-50 transition-transform duration-200" />
      )}
    </components.DropdownIndicator>
  )
}

const ClearIndicator = (props: any) => {
  return (
    <components.ClearIndicator {...props}>
      <XIcon className="h-4 w-4 opacity-50" />
    </components.ClearIndicator>
  )
}

// Custom LoadingIndicator to override react-select's default
const LoadingIndicator = () => null // Completely hide loading indicator

// Custom Option component with smooth animations
const Option = (props: any) => {
  const { index } = props

  return (
    <div
      style={
        {
          "--option-index": index,
          animationDelay: `${(index % 5) * 0.05}s` // Stagger last 5 options
        } as React.CSSProperties
      }
    >
      <components.Option {...props} />
    </div>
  )
}

// Custom SingleValue component with ellipsis
const SingleValue = (props: any) => {
  return (
    <components.SingleValue
      {...props}
      className="max-w-full truncate"
      title={props.children} // Show full text on hover
    />
  )
}

// Custom Placeholder component with ellipsis
const Placeholder = (props: any) => {
  return <components.Placeholder {...props} className="text-muted-foreground max-w-full truncate" />
}

// Simple loading skeleton for initial load
const LoadingSkeleton = () => (
  <div className="animate-in fade-in-0 space-y-2 px-2 py-1.5 duration-300">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <div className="bg-muted h-4 w-4 animate-pulse rounded" />
        <div className="bg-muted h-4 flex-1 animate-pulse rounded" />
      </div>
    ))}
  </div>
)

// Custom MenuList component with smooth infinity scroll
const MenuList = (props: any) => {
  const { hasNextPage, isLoading, options } = props.selectProps
  const [showLoadingState, setShowLoadingState] = useState(false)
  const [previousOptionsLength, setPreviousOptionsLength] = useState(0)

  // Track options length changes for smooth transitions
  useEffect(() => {
    if (options?.length > previousOptionsLength) {
      // New options added - trigger smooth animation
      setPreviousOptionsLength(options.length)
    }
  }, [options?.length, previousOptionsLength])

  // Smooth loading state management
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoadingState(true), 150) // Delay to prevent flickering
      return () => clearTimeout(timer)
    } else {
      setShowLoadingState(false)
    }
  }, [isLoading])

  return (
    <div className="transition-all duration-300 ease-out">
      <components.MenuList {...props}>
        {props.children}

        {/* Infinity scroll indicator */}
        {hasNextPage && (
          <div className="border-border/50 border-t transition-all duration-300 ease-out">
            {showLoadingState ? (
              <div className="animate-in slide-in-from-bottom-2 px-3 py-3 duration-300">
                <div className="text-muted-foreground flex items-center justify-center text-xs">
                  <span className="animate-in fade-in-0 duration-500">Loading more...</span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground/70 hover:text-muted-foreground animate-in fade-in-0 px-3 py-2 text-center text-xs transition-colors duration-200">
                <div className="flex items-center justify-center space-x-1">
                  <span>Scroll for more</span>
                  <div className="bg-muted-foreground/50 h-1 w-1 animate-pulse rounded-full" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton for initial load */}
        {isLoading && !hasNextPage && options?.length === 0 && <LoadingSkeleton />}
      </components.MenuList>
    </div>
  )
}

const SearchableSelect = ({
  className,
  error,
  onDebouncedInputChange,
  onInputChange,
  debounceMs,
  onFetchNextPage,
  onChange,
  hasNextPage,
  fullWidth,
  ...props
}: SearchableSelectProps) => {
  const [inputValue, setInputValue] = useState("")

  // Ensure debounceMs has a default value
  const actualDebounceMs = debounceMs ?? 300
  const [debouncedValue] = useDebounceValue(inputValue, actualDebounceMs)

  // Call the debounced callback when debounced value changes
  useEffect(() => {
    if (onDebouncedInputChange) {
      onDebouncedInputChange(debouncedValue)
    }
  }, [debouncedValue, onDebouncedInputChange])

  const handleInputChange = (newValue: string, actionMeta: any) => {
    setInputValue(newValue)
    // Also call the original onInputChange if provided
    if (onInputChange) {
      onInputChange(newValue, actionMeta)
    }
  }

  const handleChange = (
    newValue: SingleValue<SearchableSelectOption> | MultiValue<SearchableSelectOption>,
    actionMeta: ActionMeta<SearchableSelectOption>
  ) => {
    if (onChange) {
      onChange(newValue as SingleValue<SearchableSelectOption>)
    }
  }

  const handleMenuScrollToBottom = () => {
    if (hasNextPage && onFetchNextPage) {
      onFetchNextPage()
    }
  }

  return (
    <Select
      unstyled
      components={{
        DropdownIndicator,
        ClearIndicator,
        MenuList,
        LoadingIndicator,
        Option,
        SingleValue,
        Placeholder
      }}
      classNames={{
        control: ({ isFocused }) =>
          cn(
            "flex w-full min-w-0 rounded-md border dark:bg-input/30 px-3 py-1 text-sm shadow-xs transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive focus-visible:ring-destructive"
              : isFocused
                ? "border-ring ring-1 ring-ring"
                : "border-input",
            className
          ),
        container: () => `min-w-[160px] ${fullWidth ? "auto" : "max-w-[200px]"}`, // Fixed min/max width
        placeholder: () => "text-muted-foreground text-sm truncate",
        input: () => "text-foreground text-sm flex-1 min-w-0",
        valueContainer: () => "flex items-center py-1 flex-1 min-w-0 overflow-hidden",
        singleValue: () => "text-foreground text-sm truncate max-w-full",
        multiValue: () => "bg-secondary text-secondary-foreground rounded px-1 py-0.5 text-xs",
        multiValueLabel: () => "text-secondary-foreground",
        multiValueRemove: () => "text-secondary-foreground hover:text-destructive",
        indicatorsContainer: () => "flex items-center flex-shrink-0", // Prevent shrinking
        clearIndicator: () =>
          "text-muted-foreground hover:text-foreground cursor-pointer p-1 w-6 h-6 flex items-center justify-center",
        dropdownIndicator: () =>
          "text-muted-foreground hover:text-foreground cursor-pointer p-1 w-6 h-6 flex items-center justify-center",
        menu: () =>
          cn(
            "relative min-w-[8rem] mt-0.5 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
            "backdrop-blur-sm !z-[999]"
          ),
        menuList: () =>
          "p-1 max-h-[300px] overflow-y-auto overscroll-contain scroll-smooth transition-all duration-300 ease-out",
        option: ({ isFocused, isSelected }) =>
          cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
            "transition-all duration-150 ease-in-out",
            "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            isFocused && "bg-accent text-accent-foreground transform scale-[0.99]",
            isSelected && "bg-accent text-accent-foreground font-medium"
          ),
        noOptionsMessage: () => "text-muted-foreground text-sm p-2 text-center"
      }}
      className={cn("react-select-container", className)}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      onInputChange={handleInputChange}
      onChange={handleChange}
      menuShouldScrollIntoView={false}
      loadingMessage={() => null} // Disable default loading message
      noOptionsMessage={({ inputValue }) => (inputValue ? `No results for "${inputValue}"` : "No options")}
      isLoading={false} // Force disable react-select's internal loading state
      {...props}
    />
  )
}

SearchableSelect.displayName = "SearchableSelect"

export { SearchableSelect }
