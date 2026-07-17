import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useProducts } from "@/store/products"
import { useCategories } from "@/store/categories"
import { useBrands } from "@/store/brands"
import { useUnits } from "@/store/units"
import { useAuth } from "@/store/auth"
import type { Product } from "@/services/product"
import type { CategoryAttribute } from "@/services/category"
import { getCategoryInheritedAttributes } from "@/services/category"
import { getUsers } from "@/services/user"
import type { User } from "@/services/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  product?: Product | null
}

function ProductFormInner({
  mode,
  product,
  onOpenChange,
}: {
  mode: "create" | "edit"
  product?: Product | null
  onOpenChange: (open: boolean) => void
}) {
  const { createProduct, updateProduct } = useProducts()
  const { flatCategories, fetchFlat: fetchCategories } = useCategories()
  const { brands, fetchBrands } = useBrands()
  const { units, fetchUnits } = useUnits()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === "ADMIN"

  const [categoryId, setCategoryId] = useState(product?.category ?? "")
  const [brandId, setBrandId] = useState(product?.brand ?? "")
  const [unitId, setUnitId] = useState(product?.unit ?? "")
  const [buyingPrice, setBuyingPrice] = useState(product?.buyingPrice?.toString() ?? "")
  const [ownerId, setOwnerId] = useState(product?.owner ?? "")
  const [owners, setOwners] = useState<User[]>([])
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([])
  const [attrsLoading, setAttrsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fetchingRef = useRef<string | null>(null)

  useEffect(() => {
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
  }, [fetchCategories, fetchBrands, fetchUnits, isAdmin])

  async function loadAttributes(catId: string) {
    if (!catId) {
      setCategoryAttributes([])
      setAttributeValues({})
      return
    }
    if (fetchingRef.current === catId) return
    fetchingRef.current = catId
    setAttrsLoading(true)
    try {
      const attrs = await getCategoryInheritedAttributes(catId)
      setCategoryAttributes(attrs)
      if (mode === "edit" && product && product.category === catId) {
        const existing = new Map(product.attributes.map((a) => [a.name, a.value]))
        const values: Record<string, string> = {}
        for (const attr of attrs) {
          values[attr.name] = existing.get(attr.name) ?? ""
        }
        setAttributeValues(values)
      } else {
        const values: Record<string, string> = {}
        for (const attr of attrs) {
          values[attr.name] = ""
        }
        setAttributeValues(values)
      }
    } catch {
      toast.error("Failed to load category attributes")
    } finally {
      setAttrsLoading(false)
      fetchingRef.current = null
    }
  }

  async function handleCategoryChange(newCategoryId: string) {
    setCategoryId(newCategoryId)
    await loadAttributes(newCategoryId)
  }

  /* eslint-disable react-hooks/exhaustive-deps -- mount-only; component is keyed */
  useEffect(() => {
    if (mode === "edit" && product?.category) {
      const catId = product.category
      ;(async () => {
        try {
          const attrs = await getCategoryInheritedAttributes(catId)
          setCategoryAttributes(attrs)
          const existing = new Map(product.attributes.map((a) => [a.name, a.value]))
          const values: Record<string, string> = {}
          for (const attr of attrs) {
            values[attr.name] = existing.get(attr.name) ?? ""
          }
          setAttributeValues(values)
        } catch {
          toast.error("Failed to load category attributes")
        }
      })()
    }
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId || !brandId || !unitId || !buyingPrice) return
    if (isAdmin && !ownerId) return

    const attributes = categoryAttributes.map((attr) => ({
      name: attr.name,
      value: attributeValues[attr.name] ?? "",
    }))

    setIsSubmitting(true)
    try {
      if (mode === "edit" && product) {
        await updateProduct(product._id, {
          category: categoryId,
          brand: brandId,
          unit: unitId,
          buyingPrice: Number(buyingPrice),
          attributes,
          ...(isAdmin && { owner: ownerId }),
        })
        toast.success("Product updated")
      } else {
        await createProduct({
          category: categoryId,
          brand: brandId,
          unit: unitId,
          buyingPrice: Number(buyingPrice),
          attributes,
          ...(isAdmin && { owner: ownerId }),
        })
        toast.success("Product created")
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const allRequiredFilled = categoryAttributes
    .filter((a) => a.required)
    .every((a) => (attributeValues[a.name] ?? "").trim() !== "")

  const canSubmit = categoryId && brandId && unitId && buyingPrice && allRequiredFilled && !isSubmitting && (!isAdmin || !!ownerId)

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? "Update the product details below."
            : "Fill in the product details. Name and barcode are auto-generated."}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4 max-h-[70vh] overflow-y-auto">
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-category">Category *</Label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select category</option>
            {flatCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.path}
              </option>
            ))}
          </select>
        </div>

        {categoryId && (
          <div className="flex flex-col gap-3">
            <Label>Attributes *</Label>
            {attrsLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              categoryAttributes.map((attr) => (
                <div key={attr.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`attr-${attr.name}`} className="text-xs">
                      {attr.name}
                    </Label>
                    {attr.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {attr.type}
                    </Badge>
                  </div>
                  {attr.type === "select" ? (
                    <select
                      id={`attr-${attr.name}`}
                      value={attributeValues[attr.name] ?? ""}
                      onChange={(e) =>
                        setAttributeValues((prev) => ({ ...prev, [attr.name]: e.target.value }))
                      }
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Select {attr.name}</option>
                      {attr.possibleValues.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={`attr-${attr.name}`}
                      type={attr.type === "number" ? "number" : "text"}
                      placeholder={`Enter ${attr.name}`}
                      value={attributeValues[attr.name] ?? ""}
                      onChange={(e) =>
                        setAttributeValues((prev) => ({ ...prev, [attr.name]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="product-owner">Owner *</Label>
            <select
              id="product-owner"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select owner</option>
              {owners.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="product-brand">Brand *</Label>
          <select
            id="product-brand"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="product-unit">Unit *</Label>
          <select
            id="product-unit"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select unit</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="product-price">Buying Price *</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save Changes"
              : "Create Product"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function ProductForm({
  open,
  onOpenChange,
  mode,
  product,
}: ProductFormProps) {
  const formKey = mode === "edit" && product ? `edit-${product._id}` : "create"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && (
          <ProductFormInner
            key={formKey}
            mode={mode}
            product={product}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
