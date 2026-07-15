import { Link, useMatches } from "@tanstack/react-router"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/theme-toggle"
import { IconUser } from "@tabler/icons-react"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  categories: "Categories",
  brands: "Brands",
  units: "Units",
  settings: "Settings",
}

export function AppHeader() {
  const matches = useMatches()

  const breadcrumbs = matches
    .filter((match) => match.pathname !== "/")
    .map((match) => {
      const segment = match.pathname.split("/").filter(Boolean).pop() ?? ""
      const label = routeLabels[segment] ?? segment
      return { pathname: match.pathname, label }
    })

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/dashboard" />}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((bc, i) => (
            <BreadcrumbItem key={bc.pathname}>
              <BreadcrumbSeparator />
              {i === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{bc.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link to={bc.pathname} />}>
                  {bc.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <IconUser className="size-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
