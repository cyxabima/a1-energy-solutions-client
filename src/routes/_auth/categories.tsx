import { useEffect, useState, useCallback, useMemo } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  IconTags,
  IconPlus,
  IconChevronDown,
  IconChevronRight,
  IconPencil,
  IconTrash,
  IconDotsVertical,
  IconFolder,
  IconFolderOpen,
  IconSearch,
} from "@tabler/icons-react"
import { useCategories } from "@/store/categories"
import type { CategoryTreeNode } from "@/services/category"
import { CategoryForm } from "@/components/category-form"
import { CategoryDetail } from "@/components/category-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Route = createFileRoute("/_auth/categories")({
  component: CategoriesPage,
})

function CategoryNode({
  node,
  depth,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  onEdit,
  onAddChild,
  onDelete,
}: {
  node: CategoryTreeNode
  depth: number
  selectedId: string | null
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onEdit: (cat: CategoryTreeNode) => void
  onAddChild: (parentId: string, parentName: string) => void
  onDelete: (cat: CategoryTreeNode) => void
}) {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedIds.has(node._id)
  const isSelected = selectedId === node._id

  return (
    <div>
      <div
        className={`group flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-sm transition-colors hover:bg-muted ${isSelected ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
          }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect(node._id)}
      >
        <button
          className={`flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors hover:bg-muted-foreground/10 ${!hasChildren ? "invisible" : ""
            }`}
          onClick={(e) => {
            e.stopPropagation()
            onToggle(node._id)
          }}
        >
          {isExpanded ? (
            <IconChevronDown className="size-3.5" />
          ) : (
            <IconChevronRight className="size-3.5" />
          )}
        </button>

        {isExpanded ? (
          <IconFolderOpen className="size-4 shrink-0 text-muted-foreground/70" />
        ) : (
          <IconFolder className="size-4 shrink-0 text-muted-foreground/70" />
        )}

        <span className="flex-1 truncate">{node.name}</span>

        {hasChildren && (
          <span className="shrink-0 rounded-md bg-muted-foreground/10 px-1.5 py-0.5 text-xs text-muted-foreground">
            {node.children.length}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex size-5 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-muted-foreground/10 group-hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
              />
            }
          >
            <IconDotsVertical className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onAddChild(node._id, node.name)}>
              <IconPlus className="size-4" />
              Add Subcategory
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(node)}>
              <IconPencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(node)}
              className="text-destructive focus:text-destructive"
            >
              <IconTrash className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded &&
        node.children.map((child) => (
          <CategoryNode
            key={child._id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onToggle={onToggle}
            onSelect={onSelect}
            onEdit={onEdit}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </div>
  )
}

function CategoriesPage() {
  const {
    tree,
    selectedId,
    expandedIds,
    isLoading,
    fetchTree,
    fetchFlat,
    selectCategory,
    toggleExpand,
    expandAll,
    collapseAll,
    deleteCategory,
  } = useCategories()

  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingCategory, setEditingCategory] = useState<CategoryTreeNode | null>(null)
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null)
  const [defaultParentName, setDefaultParentName] = useState<string>("")

  const [deleteTarget, setDeleteTarget] = useState<CategoryTreeNode | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    Promise.all([fetchTree(), fetchFlat()]).catch(() =>
      toast.error("Failed to load categories")
    )
  }, [fetchTree, fetchFlat])

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree
    const q = search.toLowerCase()
    function filterNodes(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
      return nodes
        .map((node) => ({ ...node, children: filterNodes(node.children) }))
        .filter((node) => node.name.toLowerCase().includes(q) || node.children.length > 0)
    }
    return filterNodes(tree)
  }, [tree, search])

  const totalCount = useMemo(() => {
    let count = 0
    function walk(nodes: CategoryTreeNode[]) {
      for (const node of nodes) {
        count++
        walk(node.children)
      }
    }
    walk(tree)
    return count
  }, [tree])

  const openCreate = useCallback((parentId?: string | null, parentName?: string) => {
    setFormMode("create")
    setEditingCategory(null)
    setDefaultParentId(parentId ?? null)
    setDefaultParentName(parentName ?? "")
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((cat: CategoryTreeNode) => {
    setFormMode("edit")
    setEditingCategory(cat)
    setDefaultParentId(null)
    setDefaultParentName("")
    setFormOpen(true)
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCategory(deleteTarget._id)
      toast.success("Category deleted")
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconTags className="size-6 text-muted-foreground" />
          <h1 className="font-heading text-2xl font-bold">Categories</h1>
        </div>
        <Button onClick={() => openCreate()}>
          <IconPlus data-icon="inline-start" />
          Add Category
        </Button>
      </div>

      <div className="flex min-h-[600px] rounded-xl border">
        <div className="flex w-80 flex-col border-r">
          <div className="flex items-center gap-2 p-3">
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <Button variant="ghost" size="icon-sm" onClick={expandAll}>
              <IconChevronDown className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={collapseAll}>
              <IconChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-1 pb-2">
            {isLoading ? (
              <div className="flex flex-col gap-1 px-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {search ? "No categories match." : "No categories yet."}
                </p>
              </div>
            ) : (
              filteredTree.map((node) => (
                <CategoryNode
                  key={node._id}
                  node={node}
                  depth={0}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onToggle={toggleExpand}
                  onSelect={(id) => selectCategory(id).catch(() => toast.error("Failed to load category"))}
                  onEdit={openEdit}
                  onAddChild={(parentId, parentName) => openCreate(parentId, parentName)}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {totalCount} {totalCount === 1 ? "category" : "categories"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <CategoryDetail />
        </div>
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        category={editingCategory}
        defaultParentId={defaultParentId}
        defaultParentName={defaultParentName}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and
              all its subcategories. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
