import { create } from "zustand"

type TripsView = "table" | "map"

interface TripsViewState {
  view: TripsView
  setView: (view: TripsView) => void
}

export const useTripsViewStore = create<TripsViewState>((set) => ({
  view: "table",
  setView: (view) => set({ view })
}))
