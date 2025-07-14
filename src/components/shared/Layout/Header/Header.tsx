import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHeaderStore } from "@/store/header-store"

const Header = () => {
  const { title, metadata, filters, actions, viewSwitcher } = useHeaderStore()

  return (
    <header className="border-border bg-card flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Left Side */}
        <section className="flex items-center gap-4">
          {title && <h2 className="text-lg font-medium">{title}</h2>}
          <div className="flex items-center gap-2">
            {filters.map((filter) => (
              <Select key={filter.id} onValueChange={filter.onValueChange} value={filter.value}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </section>

        {/* Center/Left-ish Side for Switcher */}
        {viewSwitcher && <section>{viewSwitcher}</section>}
      </div>

      {/* Right Side */}
      <section className="flex items-center gap-4">
        {metadata && <div className="text-muted-foreground text-sm">{metadata}</div>}
        {actions.map(({ id, label, onClick, variant, disabled, icon }) => (
          <Button key={id} onClick={onClick} variant={variant || "default"} size="sm" disabled={disabled}>
            {label}
            {icon}
          </Button>
        ))}
      </section>
    </header>
  )
}

export default Header
