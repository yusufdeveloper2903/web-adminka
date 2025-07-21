import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { CheckCircle, Route } from "lucide-react"

interface RouteSuccessIndicatorProps {
  isVisible: boolean
  stopCount: number
}

const RouteSuccessIndicator = ({ isVisible, stopCount }: RouteSuccessIndicatorProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!show) return null

  return (
    <div
      className="bg-background/95 absolute top-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-3 shadow-lg backdrop-blur-sm transition-all duration-300"
      style={{
        background: isDark ? "rgba(26, 26, 26, 0.95)" : "rgba(248, 249, 250, 0.95)"
      }}
    >
      {/* Success icon */}
      <div className="relative">
        <Route className="h-5 w-5 text-blue-500" />
        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
      </div>

      {/* Success message */}
      <div className="text-sm">
        <span className="text-foreground font-medium">Route calculated!</span>
        <span className="text-muted-foreground ml-1">{stopCount} stops connected</span>
      </div>
    </div>
  )
}

export default RouteSuccessIndicator
