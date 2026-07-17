import { useEffect, useState, useCallback } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  IconUsers,
  IconPencil,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { getUsers, updateUser } from "@/services/user"
import type { User } from "@/services/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const Route = createFileRoute("/_auth/users")({
  component: UsersPage,
})

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [editUser, setEditUser] = useState<User | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchUsers = useCallback(async (page = 1, searchQuery = "") => {
    setIsLoading(true)
    try {
      const params: { page: number; limit: number; search?: string } = { page, limit: 20 }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const data = await getUsers(params)
      setUsers(data.users)
      setPagination(data.pagination)
    } catch {
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(1, search)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, fetchUsers])

  function openEdit(user: User) {
    setEditUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditRole(user.role)
  }

  async function handleSave() {
    if (!editUser || !editName.trim() || !editEmail.trim() || !editRole) return
    setIsSaving(true)
    try {
      const updated = await updateUser(editUser._id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
      })
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
      toast.success("User updated")
      setEditUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setIsSaving(false)
    }
  }

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  function roleBadgeColor(role: string) {
    switch (role) {
      case "ADMIN": return "default"
      case "OWNER": return "secondary"
      default: return "outline"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconUsers className="size-6 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Users</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <IconUsers className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeColor(user.role) as "default" | "secondary" | "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(user)}
                    >
                      <IconPencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1, search)}
            >
              <IconChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1, search)}
            >
              Next
              <IconChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user details below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-role">Role *</Label>
              <select
                id="edit-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select role</option>
                <option value="ADMIN">ADMIN</option>
                <option value="OWNER">OWNER</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSave}
              disabled={!editName.trim() || !editEmail.trim() || !editRole || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
