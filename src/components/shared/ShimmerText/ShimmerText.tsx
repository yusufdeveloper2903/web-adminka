import { cn } from "@/lib/utils"

interface ShimmerTextProps {
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

const ShimmerText = ({ children, isLoading = false, className }: ShimmerTextProps) => {
  if (isLoading) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <div className="opacity-50">{children}</div>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    )
  }

  return <>{children}</>
}

export default ShimmerText