import { Link, useLocation } from "@tanstack/react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { IconLayoutDashboard, IconPackage, IconTags, IconAward, IconScale, IconSettings, IconLogout, IconShoppingCart, IconUsers } from "@tabler/icons-react"
import { useAuth } from "@/store/auth"

const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: IconPackage },
  { to: "/products", label: "Products", icon: IconShoppingCart },
]

const catalogNav = [
  { to: "/categories", label: "Categories", icon: IconTags },
  { to: "/brands", label: "Brands", icon: IconAward },
  { to: "/units", label: "Units", icon: IconScale },
]

const systemNav = [
  { to: "/users", label: "Users", icon: IconUsers },
  { to: "/settings", label: "Settings", icon: IconSettings },
]

function SidebarNavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const { state } = useSidebar()
  const { pathname } = useLocation()
  const isActive = pathname === to

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link to={to} />}
        isActive={isActive}
        tooltip={label}
      >
        <Icon />
        {state === "expanded" && <span>{label}</span>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/dashboard" />}
            >
              <img
                src="/logo.png"
                alt="A1 Energy"
                className="size-8 shrink-0 rounded-lg object-contain"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  A1 Energy
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  ERP System
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarNavItem key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {catalogNav.map((item) => (
                <SidebarNavItem key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarNavItem key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={async () => {
                const { logout } = useAuth.getState()
                await logout()
                window.location.href = "/login"
              }}
            >
              <IconLogout />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
