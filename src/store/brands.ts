import { create } from "zustand"
import * as brandApi from "@/services/brand"
import type { Brand } from "@/services/brand"

interface BrandsState {
  brands: Brand[]
  isLoading: boolean
  fetchBrands: () => Promise<void>
  createBrand: (name: string, description?: string) => Promise<void>
  updateBrand: (id: string, data: { name?: string; description?: string }) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
}

export const useBrands = create<BrandsState>((set, get) => ({
  brands: [],
  isLoading: false,

  fetchBrands: async () => {
    set({ isLoading: true })
    try {
      const brands = await brandApi.getBrands()
      set({ brands, isLoading: false })
    } catch {
      set({ isLoading: false })
      throw new Error("Failed to fetch brands")
    }
  },

  createBrand: async (name, description) => {
    await brandApi.createBrand(name, description)
    await get().fetchBrands()
  },

  updateBrand: async (id, data) => {
    await brandApi.updateBrand(id, data)
    await get().fetchBrands()
  },

  deleteBrand: async (id) => {
    await brandApi.deleteBrand(id)
    await get().fetchBrands()
  },
}))
