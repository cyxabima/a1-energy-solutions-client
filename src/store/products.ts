import { create } from "zustand"
import * as productApi from "@/services/product"
import type { Product, ProductListParams, Pagination, ProductAttribute } from "@/services/product"

interface ProductsState {
  products: Product[]
  pagination: Pagination
  filters: ProductListParams
  isLoading: boolean

  fetchProducts: (params?: ProductListParams) => Promise<void>
  createProduct: (data: {
    category: string
    brand: string
    unit: string
    buyingPrice: number
    attributes: ProductAttribute[]
    owner?: string
  }) => Promise<void>
  updateProduct: (id: string, data: {
    category?: string
    brand?: string
    unit?: string
    buyingPrice?: number
    attributes?: ProductAttribute[]
  }) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: ProductListParams) => void
}

export const useProducts = create<ProductsState>((set, get) => ({
  products: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  filters: {},
  isLoading: false,

  fetchProducts: async (params) => {
    const merged = { ...get().filters, ...params }
    set({ isLoading: true, filters: merged })
    try {
      const data = await productApi.getProducts(merged)
      set({ products: data.products, pagination: data.pagination, isLoading: false })
    } catch {
      set({ isLoading: false })
      throw new Error("Failed to fetch products")
    }
  },

  createProduct: async (data) => {
    await productApi.createProduct(data)
    await get().fetchProducts()
  },

  updateProduct: async (id, data) => {
    await productApi.updateProduct(id, data)
    await get().fetchProducts()
  },

  deleteProduct: async (id) => {
    await productApi.deleteProduct(id)
    await get().fetchProducts()
  },

  setPage: (page) => {
    get().fetchProducts({ page })
  },

  setFilters: (newFilters) => {
    set({ filters: newFilters })
    get().fetchProducts()
  },
}))
