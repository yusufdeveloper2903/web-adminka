import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHeaderStore } from "@/store/header-store"

const Header = () => {
  const { title, filters, actions } = useHeaderStore()

  return (
    <header className="border-border bg-card flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <h1 className="!text-lg font-medium">{title}</h1>
        <section className="flex items-center gap-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a filter" />
            </SelectTrigger>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a filter" />
            </SelectTrigger>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a filter" />
            </SelectTrigger>
          </Select>
        </section>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  )
}

export default Header
