import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/login")({
  component: LoginComponent,
})

function LoginComponent() {
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem("auth", "true")
    navigate({ to: "/dashboard" })
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img
            src="/logo.png"
            alt="A1 Energy"
            className="size-12 rounded-xl object-contain"
          />
          <CardTitle className="font-heading text-xl">
            A1 Energy
          </CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              to="/"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
