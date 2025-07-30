import { cn } from "@/lib/utils"

interface ShimmerTextProps {
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

const ShimmerText = ({ children, isLoading = false, className }: ShimmerTextProps) => {
  if (isLoading) {
    return (
      <div className={cn("relative overflow-hidden rounded", className)}>
        {/* Original content with reduced opacity */}
        <div className="opacity-40">{children}</div>

        {/* Shimmer wave effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-gray-200/80 to-transparent dark:via-gray-600/60" />

        {/* Additional subtle pulse effect */}
        <div className="absolute inset-0 animate-pulse bg-gray-100/20 dark:bg-gray-700/20" />
      </div>
    )
  }

  return <>{children}</>
}

export default ShimmerText
