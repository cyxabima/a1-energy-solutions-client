import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { useAuth } from "@/store/auth"

export const Route = createFileRoute("/_guest")({
  beforeLoad: async () => {
    const { getState } = useAuth
    const { isInitialized } = getState()

    if (!isInitialized) {
      await getState().fetchUser()
    }

    const { user } = getState()
    if (user) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: GuestLayout,
})

function GuestLayout() {
  return <Outlet />
}
