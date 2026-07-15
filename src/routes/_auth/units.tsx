import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconScale } from "@tabler/icons-react"

export const Route = createFileRoute("/_auth/units")({
  component: UnitsPage,
})

function UnitsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconScale className="size-6 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Units</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Unit Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage standalone unit entities used across all categories.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
