import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconAward } from "@tabler/icons-react"

export const Route = createFileRoute("/_auth/brands")({
  component: BrandsPage,
})

function BrandsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconAward className="size-6 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Brands</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Brand Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage standalone brand entities used across all categories.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
