import { useState } from "react"
import { toast } from "sonner"
import {
  IconTags,
  IconFolder,
  IconLink,
  IconPlus,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { useCategories } from "@/store/categories"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

interface CategoryDetailProps {
  onAddAttribute: () => void
  onEditAttribute: (index: number) => void
}

export function CategoryDetail({ onAddAttribute, onEditAttribute }: CategoryDetailProps) {
  const {
    selectedCategory: category,
    ancestors,
    inheritedAttributes,
    isDetailLoading,
    updateAttributes,
  } = useCategories()

  const [deleteAttrIndex, setDeleteAttrIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteAttribute() {
    if (!category || deleteAttrIndex == null) return
    setIsDeleting(true)
    try {
      const updatedAttributes = category.attributes.filter((_, i) => i !== deleteAttrIndex)
      await updateAttributes(category._id, updatedAttributes)
      toast.success("Attribute deleted")
      setDeleteAttrIndex(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete attribute")
    } finally {
      setIsDeleting(false)
    }
  }

  function isOwnAttribute(attrName: string) {
    return category?.attributes.some((a) => a.name === attrName) ?? false
  }

  function getSourceAncestor(attrName: string) {
    return ancestors.find((a) => a.attributes.some((aa) => aa.name === attrName))
  }

  if (isDetailLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <IconFolder className="mb-3 size-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Select a category from the tree to view its details.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {ancestors.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          {ancestors.map((a) => (
            <span key={a._id} className="flex items-center gap-1">
              <span className="hover:text-foreground">{a.name}</span>
              <span>/</span>
            </span>
          ))}
          <span className="font-medium text-foreground">{category.name}</span>
        </nav>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-bold">{category.name}</h2>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-24 text-muted-foreground">Slug</span>
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
              {category.slug}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-muted-foreground">Path</span>
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
              {category.path}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-muted-foreground">Depth</span>
            <span>{category.depth}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-muted-foreground">Created</span>
            <span>
              {new Date(category.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconTags className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">All Attributes</h3>
            <Badge variant="secondary" className="text-xs">
              {inheritedAttributes.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onAddAttribute}>
            <IconPlus data-icon="inline-start" />
            Add
          </Button>
        </div>

        {inheritedAttributes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attributes defined yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {inheritedAttributes.map((attr) => {
              const own = isOwnAttribute(attr.name)
              const source = getSourceAncestor(attr.name)
              return (
                <div
                  key={attr.name}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    !own ? "border-dashed opacity-75" : ""
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{attr.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {attr.type}
                      </Badge>
                      {attr.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {source && (
                        <Badge variant="secondary" className="text-xs">
                          Inherited: {source.name}
                        </Badge>
                      )}
                    </div>
                    {attr.type === "select" && attr.possibleValues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {attr.possibleValues.map((val) => (
                          <Badge key={val} variant="secondary" className="text-xs">
                            {val}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {own && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          const idx = category.attributes.findIndex((a) => a.name === attr.name)
                          if (idx !== -1) onEditAttribute(idx)
                        }}
                      >
                        <IconPencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          const idx = category.attributes.findIndex((a) => a.name === attr.name)
                          if (idx !== -1) setDeleteAttrIndex(idx)
                        }}
                      >
                        <IconTrash />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {category.parentId && (
        <>
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconLink className="size-4" />
            <span>
              Parent:{" "}
              <span className="font-medium text-foreground">
                {ancestors.length > 0 ? ancestors[ancestors.length - 1].name : "—"}
              </span>
            </span>
          </div>
        </>
      )}

      <AlertDialog
        open={deleteAttrIndex != null}
        onOpenChange={(open) => {
          if (!open) setDeleteAttrIndex(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteAttrIndex != null ? category.attributes[deleteAttrIndex]?.name : ""}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteAttribute}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
