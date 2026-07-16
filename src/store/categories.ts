import { create } from "zustand"
import * as categoryApi from "@/services/category"
import type { Category, CategoryTreeNode } from "@/services/category"

const EXPANDED_KEY = "categories-expanded"

function loadExpanded(): Set<string> {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveExpanded(ids: Set<string>) {
  localStorage.setItem(EXPANDED_KEY, JSON.stringify([...ids]))
}

interface CategoriesState {
  tree: CategoryTreeNode[]
  flatCategories: Category[]
  selectedId: string | null
  selectedCategory: Category | null
  ancestors: Category[]
  expandedIds: Set<string>
  isLoading: boolean
  isDetailLoading: boolean

  fetchTree: () => Promise<void>
  fetchFlat: () => Promise<void>
  selectCategory: (id: string | null) => Promise<void>
  toggleExpand: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  createCategory: (data: { name: string; parentId?: string | null }) => Promise<void>
  updateCategory: (id: string, data: { name?: string; parentId?: string | null }) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useCategories = create<CategoriesState>((set, get) => ({
  tree: [],
  flatCategories: [],
  selectedId: null,
  selectedCategory: null,
  ancestors: [],
  expandedIds: loadExpanded(),
  isLoading: false,
  isDetailLoading: false,

  fetchTree: async () => {
    set({ isLoading: true })
    try {
      const tree = await categoryApi.getCategoryTree()
      set({ tree, isLoading: false })
    } catch {
      set({ isLoading: false })
      throw new Error("Failed to fetch categories")
    }
  },

  fetchFlat: async () => {
    try {
      const flatCategories = await categoryApi.getCategories()
      set({ flatCategories })
    } catch {
      // silent
    }
  },

  selectCategory: async (id) => {
    if (!id) {
      set({ selectedId: null, selectedCategory: null, ancestors: [] })
      return
    }
    set({ selectedId: id, isDetailLoading: true })
    try {
      const [category, ancestors] = await Promise.all([
        categoryApi.getCategory(id),
        categoryApi.getCategoryAncestors(id),
      ])
      set({ selectedCategory: category, ancestors, isDetailLoading: false })
    } catch {
      set({ isDetailLoading: false })
      throw new Error("Failed to load category")
    }
  },

  toggleExpand: (id) => {
    const next = new Set(get().expandedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    saveExpanded(next)
    set({ expandedIds: next })
  },

  expandAll: () => {
    const ids = new Set<string>()
    function walk(nodes: CategoryTreeNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0) {
          ids.add(node._id)
          walk(node.children)
        }
      }
    }
    walk(get().tree)
    saveExpanded(ids)
    set({ expandedIds: ids })
  },

  collapseAll: () => {
    const empty = new Set<string>()
    saveExpanded(empty)
    set({ expandedIds: empty })
  },

  createCategory: async (data) => {
    await categoryApi.createCategory(data)
    await get().fetchTree()
    await get().fetchFlat()
  },

  updateCategory: async (id, data) => {
    await categoryApi.updateCategory(id, data)
    await get().fetchTree()
    await get().fetchFlat()
    if (get().selectedId === id) {
      await get().selectCategory(id)
    }
  },

  deleteCategory: async (id) => {
    await categoryApi.deleteCategory(id)
    const { selectedId } = get()
    await get().fetchTree()
    await get().fetchFlat()
    if (selectedId === id) {
      set({ selectedId: null, selectedCategory: null, ancestors: [] })
    }
  },
}))
