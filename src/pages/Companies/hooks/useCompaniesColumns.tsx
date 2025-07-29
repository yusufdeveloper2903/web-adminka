import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Mail, Phone, Truck, Edit } from "lucide-react"
import { useDrawerStore } from "@/store"
import type { ICompanyResponse } from "@/types"
import dayjs from "dayjs"
import { TABLE_UI_FORMAT } from "@/constants"
import { NewCompanyForm } from "../components"

const useCompaniesColumns = (): ColumnDef<ICompanyResponse>[] => {
  const { setConfig: setDrawerConfig, closeDrawer } = useDrawerStore()
  return [
    {
      accessorKey: "id",
      header: "ID",
      meta: {
        className: "min-w-[60px] w-[5%]"
      }
    },
    {
      accessorKey: "name",
      header: "Company Name",
      meta: {
        className: "min-w-[200px] w-[25%]"
      },
      cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: {
        className: "min-w-[180px] w-[20%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="truncate">{getValue() as string}</span>
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
          <span>{getValue() as string}</span>
        </div>
      )
    },
    {
      accessorKey: "usDot",
      header: "US DOT",
      meta: {
        className: "min-w-[100px] w-[10%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <Truck className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="font-mono">{getValue() as string}</span>
        </div>
      )
    },
    {
      accessorKey: "mc",
      header: "MC Number",
      meta: {
        className: "min-w-[100px] w-[8%]"
      },
      cell: ({ getValue }) => {
        const mcValue = getValue() as string | null
        return <span className="text-muted-foreground font-mono">{mcValue || "N/A"}</span>
      }
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[80px] w-[8%]"
      },
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean
        return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
      }
    },
    {
      accessorKey: "created",
      header: "Created",
      meta: {
        className: "min-w-[120px] w-[12%]"
      },
      cell: ({ getValue }) => dayjs(getValue() as string).format(TABLE_UI_FORMAT)
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[80px] w-[7%] text-center"
      },
      cell: ({ row }) => {
        const company = row.original

        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Company: ${company.name}`,
                  content: <NewCompanyForm company={company} onClose={closeDrawer} />
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

export default useCompaniesColumns
