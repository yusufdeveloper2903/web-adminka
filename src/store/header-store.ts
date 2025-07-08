import type { ReactNode } from "react"
import { create } from "zustand"

// Konfiguratsiya turlari
export type HeaderAction = {
  id: string
  label?: ReactNode
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: boolean
  icon?: ReactNode
}

export type HeaderFilter = {
  id: string
  placeholder: string
  options: { value: string; label: string }[]
  value?: string
  onValueChange: (value: string) => void
}

type HeaderState = {
  title: string
  metadata: ReactNode | null
  actions: HeaderAction[]
  filters: HeaderFilter[]
  setConfig: (config: Partial<Omit<HeaderState, "setConfig">>) => void
  resetConfig: () => void
}

const initialState: Omit<HeaderState, "setConfig" | "resetConfig"> = {
  title: "",
  metadata: null,
  actions: [],
  filters: []
}

export const useHeaderStore = create<HeaderState>((set) => ({
  ...initialState,
  setConfig: (config) => set((state) => ({ ...state, ...config })),
  resetConfig: () => set(initialState)
}))
