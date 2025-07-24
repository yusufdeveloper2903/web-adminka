import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback } from "react"

export type DispatchersTabType = "dispatchers" | "teams"

export const useDispatchersTab = () => {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })

  // Get current tab from URL params, default to 'dispatchers'
  const currentTab: DispatchersTabType = (search as any)?.tab === "teams" ? "teams" : "dispatchers"

  // Function to change tab and update URL
  const setTab = useCallback(
    (tab: DispatchersTabType) => {
      navigate({
        to: "/dispatchers",
        search: { tab }
      })
    },
    [navigate]
  )

  return {
    currentTab,
    setTab
  }
}
