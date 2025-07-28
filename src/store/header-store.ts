import type { ReactNode } from "react"
import { create } from "zustand"

interface HeaderFilter {
  id: string
  node: ReactNode
}

interface HeaderAction {
  id: string
  label?: string
  icon?: ReactNode
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: boolean
}

interface HeaderState {
  title: string
  description?: string
  metadata: ReactNode | null
  actions: HeaderAction[]
  filters: HeaderFilter[]
  viewSwitcher?: ReactNode
  setConfig: (config: Partial<Omit<HeaderState, "setConfig" | "resetConfig">>) => void
  resetConfig: () => void
}

const initialState: Omit<HeaderState, "setConfig" | "resetConfig"> = {
  title: "",
  metadata: null,
  actions: [],
  filters: [],
  viewSwitcher: null
}

export const useHeaderStore = create<HeaderState>((set) => ({
  ...initialState,
  setConfig: (config) => set((state) => ({ ...state, ...config })),
  resetConfig: () => set(initialState)
}))
