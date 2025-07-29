import { useMemo } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui"
import { Edit, User } from "lucide-react"
import { useDrawerStore } from "@/store"
import type { IUserResponse } from "@/types"
import { NewUserForm } from "../components"

const columnHelper = createColumnHelper<IUserResponse>()

const useUsersColumns = () => {
  const { setConfig: setDrawerConfig } = useDrawerStore()

  const columns = useMemo<ColumnDef<IUserResponse, any>[]>(
    () => [
      columnHelper.accessor("firstName", {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="text-primary h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500">{user.role}</div>
              </div>
            </div>
          )
        },
        size: 250
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: ({ getValue }) => <div className="text-sm text-gray-900">{getValue()}</div>,
        size: 200
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: ({ getValue }) => <div className="text-sm text-gray-900">{getValue()}</div>,
        size: 150
      }),
      columnHelper.accessor("active", {
        header: "Status",
        cell: ({ getValue }) => {
          const isActive = getValue()
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          )
        },
        size: 100
      }),
      columnHelper.accessor("created", {
        header: "Created",
        cell: ({ getValue }) => {
          const date = new Date(getValue())
          return <div className="text-sm text-gray-500">{date.toLocaleDateString()}</div>
        },
        size: 120
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDrawerConfig({
                    title: "Edit User",
                    content: <NewUserForm user={user} />
                  })
                }
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )
        },
        size: 80
      })
    ],
    [setDrawerConfig]
  )

  return columns
}

export default useUsersColumns
