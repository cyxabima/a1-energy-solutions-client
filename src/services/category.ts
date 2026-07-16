import { get, post, put, del } from "@/lib/api"

export interface CategoryAttribute {
  name: string
  type: "select" | "text" | "number"
  required: boolean
  possibleValues: string[]
}

export interface Category {
  _id: string
  name: string
  slug: string
  path: string
  depth: number
  parentId: string | null
  attributes: CategoryAttribute[]
  createdAt: string
  updatedAt: string
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

export function getCategoryTree() {
  return get<CategoryTreeNode[]>("/api/v1/categories/tree")
}

export function getCategories() {
  return get<Category[]>("/api/v1/categories")
}

export function getCategory(id: string) {
  return get<Category>(`/api/v1/categories/${id}`)
}

export function getCategoryAncestors(id: string) {
  return get<Category[]>(`/api/v1/categories/${id}/ancestors`)
}

export function getCategoryInheritedAttributes(id: string) {
  return get<CategoryAttribute[]>(`/api/v1/categories/${id}/attributes`)
}

export function createCategory(data: {
  name: string
  parentId?: string | null
  attributes?: CategoryAttribute[]
}) {
  return post<Category>("/api/v1/categories", data)
}

export function updateCategory(
  id: string,
  data: { name?: string; parentId?: string | null; attributes?: CategoryAttribute[] }
) {
  return put<Category>(`/api/v1/categories/${id}`, data)
}

export function deleteCategory(id: string) {
  return del<null>(`/api/v1/categories/${id}`)
}
