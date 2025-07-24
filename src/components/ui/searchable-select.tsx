import * as React from "react"
import Select, { components, type Props as ReactSelectProps } from "react-select"
import { ChevronDownIcon, XIcon } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"
import { cn } from "@/lib/utils"

export interface SearchableSelectOption {
  value: string
  label: string
  data?: any
}

interface SearchableSelectProps extends Omit<ReactSelectProps<SearchableSelectOption>, "styles" | "components"> {
  className?: string
  error?: boolean
  onMenuScrollToBottom?: () => void
  onDebouncedInputChange?: (value: string) => void
  debounceMs?: number
}

// Custom components to match shadcn/ui design
const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon className="h-4 w-4 opacity-50" />
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

const SearchableSelect = React.forwardRef<any, SearchableSelectProps>(
  (
    { className, error, onMenuScrollToBottom, onDebouncedInputChange, debounceMs = 300, onInputChange, ...props },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("")
    const [debouncedValue] = useDebounceValue(inputValue, debounceMs)

    // Call the debounced callback when debounced value changes
    React.useEffect(() => {
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

    return (
      <Select
        ref={ref}
        unstyled
        components={{
          DropdownIndicator,
          ClearIndicator
        }}
        classNames={{
          control: ({ isFocused }) =>
            cn(
              "flex  w-full rounded-md border dark:bg-input/30  px-3 py-1 text-sm shadow-xs transition-colors",
              "file:border-0 file:bg-transparent  file:text-sm file:font-medium",
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
          container: () => " ",
          placeholder: () => "text-muted-foreground text-sm",
          input: () => "text-foreground text-sm",
          valueContainer: () => "flex items-center py-1",
          singleValue: () => "text-foreground text-sm",
          multiValue: () => "bg-secondary text-secondary-foreground rounded px-1 py-0.5 text-xs",
          multiValueLabel: () => "text-secondary-foreground",
          multiValueRemove: () => "text-secondary-foreground hover:text-destructive",
          indicatorsContainer: () => "flex items-center",
          clearIndicator: () => "text-muted-foreground hover:text-foreground cursor-pointer p-1",
          dropdownIndicator: () => "text-muted-foreground hover:text-foreground cursor-pointer p-1",
          menu: () =>
            cn(
              "relative z-50 min-w-[8rem] mt-0.5 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            ),
          menuList: () => "p-1 max-h-[200px] overflow-auto",
          option: ({ isFocused, isSelected }) =>
            cn(
              "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
              "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
              isFocused && "bg-accent text-accent-foreground",
              isSelected && "bg-accent text-accent-foreground"
            ),
          noOptionsMessage: () => "text-muted-foreground text-sm p-2 text-center",
          loadingMessage: () => "text-muted-foreground text-sm p-2 text-center"
        }}
        className={cn("react-select-container", className)}
        onMenuScrollToBottom={onMenuScrollToBottom}
        onInputChange={handleInputChange}
        {...props}
      />
    )
  }
)

SearchableSelect.displayName = "SearchableSelect"

export { SearchableSelect }
