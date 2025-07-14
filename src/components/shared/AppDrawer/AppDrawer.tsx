import { Button } from "@/components/ui"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { useDrawerStore } from "@/store/drawer-store"
import { XIcon } from "lucide-react"

const AppDrawer = () => {
  const { isOpen, closeDrawer, title, content, headerActions } = useDrawerStore()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="custom-sheet-content w-full overflow-y-auto p-4 sm:max-w-2xl">
        <SheetHeader className="p-0">
          {title && (
            <SheetTitle className="flex items-center justify-between">
              <span className="text-lg font-bold">{title}</span>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                {headerActions?.map((action) => (
                  <div key={action.id}>{action.node}</div>
                ))}
                <SheetClose asChild>
                  <Button variant="ghost">
                    <XIcon className="size-6" />
                  </Button>
                </SheetClose>
              </div>
            </SheetTitle>
          )}
        </SheetHeader>
        <div className="py-4">{content}</div>
      </SheetContent>
    </Sheet>
  )
}

export default AppDrawer
