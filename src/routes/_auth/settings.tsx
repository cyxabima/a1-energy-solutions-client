import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSettings } from "@tabler/icons-react"

export const Route = createFileRoute("/_auth/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconSettings className="size-6 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure application settings and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
