import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { IconX } from "@tabler/icons-react"
import { useCategories } from "@/store/categories"
import type { CategoryAttribute } from "@/services/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AttributeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  categoryId: string
  attributeIndex?: number
}

function AttributeFormInner({
  mode,
  categoryId,
  attributeIndex,
  onOpenChange,
}: {
  mode: "add" | "edit"
  categoryId: string
  attributeIndex?: number
  onOpenChange: (open: boolean) => void
}) {
  const { selectedCategory, updateAttributes } = useCategories()
  const existingAttr = mode === "edit" && attributeIndex != null
    ? selectedCategory?.attributes[attributeIndex]
    : null

  const [name, setName] = useState(existingAttr?.name ?? "")
  const [type, setType] = useState<"select" | "text" | "number">(existingAttr?.type ?? "text")
  const [required, setRequired] = useState(existingAttr?.required ?? false)
  const [possibleValues, setPossibleValues] = useState<string[]>(existingAttr?.possibleValues ?? [])
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const addTag = useCallback(() => {
    const value = tagInput.trim()
    if (value && !possibleValues.includes(value)) {
      setPossibleValues((prev) => [...prev, value])
      setTagInput("")
    }
  }, [tagInput, possibleValues])

  const removeTag = useCallback((value: string) => {
    setPossibleValues((prev) => prev.filter((v) => v !== value))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const currentAttributes = selectedCategory?.attributes ?? []
    let updatedAttributes: CategoryAttribute[]

    const newAttr: CategoryAttribute = {
      name: trimmedName,
      type,
      required,
      possibleValues: type === "select" ? possibleValues : [],
    }

    if (mode === "edit" && attributeIndex != null) {
      updatedAttributes = currentAttributes.map((attr, i) =>
        i === attributeIndex ? newAttr : attr
      )
    } else {
      updatedAttributes = [...currentAttributes, newAttr]
    }

    setIsSubmitting(true)
    try {
      await updateAttributes(categoryId, updatedAttributes)
      toast.success(mode === "edit" ? "Attribute updated" : "Attribute added")
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
          {mode === "edit" ? "Edit Attribute" : "Add Attribute"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? "Update the attribute details below."
            : "Define a new attribute for this category."}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="attr-name">Name *</Label>
          <Input
            id="attr-name"
            placeholder="e.g. Brand, Power Rating, IP Rating"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="attr-type">Type *</Label>
          <select
            id="attr-type"
            value={type}
            onChange={(e) => setType(e.target.value as "select" | "text" | "number")}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="attr-required">Required</Label>
          <Switch
            id="attr-required"
            checked={required}
            onCheckedChange={setRequired}
          />
        </div>
        {type === "select" && (
          <div className="flex flex-col gap-2">
            <Label>Possible Values</Label>
            <div className="flex flex-wrap gap-1.5">
              {possibleValues.map((val) => (
                <Badge key={val} variant="secondary" className="gap-1 pr-1">
                  {val}
                  <button
                    type="button"
                    onClick={() => removeTag(val)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <IconX className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              ref={tagInputRef}
              placeholder="Type a value and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save Changes"
              : "Add Attribute"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AttributeForm({
  open,
  onOpenChange,
  mode,
  categoryId,
  attributeIndex,
}: AttributeFormProps) {
  const formKey = mode === "edit" && attributeIndex != null
    ? `edit-${attributeIndex}`
    : `add-${categoryId}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <AttributeFormInner
            key={formKey}
            mode={mode}
            categoryId={categoryId}
            attributeIndex={attributeIndex}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
