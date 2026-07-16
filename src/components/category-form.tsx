import { useState } from "react"
import { toast } from "sonner"
import { useCategories } from "@/store/categories"
import type { CategoryTreeNode } from "@/services/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  category?: CategoryTreeNode | null
  defaultParentId?: string | null
  defaultParentName?: string
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function CategoryFormInner({
  mode,
  category,
  defaultParentId,
  defaultParentName,
  onOpenChange,
}: {
  mode: "create" | "edit"
  category?: CategoryTreeNode | null
  defaultParentId?: string | null
  defaultParentName?: string
  onOpenChange: (open: boolean) => void
}) {
  const { flatCategories, createCategory, updateCategory } = useCategories()
  const [formName, setFormName] = useState(category?.name ?? "")
  const [formParentId, setFormParentId] = useState<string>(
    mode === "edit" ? (category?.parentId ?? "") : (defaultParentId ?? "")
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableParents = flatCategories.filter(
    (c) => c._id !== category?._id
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = formName.trim()
    if (!name) return

    setIsSubmitting(true)
    try {
      if (mode === "edit" && category) {
        await updateCategory(category._id, {
          name,
          parentId: formParentId || null,
        })
        toast.success("Category updated")
      } else {
        await createCategory({
          name,
          parentId: formParentId || null,
        })
        toast.success("Category created")
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? "Update the category details below."
            : defaultParentName
              ? `Add a subcategory under "${defaultParentName}".`
              : "Create a new root category."}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category-name">Name *</Label>
          <Input
            id="category-name"
            placeholder="e.g. Solar, Inverters, Hybrid"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            autoFocus
          />
          {formName && (
            <p className="text-xs text-muted-foreground">
              Slug: <code className="font-mono">{toSlug(formName)}</code>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category-parent">Parent (optional)</Label>
          <select
            id="category-parent"
            value={formParentId}
            onChange={(e) => setFormParentId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">None (root category)</option>
            {availableParents.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={!formName.trim() || isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save Changes"
              : "Create Category"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CategoryForm({
  open,
  onOpenChange,
  mode,
  category,
  defaultParentId,
  defaultParentName,
}: CategoryFormProps) {
  const formKey = mode === "edit" ? `edit-${category?._id}` : `create-${defaultParentId ?? "root"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <CategoryFormInner
            key={formKey}
            mode={mode}
            category={category}
            defaultParentId={defaultParentId}
            defaultParentName={defaultParentName}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
