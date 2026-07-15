import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    // TODO: replace with real auth check
    const isAuthenticated = localStorage.getItem("auth")
    if (!isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
