import type { ReactNode } from "react"
import { create } from "zustand"

export type DrawerAction = {
  id: string
  node: ReactNode
}

type DrawerState = {
  isOpen: boolean
  title?: string
  content?: ReactNode
  headerActions?: DrawerAction[]
  width?: string
  setConfig: (config: Partial<Omit<DrawerState, "setConfig" | "closeDrawer">>) => void
  closeDrawer: () => void
}

const initialState: Omit<DrawerState, "setConfig" | "closeDrawer"> = {
  isOpen: false,
  title: undefined,
  content: undefined,
  headerActions: [],
  width: undefined
}

export const useDrawerStore = create<DrawerState>((set) => ({
  ...initialState,
  setConfig: (config) => set({ ...initialState, isOpen: true, ...config }),
  closeDrawer: () => {
    // Smooth close animation
    set((state) => ({ ...state, isOpen: false }))
    setTimeout(() => {
      set(initialState)
    }, 500) // 500ms delay to match transition duration
  }
}))
