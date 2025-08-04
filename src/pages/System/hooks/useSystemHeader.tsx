import { useHeaderStore } from "@/store"
import { useEffect } from "react"

interface UseSystemHeaderProps {
  // No filters, stats, or buttons needed
}

const useSystemHeader = ({}: UseSystemHeaderProps = {}) => {
  const { setConfig } = useHeaderStore()

  useEffect(() => {
    setConfig({
      title: "System Settings",
      showSearch: false,
      showFilters: false,
      showStats: false,
      showActions: false
    })

    // Cleanup on unmount
    return () => {
      setConfig({
        title: "",
        showSearch: false,
        showFilters: false,
        showStats: false,
        showActions: false
      })
    }
  }, [setConfig])
}

export default useSystemHeader
