import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconTags } from "@tabler/icons-react"

export const Route = createFileRoute("/_auth/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconTags className="size-6 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Categories</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Define product categories and their attribute schemas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
