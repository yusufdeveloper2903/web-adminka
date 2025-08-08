import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Mail, Phone, Truck, Edit, KeyIcon } from "lucide-react"
import { useDrawerStore } from "@/store"
import { StatusBadge } from "@/components/shared"
import type { ICompanyResponse } from "@/types"
import { TABLE_UI_FORMAT } from "@/constants"
import { NewCompanyForm, TokenForm } from "../components"
import { formatUTCToCentral } from "@/lib"

const useCompaniesColumns = (): ColumnDef<ICompanyResponse>[] => {
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
        className: "min-w-[60px] w-[5%]"
      },
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>
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
        className: "min-w-[180px] w-[23%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="truncate">{getValue() as string}</span>
        </div>
      ),
      enableSorting: false
    },
    {
      accessorKey: "phone",
      header: "Phone",
      meta: {
        className: "min-w-[120px] w-[21%]"
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
        className: "min-w-[100px] w-[12%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <Truck className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="font-mono">{getValue() as string}</span>
        </div>
      )
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[80px] w-[9%]"
      },
      cell: ({ getValue }) => <StatusBadge isActive={getValue() as boolean} />
    },
    {
      accessorKey: "created",
      header: "Created",
      meta: {
        className: "min-w-[120px] w-[15%]"
      },
      cell: ({ getValue }) => formatUTCToCentral(getValue() as string, TABLE_UI_FORMAT)
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Update API Tokens: ${company.name}`,
                  content: <TokenForm company={company} onClose={closeDrawer} />
                })
              }}
            >
              <KeyIcon className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useCompaniesColumns
