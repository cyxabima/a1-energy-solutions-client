import { get, post, put, del } from "@/lib/api"

export interface Brand {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export function getBrands() {
  return get<Brand[]>("/api/v1/brands")
}

export function getBrand(id: string) {
  return get<Brand>(`/api/v1/brands/${id}`)
}

export function createBrand(name: string, description?: string) {
  return post<Brand>("/api/v1/brands", { name, description })
}

export function updateBrand(id: string, data: { name?: string; description?: string }) {
  return put<Brand>(`/api/v1/brands/${id}`, data)
}

export function deleteBrand(id: string) {
  return del<null>(`/api/v1/brands/${id}`)
}
