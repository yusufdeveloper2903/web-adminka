import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { useMemo, useState } from "react"
import { useTeamsInfiniteQuery } from "@/hooks/teams"
import type { ITeamResponse } from "@/types"

interface DispatcherFormFieldsProps {
  form: any // TanStack form instance
}

interface TeamOption extends SearchableSelectOption {
  data: ITeamResponse
}

const DispatcherFormFields = ({ form }: DispatcherFormFieldsProps) => {
  const [teamSearchKeyword, setTeamSearchKeyword] = useState("")

  // Fetch teams with search
  const {
    data: teamsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTeamsInfiniteQuery({
    keyword: teamSearchKeyword,
    active: true,
    size: 20
  })

  // Convert teams data to SearchableSelect options
  const teamOptions: TeamOption[] = useMemo(() => {
    if (!teamsData?.pages) return []

    return teamsData.pages
      .flatMap((page) => page.content)
      .map((team) => ({
        value: team.id.toString(),
        label: team.name,
        data: team
      }))
  }, [teamsData])

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
    <div className="space-y-4">
      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <form.Field
          name="firstName"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter First Name"
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

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <form.Field
          name="lastName"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter Last Name"
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

      {/* Team (SearchableSelect with search and infinite scroll) */}
      <div className="space-y-2">
        <Label htmlFor="teamId">Team</Label>
        <form.Field
          name="teamId"
          children={(field: any) => (
            <div>
              <SearchableSelect
                options={teamOptions}
                value={teamOptions.find((option) => option.value === field.state.value) || null}
                onChange={(selectedOption: any) => {
                  field.handleChange(selectedOption?.value || "")
                }}
                onDebouncedInputChange={(debouncedValue: string) => {
                  setTeamSearchKeyword(debouncedValue)
                }}
                onMenuScrollToBottom={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                  }
                }}
                placeholder="Search and select team..."
                isClearable
                isSearchable
                error={field.state.meta.errors.length > 0}
                className="w-full"
                noOptionsMessage={({ inputValue }: { inputValue: string }) =>
                  inputValue ? `No teams found for "${inputValue}"` : "No teams available"
                }
                loadingMessage={() => "Loading teams..."}
                isLoading={isFetchingNextPage}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default DispatcherFormFields
