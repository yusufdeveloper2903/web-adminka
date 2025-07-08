import { create } from "zustand"
import type { ReactNode } from "react"

type HeaderState = {
  title: string
  filters: ReactNode | null
  actions: ReactNode | null
  setHeaderElements: (elements: Partial<Omit<HeaderState, "setHeaderElements">>) => void
}

export const useHeaderStore = create<HeaderState>((set) => ({
  title: "",
  filters: null,
  actions: null,
  setHeaderElements: (elements) => set((state) => ({ ...state, ...elements }))
}))
