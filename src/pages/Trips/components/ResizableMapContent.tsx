import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { LazyMap } from "@/components/shared"
import { useTheme } from "next-themes"
import { useMemo } from "react"

interface ResizableMapContentProps {
  isVisible: boolean
}

// Define coordinates outside the component to ensure they are stable and not recreated on every render.
// This is the key to preventing the map from re-initializing.

const ResizableMapContent = ({ isVisible }: ResizableMapContentProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const map1_coords = useMemo(() => ({ lat: 52.53, lng: 13.38 }), [])
  const map2_coords = useMemo(() => ({ lat: 34.05, lng: -118.24 }), [])
  const map3_coords = useMemo(() => ({ lat: 41.88, lng: -87.62 }), [])

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
      {/* Left Panel */}
      <ResizablePanel defaultSize={30}>
        <div className="h-full p-1">
          <LazyMap isParentVisible={isVisible} initialCenter={map1_coords} zoom={5} isDark={isDark} />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Panels Group */}
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="vertical">
          {/* Top Right Panel */}
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-1">
              <LazyMap isParentVisible={isVisible} initialCenter={map2_coords} zoom={6} isDark={isDark} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Bottom Right Panel */}
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-1">
              <LazyMap isParentVisible={isVisible} initialCenter={map3_coords} zoom={6} isDark={isDark} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default ResizableMapContent
