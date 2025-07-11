import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { MapComponent } from "@/components/shared" // MapComponent'ni import qilamiz

const ResizableMapContent = () => {
  return (
    <div className="h-screen w-screen p-4">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
        {/* Chap panel */}
        <ResizablePanel defaultSize={30}>
          <div className="flex h-full items-center justify-center p-2">
            {/* MapComponent endi ref yoki onResize prop'ini talab qilmaydi */}
            <MapComponent initialCenter={{ lat: 52.53, lng: 13.38 }} zoom={11} isDark={false} />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* O'ng panellar guruhi */}
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="vertical">
            {/* O'ng yuqori panel */}
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center p-2">
                <MapComponent initialCenter={{ lat: 34.05, lng: -118.24 }} zoom={10} isDark={true} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* O'ng pastki panel */}
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center p-2">
                <MapComponent initialCenter={{ lat: 41.88, lng: -87.62 }} zoom={9} isDark={false} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ResizableMapContent
