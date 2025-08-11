import { Button } from "@/components/ui"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useDrawerStore } from "@/store/drawer-store"
import { XIcon } from "lucide-react"
import { useEventListener } from "usehooks-ts"

const AppDrawer = () => {
  const { isOpen, closeDrawer, title, content, headerActions, width } = useDrawerStore()

  useEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrawer()
    }
  })

  return (
    <Sheet open={isOpen} onOpenChange={() => {}}>
      <SheetContent
        className={`custom-sheet-content overflow-y-auto p-4 transition-all duration-500 ease-in-out ${width || "sm:max-w-2xl"}`}
        side="right"
      >
        <SheetHeader className="p-0">
          {title && (
            <SheetTitle className="flex items-center justify-between">
              <span className="text-lg font-bold">{title}</span>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                {headerActions?.map((action) => (
                  <div key={action.id}>{action.node}</div>
                ))}
                <Button variant="ghost" onClick={closeDrawer}>
                  <XIcon className="size-6" />
                </Button>
              </div>
            </SheetTitle>
          )}
        </SheetHeader>
        <div>{content}</div>
      </SheetContent>
    </Sheet>
  )
}

export default AppDrawer
