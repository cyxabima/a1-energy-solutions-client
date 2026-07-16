import { IconTags, IconFolder, IconLink } from "@tabler/icons-react"
import { useCategories } from "@/store/categories"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryDetail() {
  const { selectedCategory: category, ancestors, isDetailLoading } = useCategories()

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
        <div className="flex items-center gap-2">
          <IconTags className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Attributes</h3>
          <Badge variant="secondary" className="text-xs">
            {category.attributes.length}
          </Badge>
        </div>

        {category.attributes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attributes defined yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {category.attributes.map((attr) => (
              <div
                key={attr.name}
                className="flex items-center justify-between rounded-lg border p-3"
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
              </div>
            ))}
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
    </div>
  )
}
