import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useHereAutosuggest } from "@/hooks/useHereAutosuggest"
import { cn } from "@/lib/utils"
import { MapPin, Loader2, X } from "lucide-react"
import type { HereAutosuggestResult } from "@/types"

interface AutosuggestInputProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect: (location: HereAutosuggestResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const AutosuggestInput = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Enter city or address...",
  className,
  disabled = false
}: AutosuggestInputProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { results, isLoading, error, search, clearResults } = useHereAutosuggest({
    debounceMs: 500,
    minQueryLength: 2,
    limit: 5
  })

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    search(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  // Handle location selection
  const handleLocationSelect = (location: HereAutosuggestResult) => {
    onChange(location.address.label)
    onLocationSelect(location)
    setIsOpen(false)
    clearResults()
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleLocationSelect(results[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Clear input
  const handleClear = () => {
    onChange("")
    clearResults()
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const showDropdown = isOpen && (results.length > 0 || isLoading || error)

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className={cn("pr-20", className)}
          disabled={disabled}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-1/2 right-10 -translate-y-1/2">
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          </div>
        )}

        {/* Clear button */}
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border shadow-md"
        >
          {error && <div className="text-destructive p-3 text-sm">{error}</div>}

          {isLoading && !error && (
            <div className="text-muted-foreground flex items-center gap-2 p-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching locations...
            </div>
          )}

          {results.length > 0 && !error && (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  type="button"
                  className={cn(
                    "hover:bg-accent flex w-full items-start gap-3 px-3 py-2 text-left text-sm",
                    selectedIndex === index && "bg-accent"
                  )}
                  onClick={() => handleLocationSelect(result)}
                >
                  <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{result.title}</div>
                    <div className="text-muted-foreground truncate">{result.address.label}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AutosuggestInput
