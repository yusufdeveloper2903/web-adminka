import { create } from "zustand"

interface ShopsFilters {
  keyword?: string
  sortName?: string
  sortDir?: string
}

type NewShopData = {
  name: string
  location: string
  latitude: number
  longitude: number
}

interface ShopsStore {
  filters: ShopsFilters
  setFilters: (filters: Partial<ShopsFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
  // Persistent form state for new shop
  newShopData: NewShopData
  setNewShopData: (data: Partial<NewShopData>) => void
  resetNewShopData: () => void
}

const initialFilters: ShopsFilters = {
  keyword: "",
  sortName: undefined,
  sortDir: undefined
}

const initialNewShopData: NewShopData = {
  name: "",
  location: "",
  latitude: 0,
  longitude: 0
}

export const useShopsStore = create<ShopsStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ filters: initialFilters }),
  setSorting: (sortName, sortDir) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortName: sortName || undefined,
        sortDir: sortDir || undefined
      }
    })),
  // New shop form persistence
  newShopData: initialNewShopData,
  setNewShopData: (data) => set((state) => ({ newShopData: { ...state.newShopData, ...data } })),
  resetNewShopData: () => set({ newShopData: initialNewShopData })
}))
