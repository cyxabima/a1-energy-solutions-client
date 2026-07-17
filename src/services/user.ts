import { get, patch } from "@/lib/api"

export interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: string
}

export interface PaginatedUsers {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function getUsers(params: UserListParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.search) searchParams.set("search", params.search)
  if (params.role) searchParams.set("role", params.role)
  const qs = searchParams.toString()
  return get<PaginatedUsers>(`/api/v1/users${qs ? `?${qs}` : ""}`)
}

export function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    role?: string
  }
) {
  return patch<User>(`/api/v1/users/${id}`, data)
}
