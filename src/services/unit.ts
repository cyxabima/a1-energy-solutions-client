import { get, post, put, del } from "@/lib/api"

export interface Unit {
  _id: string
  name: string
  symbol: string
  createdAt: string
  updatedAt: string
}

export function getUnits() {
  return get<Unit[]>("/api/v1/units")
}

export function getUnit(id: string) {
  return get<Unit>(`/api/v1/units/${id}`)
}

export function createUnit(name: string, symbol: string) {
  return post<Unit>("/api/v1/units", { name, symbol })
}

export function updateUnit(id: string, data: { name?: string; symbol?: string }) {
  return put<Unit>(`/api/v1/units/${id}`, data)
}

export function deleteUnit(id: string) {
  return del<null>(`/api/v1/units/${id}`)
}
