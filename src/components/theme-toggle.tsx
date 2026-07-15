import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { IconSun, IconMoon } from "@tabler/icons-react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <IconSun /> : <IconMoon />}
    </Button>
  )
}
