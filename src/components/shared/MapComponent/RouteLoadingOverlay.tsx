import { useTheme } from "next-themes"
import { Loader2, Route } from "lucide-react"

interface RouteLoadingOverlayProps {
  isVisible: boolean
}

const RouteLoadingOverlay = ({ isVisible }: RouteLoadingOverlayProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  if (!isVisible) return null

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300"
      style={{
        background: isDark ? "rgba(26, 26, 26, 0.95)" : "rgba(248, 249, 250, 0.95)",
        backdropFilter: "blur(4px)"
      }}
    >
      {/* Main loading content */}
      <div className="bg-background/80 flex flex-col items-center gap-4 rounded-lg border p-6 shadow-lg backdrop-blur-sm">
        {/* Animated route icon */}
        <div className="relative">
          <Route className="h-8 w-8 text-blue-500" />
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h3 className="text-foreground font-semibold">Calculating Route</h3>
          <p className="text-muted-foreground mt-1 text-sm">Finding the best path for your trip...</p>
        </div>

        {/* Animated progress dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
    </div>
  )
}

export default RouteLoadingOverlay
