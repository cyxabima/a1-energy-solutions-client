import { get, post, patch, del } from "@/lib/api"

export interface ProductAttribute {
  name: string
  value: string
}

export interface Product {
  _id: string
  name: string
  barcode: string
  category: string
  brand: string
  unit: string
  owner: string
  buyingPrice: number
  attributes: ProductAttribute[]
  createdAt: string
  updatedAt: string
}

export interface ProductListParams {
  page?: number
  limit?: number
  search?: string
  barcode?: string
  category?: string
  brand?: string
  unit?: string
  owner?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedProducts {
  products: Product[]
  pagination: Pagination
}

export function getProducts(params: ProductListParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.search) searchParams.set("search", params.search)
  if (params.barcode) searchParams.set("barcode", params.barcode)
  if (params.category) searchParams.set("category", params.category)
  if (params.brand) searchParams.set("brand", params.brand)
  if (params.unit) searchParams.set("unit", params.unit)
  if (params.owner) searchParams.set("owner", params.owner)
  const qs = searchParams.toString()
  return get<PaginatedProducts>(`/api/v1/products${qs ? `?${qs}` : ""}`)
}

export function getProduct(id: string) {
  return get<Product>(`/api/v1/products/${id}`)
}

export function createProduct(data: {
  category: string
  brand: string
  unit: string
  buyingPrice: number
  attributes: ProductAttribute[]
  owner?: string
}) {
  return post<Product>("/api/v1/products", data)
}

export function updateProduct(
  id: string,
  data: {
    category?: string
    brand?: string
    unit?: string
    buyingPrice?: number
    attributes?: ProductAttribute[]
    owner?: string
  }
) {
  return patch<Product>(`/api/v1/products/${id}`, data)
}

export function deleteProduct(id: string) {
  return del<null>(`/api/v1/products/${id}`)
}
