import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAuth } from "@/store/auth"

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const { getState } = useAuth
    const { isInitialized } = getState()

    if (!isInitialized) {
      await getState().fetchUser()
    }

    const { user, isInitialized: nowInitialized } = getState()
    if (nowInitialized && !user) {
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

// NOTE: ZUSTAND NOTES: Why use .getState() instead of useAuth()?
// You are inside TanStack Router's beforeLoad property. This is a standard asynchronous JavaScript function executing during the routing lifecycle, not inside a React component's render tree.
// If you tried to call useAuth() here, React would throw a Rules of Hooks error. React strict limits hook execution to functional components and custom hooks.
// Zustand explicitly provides .getState() and .setState() for this exact architectural need: interacting with your global store from outside the React context, such as inside routers, Axios interceptors, or background workers.
