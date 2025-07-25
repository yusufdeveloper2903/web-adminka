import { Button } from "@/components/ui"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { useDrawerStore } from "@/store/drawer-store"
import { XIcon } from "lucide-react"

const AppDrawer = () => {
  const { isOpen, closeDrawer, title, content, headerActions, width } = useDrawerStore()

  // Debug width

  //   // Kichik drawer
  // width: "sm:max-w-sm"      // 384px

  // // O'rta drawer
  // width: "sm:max-w-md"      // 448px
  // width: "sm:max-w-lg"      // 512px
  // width: "sm:max-w-xl"      // 576px
  // width: "sm:max-w-2xl"     // 672px (default)

  // // Katta drawer
  // width: "sm:max-w-3xl"     // 768px
  // width: "sm:max-w-4xl"     // 896px
  // width: "sm:max-w-5xl"     // 1024px
  // width: "sm:max-w-6xl"     // 1152px
  // width: "sm:max-w-7xl"     // 1280px

  // // Full width
  // width: "sm:max-w-full"

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
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
