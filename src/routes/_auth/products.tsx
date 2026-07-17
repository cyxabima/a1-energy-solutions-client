import { useEffect, useState, useMemo } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  IconPackage,
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { useProducts } from "@/store/products"
import { useCategories } from "@/store/categories"
import { useBrands } from "@/store/brands"
import { useUnits } from "@/store/units"
import { useAuth } from "@/store/auth"
import type { Product } from "@/services/product"
import { getUsers } from "@/services/user"
import type { User } from "@/services/user"
import { ProductForm } from "@/components/product-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export const Route = createFileRoute("/_auth/products")({
  component: ProductsPage,
})

function ProductsPage() {
  const {
    products,
    pagination,
    isLoading,
    fetchProducts,
    deleteProduct,
    setPage,
    setFilters,
  } = useProducts()
  const { flatCategories, fetchFlat: fetchCategories } = useCategories()
  const { brands, fetchBrands } = useBrands()
  const { units, fetchUnits } = useUnits()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === "ADMIN"

  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterUnit, setFilterUnit] = useState("")
  const [filterOwner, setFilterOwner] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [owners, setOwners] = useState<User[]>([])

  useEffect(() => {
    fetchProducts().catch(() => toast.error("Failed to load products"))
    fetchCategories().catch(() => {})
    fetchBrands().catch(() => {})
    fetchUnits().catch(() => {})
    if (isAdmin) {
      getUsers({ limit: 100, role: "OWNER" }).then((res) => {
        setOwners(res.users)
      }).catch(() => {})
      getUsers({ limit: 100, role: "ADMIN" }).then((res) => {
        setOwners((prev) => {
          const existingIds = new Set(prev.map((u) => u._id))
          return [...prev, ...res.users.filter((u) => !existingIds.has(u._id))]
        })
      }).catch(() => {})
    }
  }, [fetchProducts, fetchCategories, fetchBrands, fetchUnits, isAdmin])

  const categoryMap = useMemo(
    () => new Map(flatCategories.map((c) => [c._id, c.name])),
    [flatCategories]
  )
  const brandMap = useMemo(
    () => new Map(brands.map((b) => [b._id, b.name])),
    [brands]
  )
  const unitMap = useMemo(
    () => new Map(units.map((u) => [u._id, u.symbol])),
    [units]
  )
  const userMap = useMemo(
    () => new Map(owners.map((u) => [u._id, u.name])),
    [owners]
  )

  useEffect(() => {
    const filters: Record<string, string> = {}
    if (search.trim()) filters.search = search.trim()
    if (filterCategory) filters.category = filterCategory
    if (filterBrand) filters.brand = filterBrand
    if (filterUnit) filters.unit = filterUnit
    if (filterOwner) filters.owner = filterOwner
    const timeout = setTimeout(() => setFilters(filters), 300)
    return () => clearTimeout(timeout)
  }, [search, filterCategory, filterBrand, filterUnit, filterOwner, setFilters])

  function openCreate() {
    setFormMode("create")
    setEditingProduct(null)
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setFormMode("edit")
    setEditingProduct(product)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteProduct(deleteTarget._id)
      toast.success("Product deleted")
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconPackage className="size-6 text-muted-foreground" />
          <h1 className="font-heading text-2xl font-bold">Products</h1>
        </div>
        <Button onClick={openCreate}>
          <IconPlus data-icon="inline-start" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="flex h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All Categories</option>
          {flatCategories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="flex h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          className="flex h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All Units</option>
          {units.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
        {isAdmin && (
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="flex h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All Owners</option>
            {owners.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <IconPackage className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No products yet</p>
          <p className="text-xs text-muted-foreground/70">Create your first product to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Buying Price</TableHead>
                {isAdmin && <TableHead>Owner</TableHead>}
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.barcode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {categoryMap.get(product.category) ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {brandMap.get(product.brand) ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {unitMap.get(product.unit) ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹{product.buyingPrice.toLocaleString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-muted-foreground">
                      {userMap.get(product.owner) ?? "—"}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString("en-US", {
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
                        onClick={() => openEdit(product)}
                      >
                        <IconPencil />
                      </Button>
                      <AlertDialog
                        open={deleteTarget?._id === product._id}
                        onOpenChange={(open) => {
                          if (!open) setDeleteTarget(null)
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <IconTrash />
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete <strong>{product.name}</strong> ({product.barcode}).
                              This action cannot be undone.
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              <IconChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
              <IconChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        product={editingProduct}
      />
    </div>
  )
}
