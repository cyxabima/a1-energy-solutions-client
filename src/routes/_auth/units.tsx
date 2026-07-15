import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { IconScale, IconPlus, IconPencil, IconTrash } from "@tabler/icons-react"
import { useUnits } from "@/store/units"
import type { Unit } from "@/services/unit"
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

export const Route = createFileRoute("/_auth/units")({
  component: UnitsPage,
})

function UnitsPage() {
  const { units, isLoading, fetchUnits, createUnit, updateUnit, deleteUnit } = useUnits()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Unit | null>(null)
  const [formName, setFormName] = useState("")
  const [formSymbol, setFormSymbol] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchUnits().catch(() => toast.error("Failed to load units"))
  }, [fetchUnits])

  function openEdit(unit: Unit) {
    setEditing(unit)
    setFormName(unit.name)
    setFormSymbol(unit.symbol)
    setFormOpen(true)
  }

  function openCreate() {
    setEditing(null)
    setFormName("")
    setFormSymbol("")
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = formName.trim()
    const symbol = formSymbol.trim()
    if (!name || !symbol) return

    setIsSubmitting(true)
    try {
      if (editing) {
        await updateUnit(editing._id, { name, symbol })
        toast.success("Unit updated")
      } else {
        await createUnit(name, symbol)
        toast.success("Unit created")
      }
      setFormOpen(false)
      setFormName("")
      setFormSymbol("")
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
      await deleteUnit(deleteTarget._id)
      toast.success("Unit deleted")
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete unit")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconScale className="size-6 text-muted-foreground" />
          <h1 className="font-heading text-2xl font-bold">Units</h1>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger
            render={<Button />}
            onClick={openCreate}
          >
            <IconPlus data-icon="inline-start" />
            Add Unit
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Unit" : "Add Unit"}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update the unit details below."
                    : "Enter unit details. Both name and symbol are required."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="unit-name">Name *</Label>
                  <Input
                    id="unit-name"
                    placeholder="e.g. Piece, Kilogram, Litre"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="unit-symbol">Symbol *</Label>
                  <Input
                    id="unit-symbol"
                    placeholder="e.g. pcs, kg, L"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!formName.trim() || !formSymbol.trim() || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Create Unit"}
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
      ) : units.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <IconScale className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No units yet</p>
          <p className="text-xs text-muted-foreground/70">Create your first unit to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit._id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {unit.symbol}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(unit.createdAt).toLocaleDateString("en-US", {
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
                        onClick={() => openEdit(unit)}
                      >
                        <IconPencil />
                      </Button>
                      <AlertDialog
                        open={deleteTarget?._id === unit._id}
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
                          onClick={() => setDeleteTarget(unit)}
                        >
                          <IconTrash />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete unit?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete <strong>{unit.name}</strong> ({unit.symbol}). This action cannot be undone.
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
