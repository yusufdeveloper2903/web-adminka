import { Button, SearchableSelect } from "@/components/ui"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { useUsersInfiniteQuery } from "@/hooks/users"
import { useDrawerStore } from "@/store/drawer-store"
import type { IDriverResponse, IPaginatedResponse, IUserResponse } from "@/types"
import { useMemo, useState } from "react"
import { useAssignUserToDriversMutation } from "@/hooks/drivers"

const AssignForm = () => {
  const { closeDrawer } = useDrawerStore()

  // Local searches
  const [driverSearch, setDriverSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")

  // Queries
  const {
    data: driversData,
    fetchNextPage: fetchNextDriver,
    hasNextPage: hasNextDriverPage,
    isLoading: isDriversLoading
  } = useDriversInfiniteQuery({ keyword: driverSearch })

  const {
    data: usersData,
    fetchNextPage: fetchNextUser,
    hasNextPage: hasNextUserPage,
    isLoading: isUsersLoading
  } = useUsersInfiniteQuery({ keyword: userSearch })

  // Options
  const driverOptions = useMemo(
    () =>
      driversData?.pages
        .flatMap((page: IPaginatedResponse<IDriverResponse>) => page.content)
        .map((driver: IDriverResponse) => ({
          value: driver.id.toString(),
          label: `${driver.firstName} ${driver.lastName}`
        })) ?? [],
    [driversData]
  )

  const userOptions = useMemo(
    () =>
      usersData?.pages
        .flatMap((page: IPaginatedResponse<IUserResponse>) => page.content)
        .map((user: IUserResponse) => ({
          value: user.id.toString(),
          label: `${user.firstName} ${user.lastName}`
        })) ?? [],
    [usersData]
  )

  // Local selections
  const [selectedDriver, setSelectedDriver] = useState<Array<{ value: string; label: string }>>([])
  const [selectedUser, setSelectedUser] = useState<{ value: string; label: string } | null>(null)

  const assignMutation = useAssignUserToDriversMutation()

  const canSubmit = !!selectedUser && selectedDriver.length > 0

  return (
    <div className="space-y-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!canSubmit || assignMutation.isPending) return
          try {
            const userId = Number((selectedUser as any)?.value)
            const driverIds = selectedDriver.map((d) => Number(d.value))
            await assignMutation.mutateAsync({ userId, driverIds })
            closeDrawer()
          } catch {
            // toast handled globally in mutation-utils
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-3">
          <SearchableSelect
            options={driverOptions}
            placeholder="Driver"
            isLoading={isDriversLoading}
            isMulti={true}
            closeMenuOnSelect={false}
            onDebouncedInputChange={setDriverSearch}
            onFetchNextPage={fetchNextDriver}
            hasNextPage={hasNextDriverPage}
            isClearable
            value={selectedDriver}
            onChange={(opt) => setSelectedDriver(Array.isArray(opt) ? (opt as any) : [])}
            className="!min-h-9 w-full"
            fullWidth
          />
          <SearchableSelect
            options={userOptions}
            placeholder="User"
            isLoading={isUsersLoading}
            onDebouncedInputChange={setUserSearch}
            onFetchNextPage={fetchNextUser}
            hasNextPage={hasNextUserPage}
            isClearable
            value={selectedUser}
            onChange={(opt) => setSelectedUser(opt as any)}
            className="!min-h-9 w-full"
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeDrawer}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit || assignMutation.isPending}>
            {assignMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AssignForm
