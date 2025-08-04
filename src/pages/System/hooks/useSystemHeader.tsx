import { useHeaderStore } from "@/store"
import { useEffect } from "react"

const useSystemHeader = () => {
  const { setConfig } = useHeaderStore()

  useEffect(() => {
    setConfig({
      title: "System Settings"
    })

    // Cleanup on unmount
    return () => {
      setConfig({
        title: ""
      })
    }
  }, [setConfig])
}

export default useSystemHeader
