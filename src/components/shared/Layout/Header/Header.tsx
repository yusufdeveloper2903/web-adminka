import { Button } from "@/components/ui/button"
import { useHeaderStore } from "@/store/header-store"

const Header = () => {
  const { title, metadata, filters, actions, viewSwitcher } = useHeaderStore()

  return (
    <header className="border-border bg-card px4 mb-2 flex h-12 shrink-0 items-center justify-between rounded-[8px] border-b pr-4">
      <div className="flex flex-1 items-center gap-4">
        {/* Left Side */}
        <section className="flex items-center gap-4">
          {title && (
            <h2 className="bg-blue-primary dark:bg-muted flex h-12 items-center justify-center rounded-l-[8px] px-5 text-base font-medium text-white">
              {title}
            </h2>
          )}
          <div className="flex items-center gap-2">
            {filters.map((filter) => (
              <div key={filter.id}>{filter.node}</div>
            ))}
          </div>
        </section>

        {/* Center/Left-ish Side for Switcher */}
        {viewSwitcher && <section>{viewSwitcher}</section>}
      </div>

      {/* Right Side */}
      <section className="custom-scrollbar flex items-center gap-4 max-2xl:overflow-x-auto">
        {metadata && <div className="text-muted-foreground text-sm whitespace-pre">{metadata}</div>}
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
