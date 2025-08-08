import { cn } from "@/lib"

interface StatusBadgeProps {
  isActive: boolean
  activeText?: string
  inactiveText?: string
  className?: string
}

const StatusBadge = ({ isActive, activeText = "Active", inactiveText = "Inactive", className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        className
      )}
    >
      {isActive ? activeText : inactiveText}
    </span>
  )
}

export default StatusBadge
