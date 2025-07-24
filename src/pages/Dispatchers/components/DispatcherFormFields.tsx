import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import Select from "react-select"
import { useTeamsInfiniteQuery } from "@/hooks/teams"
import type { ITeamResponse } from "@/types"

interface DispatcherFormFieldsProps {
  form: any // TanStack form instance
}

interface TeamOption {
  value: string
  label: string
  data: ITeamResponse
}

const DispatcherFormFields = ({ form }: DispatcherFormFieldsProps) => {
  const [teamSearchKeyword, setTeamSearchKeyword] = useState("")
  
  // Fetch teams with search
  const { data: teamsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useTeamsInfiniteQuery({
    keyword: teamSearchKeyword,
    active: true,
    size: 20
  })

  // Convert teams data to react-select options
  const teamOptions: TeamOption[] = useMemo(() => {
    if (!teamsData?.pages) return []
    
    return teamsData.pages
      .flatMap(page => page.content)
      .map(team => ({
        value: team.id.toString(),
        label: team.name,
        data: team
      }))
  }, [teamsData])

  // Custom styles for react-select to match shadcn/ui design
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '40px',
      border: state.isFocused ? '2px solid hsl(var(--ring))' : '1px solid hsl(var(--border))',
      borderRadius: '6px',
      backgroundColor: 'hsl(var(--background))',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
      '&:hover': {
        border: '1px solid hsl(var(--border))'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--accent))' 
        : state.isFocused 
        ? 'hsl(var(--accent))' 
        : 'transparent',
      color: 'hsl(var(--foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--accent))'
      }
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))'
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))'
    })
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
                className={`w-full ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  {field.state.meta.errors[0]}
                </div>
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
                className={`w-full ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Team (React Select with search and infinite scroll) */}
      <div className="space-y-2">
        <Label htmlFor="teamId">Team</Label>
        <form.Field
          name="teamId"
          children={(field: any) => (
            <div>
              <Select
                options={teamOptions}
                value={teamOptions.find(option => option.value === field.state.value) || null}
                onChange={(selectedOption) => {
                  field.handleChange(selectedOption?.value || "")
                }}
                onInputChange={(inputValue) => {
                  setTeamSearchKeyword(inputValue)
                }}
                onMenuScrollToBottom={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                  }
                }}
                placeholder="Search and select team..."
                isClearable
                isSearchable
                styles={selectStyles}
                className={`w-full ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                noOptionsMessage={({ inputValue }) => 
                  inputValue ? `No teams found for "${inputValue}"` : "No teams available"
                }
                loadingMessage={() => "Loading teams..."}
                isLoading={isFetchingNextPage}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default DispatcherFormFields
