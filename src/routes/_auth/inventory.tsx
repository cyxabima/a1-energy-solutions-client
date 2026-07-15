import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconPackage } from "@tabler/icons-react"

export const Route = createFileRoute("/_auth/inventory")({
  component: InventoryPage,
})

function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconPackage className="size-6 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Inventory</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage your inventory and track stock across owners.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
