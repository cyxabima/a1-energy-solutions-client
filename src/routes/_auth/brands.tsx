import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { IconAward, IconPlus, IconPencil, IconTrash } from "@tabler/icons-react"
import { useBrands } from "@/store/brands"
import type { Brand } from "@/services/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_auth/brands")({
  component: BrandsPage,
})

function BrandsPage() {
  const { brands, isLoading, fetchBrands, createBrand, updateBrand, deleteBrand } = useBrands()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBrands().catch(() => toast.error("Failed to load brands"))
  }, [fetchBrands])

  function openEdit(brand: Brand) {
    setEditing(brand)
    setFormName(brand.name)
    setFormDesc(brand.description ?? "")
    setFormOpen(true)
  }

  function openCreate() {
    setEditing(null)
    setFormName("")
    setFormDesc("")
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = formName.trim()
    if (!name) return

    const description = formDesc.trim() || undefined

    setIsSubmitting(true)
    try {
      if (editing) {
        await updateBrand(editing._id, { name, description })
        toast.success("Brand updated")
      } else {
        await createBrand(name, description)
        toast.success("Brand created")
      }
      setFormOpen(false)
      setFormName("")
      setFormDesc("")
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteBrand(deleteTarget._id)
      toast.success("Brand deleted")
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete brand")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconAward className="size-6 text-muted-foreground" />
          <h1 className="font-heading text-2xl font-bold">Brands</h1>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger
            render={<Button />}
            onClick={openCreate}
          >
            <IconPlus data-icon="inline-start" />
            Add Brand
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Brand" : "Add Brand"}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update the brand details below."
                    : "Enter brand details. Name must be unique."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="brand-name">Name *</Label>
                  <Input
                    id="brand-name"
                    placeholder="e.g. Sukam, Luminous"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="brand-desc">Description</Label>
                  <Input
                    id="brand-desc"
                    placeholder="Optional description (max 500 characters)"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    maxLength={500}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!formName.trim() || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Create Brand"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <IconAward className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No brands yet</p>
          <p className="text-xs text-muted-foreground/70">Create your first brand to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {brand.description || "\u2014"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(brand.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(brand)}
                      >
                        <IconPencil />
                      </Button>
                      <AlertDialog
                        open={deleteTarget?._id === brand._id}
                        onOpenChange={(open) => {
                          if (!open) setDeleteTarget(null)
                        }}
                      >
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                            />
                          }
                          onClick={() => setDeleteTarget(brand)}
                        >
                          <IconTrash />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete brand?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete <strong>{brand.name}</strong>. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Cancel
                            </AlertDialogCancel>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
