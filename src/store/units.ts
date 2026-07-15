import { create } from "zustand"
import * as unitApi from "@/services/unit"
import type { Unit } from "@/services/unit"

interface UnitsState {
  units: Unit[]
  isLoading: boolean
  fetchUnits: () => Promise<void>
  createUnit: (name: string, symbol: string) => Promise<void>
  updateUnit: (id: string, data: { name?: string; symbol?: string }) => Promise<void>
  deleteUnit: (id: string) => Promise<void>
}

export const useUnits = create<UnitsState>((set, get) => ({
  units: [],
  isLoading: false,

  fetchUnits: async () => {
    set({ isLoading: true })
    try {
      const units = await unitApi.getUnits()
      set({ units, isLoading: false })
    } catch {
      set({ isLoading: false })
      throw new Error("Failed to fetch units")
    }
  },

  createUnit: async (name, symbol) => {
    await unitApi.createUnit(name, symbol)
    await get().fetchUnits()
  },

  updateUnit: async (id, data) => {
    await unitApi.updateUnit(id, data)
    await get().fetchUnits()
  },

  deleteUnit: async (id) => {
    await unitApi.deleteUnit(id)
    await get().fetchUnits()
  },
}))
