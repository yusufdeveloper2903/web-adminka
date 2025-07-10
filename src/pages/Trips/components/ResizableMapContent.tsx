import { useRef } from "react"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { MapComponent, type MapComponentRef } from "@/components/shared"

const ResizableMapContent = () => {
  // Har bir xarita uchun ref yaratish
  const mapRef1 = useRef<MapComponentRef>(null)
  // const mapRef2 = useRef<MapComponentRef>(null)
  // const mapRef3 = useRef<MapComponentRef>(null)

  // Panel o'lchami o'zgarganda chaqiriladigan funksiya
  const handlePanelResize = () => {
    // Barcha xaritalarni qayta o'lchamlash
    setTimeout(() => {
      mapRef1.current?.resize()
      // mapRef2.current?.resize()
      // mapRef3.current?.resize()
    }, 50) // Kichik kechikish bilan
  }

  return (
    <div className="h-screen w-screen p-4">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full rounded-lg border"
        onLayout={handlePanelResize} // Panel o'lchami o'zgarganda
      >
        {/* Chap panel */}
        <ResizablePanel
          defaultSize={100} // Bitta panel bo'lgani uchun to'liq egallasin
          onResize={handlePanelResize} // Bu panel o'lchami o'zgarganda
        >
          <div className="h-full p-2">
            <MapComponent ref={mapRef1} initialCenter={{ lat: 52.53, lng: 13.38 }} zoom={11} />
          </div>
        </ResizablePanel>

        {/* <ResizableHandle withHandle /> */}

        {/* O'ng panellar guruhi */}
        {/* <ResizablePanel defaultSize={70} onResize={handlePanelResize}>
          <ResizablePanelGroup direction="vertical" onLayout={handlePanelResize}>
            <ResizablePanel defaultSize={50} onResize={handlePanelResize}>
              <div className="h-full p-2">
                <MapComponent ref={mapRef2} initialCenter={{ lat: 34.05, lng: -118.24 }} zoom={10} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} onResize={handlePanelResize}>
              <div className="h-full p-2">
                <MapComponent ref={mapRef3} initialCenter={{ lat: 41.88, lng: -87.62 }} zoom={9} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel> */}
      </ResizablePanelGroup>
    </div>
  )
}

export default ResizableMapContent
