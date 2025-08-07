import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TABLE_UI_FORMAT } from "@/constants"
import { useDrawerStore } from "@/store"
import type { IUserResponse } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Edit, Mail, Phone } from "lucide-react"
import { NewUserForm } from "../components"
import { formatUTCToCDT } from "@/lib"

const useUsersColumns = (): ColumnDef<IUserResponse>[] => {
  const { setConfig: setDrawerConfig, closeDrawer } = useDrawerStore()

  return [
    {
      accessorKey: "No",
      header: "№",
      meta: {
        className: "min-w-[60px] w-[4%]"
      },
      cell: ({ row }) => <span>{row.index + 1}</span>,
      enableSorting: false
    },
    {
      accessorKey: "id",
      header: "ID",
      meta: {
        className: "min-w-[80px] w-[5%]"
      },
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>
    },
    {
      accessorKey: "firstName",
      header: "Firstname",
      meta: {
        className: "min-w-[140px] w-[14%]"
      }
    },
    {
      accessorKey: "lastName",
      header: "LastName",
      meta: {
        className: "min-w-[140px] w-[14%]"
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
      ),
      enableSorting: false
    },
    {
      accessorKey: "phone",
      header: "Phone",
      meta: {
        className: "min-w-[200px] w-[25%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span>{getValue<string>() || "N/A"}</span>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: {
        className: "min-w-[60px] w-[12%]"
      }
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[80px] w-[12%]"
      },
      cell: ({ getValue }) => {
        const isActive = getValue<boolean>()
        return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
      }
    },
    {
      accessorKey: "created",
      header: "Created",
      meta: {
        className: "min-w-[120px] w-[22%]"
      },
      cell: ({ getValue }) => (getValue() ? formatUTCToCDT(getValue() as string, TABLE_UI_FORMAT) : "-")
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
