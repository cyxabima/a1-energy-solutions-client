import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconLayoutDashboard } from "@tabler/icons-react"

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconLayoutDashboard className="size-6 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold">--</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to A1 Energy Solutions. Use the sidebar to navigate to
            different sections.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
