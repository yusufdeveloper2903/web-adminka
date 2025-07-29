import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TABLE_UI_FORMAT } from "@/constants"
import { useDrawerStore } from "@/store"
import type { IUserResponse } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Edit, Mail, Phone } from "lucide-react"
import { NewUserForm } from "../components"

const useUsersColumns = (): ColumnDef<IUserResponse>[] => {
  const { setConfig: setDrawerConfig, closeDrawer } = useDrawerStore()

  return [
    {
      id: "name",
      header: "Name",
      meta: {
        className: "min-w-[200px] w-[25%]"
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-3 p-2">
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-muted-foreground text-sm">{user.role}</div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: {
        className: "min-w-[180px] w-[25%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="truncate">{getValue<string>()}</span>
        </div>
      )
    },
    {
      accessorKey: "phone",
      header: "Phone",
      meta: {
        className: "min-w-[120px] w-[15%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span>{getValue<string>() || "N/A"}</span>
        </div>
      )
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[80px] w-[10%]"
      },
      cell: ({ getValue }) => {
        const isActive = getValue<boolean>()
        return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
      }
    },
    {
      accessorKey: "updated",
      header: "Last Updated",
      meta: {
        className: "min-w-[120px] w-[15%]"
      },
      cell: ({ getValue }) => dayjs(getValue<string>()).format(TABLE_UI_FORMAT)
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[80px] w-[10%] text-center"
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit User: ${user.firstName}`,
                  content: <NewUserForm user={user} onClose={closeDrawer} />
                })
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useUsersColumns
