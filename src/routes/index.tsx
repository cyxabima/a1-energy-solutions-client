import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { IconLogin, IconDashboard } from "@tabler/icons-react"

export const Route = createFileRoute("/")({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <img
          src="/logo.png"
          alt="A1 Energy Solutions"
          className="size-20 rounded-2xl object-contain"
        />
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            A1 Energy Solutions
          </h1>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Your complete inventory management system. Track products, manage
            categories, and handle multi-owner inventory with ease.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button render={<Link to="/login" />}>
          <IconLogin data-icon="inline-start" />
          Login
        </Button>
        <Button variant="outline" render={<Link to="/dashboard" />}>
          <IconDashboard data-icon="inline-start" />
          Dashboard
        </Button>
      </div>
    </div>
  )
}
