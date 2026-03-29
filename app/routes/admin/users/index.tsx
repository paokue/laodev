import { toast } from "sonner"
import { prisma } from "@/lib/prisma"
import { useFetcher, useSearchParams } from "react-router"
import { useState, useEffect, useCallback } from "react"
import type { Route } from "./+types/index"
import { requireAdmin } from "@/lib/admin-session.server"
import { timeAgo } from "@/utils/functions"

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable, Column, FilterOption, type ServerParams } from "@/components/admin/data-table"

import {
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle2,
  MapPin,
  Trash2,
  Users,
  UserCheck,
  UserRoundX,
  Clock,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  status: string
  address: string
  joinedAt: string
  bookings: number
  walletBalance: number
}

const PAGE_SIZE = 10

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const url = new URL(request.url)
  const search = url.searchParams.get("search") || ""
  const statusFilter = url.searchParams.get("status") || ""
  const sortKey = url.searchParams.get("sortKey") || ""
  const sortDir = url.searchParams.get("sortDir") || "asc"
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))

  // Build where clause — only USER role (no developers)
  const where: Record<string, unknown> = {
    role: "USER",
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter
  }

  // Build orderBy
  let orderBy: Record<string, unknown> = { createdAt: "desc" }
  if (sortKey) {
    const dir = sortDir === "desc" ? "desc" : "asc"
    if (["name", "email", "status"].includes(sortKey)) {
      orderBy = { [sortKey]: dir }
    }
  }

  const [users, totalCount, totalAll, activeCount, suspendedCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        address: true,
        createdAt: true,
        bookingsAsUser: { select: { id: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", status: { not: "suspended" } } }),
    prisma.user.count({ where: { role: "USER", status: "suspended" } }),
  ])

  // Get wallet balances
  const userIds = users.map((u) => u.id)
  const wallets = await prisma.wallet.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, balance: true },
  })
  const walletMap = new Map(wallets.map((w) => [w.userId, w.balance]))

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      status: u.status || "active",
      address: u.address || "",
      joinedAt: timeAgo(new Date(u.createdAt)),
      bookings: u.bookingsAsUser.length,
      walletBalance: walletMap.get(u.id) || 0,
    })),
    totalCount,
    totalAll,
    activeCount,
    suspendedCount,
    params: {
      search,
      status: statusFilter,
      sortKey,
      sortDir,
      page,
    },
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request)
  const formData = await request.formData()
  const intent = String(formData.get("intent"))
  const userId = String(formData.get("userId"))

  if (!userId) return { error: "User ID is required" }

  if (intent === "suspend") {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "suspended" },
    })
    return { success: "User suspended" }
  }

  if (intent === "activate") {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "active" },
    })
    return { success: "User activated" }
  }

  if (intent === "delete") {
    await prisma.user.delete({ where: { id: userId } })
    return { success: "User deleted" }
  }

  return { error: "Invalid action" }
}

export default function AdminUsersPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const fetcher = useFetcher<typeof action>()

  const { users: localUsers, totalCount, totalAll, activeCount, suspendedCount, params } = loaderData

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setSelectedUser(null)
      setShowDeleteDialog(false)
      setShowSuspendDialog(false)
      setShowActivateDialog(false)
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const handleSuspend = () => {
    if (selectedUser) {
      fetcher.submit({ intent: "suspend", userId: selectedUser.id }, { method: "post" })
    }
  }

  const handleActivate = () => {
    if (selectedUser) {
      fetcher.submit({ intent: "activate", userId: selectedUser.id }, { method: "post" })
    }
  }

  const handleDelete = () => {
    if (selectedUser) {
      fetcher.submit({ intent: "delete", userId: selectedUser.id }, { method: "post" })
    }
  }

  const handleParamsChange = useCallback((p: ServerParams) => {
    const sp = new URLSearchParams()
    if (p.search) sp.set("search", p.search)
    if (p.filters.status && p.filters.status !== "all") sp.set("status", p.filters.status)
    if (p.sort) {
      sp.set("sortKey", p.sort.key)
      sp.set("sortDir", p.sort.direction)
    }
    if (p.page > 1) sp.set("page", String(p.page))
    setSearchParams(sp)
  }, [setSearchParams])

  const getStatusBadge = (status: string) => {
    if (status === "suspended") {
      return (
        <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
          <Ban className="mr-1 h-3 w-3" />
          Suspended
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Active
      </Badge>
    )
  }

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ]

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {user.avatar ? <AvatarImage src={user.avatar} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (user) => getStatusBadge(user.status),
    },
    {
      key: "address",
      label: "Address",
      render: (user) => user.address ? (
        <div className="flex items-center gap-1 text-white">
          <MapPin className="h-4 w-4" />
          {user.address}
        </div>
      ) : <span className="text-white">-</span>,
    },
    {
      key: "bookings",
      label: "Bookings",
      sortable: true,
      render: (user) => user.bookings,
    },
    {
      key: "walletBalance",
      label: "Wallet",
      sortable: true,
      render: (user) => (
        <span className="font-medium">{user.walletBalance.toLocaleString()} Kip</span>
      ),
    },
    {
      key: "joinedAt",
      label: "Joined",
      render: (user) => (
        <span className="text-white">{user.joinedAt}</span>
      ),
    },
  ]

  const renderMobileCard = (user: User) => (
    <Card key={user.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user.avatar ? <AvatarImage src={user.avatar} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-white">{user.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowDetailDialog(true) }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status !== "suspended" ? (
                <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowSuspendDialog(true) }}>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowActivateDialog(true) }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => { setSelectedUser(user); setShowDeleteDialog(true) }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {getStatusBadge(user.status)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white">Address</p>
            <p className="font-medium">{user.address || "-"}</p>
          </div>
          <div>
            <p className="text-white">Bookings</p>
            <p className="font-medium">{user.bookings}</p>
          </div>
          <div>
            <p className="text-white">Wallet</p>
            <p className="font-medium">{user.walletBalance.toLocaleString()} Kip</p>
          </div>
          <div>
            <p className="text-white">Joined</p>
            <p className="font-medium">{user.joinedAt}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-white">Manage all registered users</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white">Total</p>
                <p className="text-2xl font-bold">{totalAll}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-white">Active</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <UserRoundX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-white">Suspended</p>
                <p className="text-2xl font-bold">{suspendedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={localUsers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search users by name..."
        filters={filters}
        pageSize={PAGE_SIZE}
        renderMobileCard={renderMobileCard}
        serverSide
        totalItems={totalCount}
        onParamsChange={handleParamsChange}
        initialSearch={params.search}
        initialFilters={{ status: params.status }}
        initialPage={params.page}
        initialSort={params.sortKey ? { key: params.sortKey, direction: params.sortDir as "asc" | "desc" } : null}
        actions={(user) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowDetailDialog(true) }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status !== "suspended" ? (
                <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowSuspendDialog(true) }}>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowActivateDialog(true) }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => { setSelectedUser(user); setShowDeleteDialog(true) }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* User Detail Dialog */}
      <Dialog open={showDetailDialog && !!selectedUser} onOpenChange={(open) => { setShowDetailDialog(open); if (!open) setSelectedUser(null) }}>
        <DialogContent className="max-w-lg">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>View user information</DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    {selectedUser.avatar ? <AvatarImage src={selectedUser.avatar} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedUser.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-white">{selectedUser.email}</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-white">Address</p>
                    <p className="font-medium mt-1">{selectedUser.address || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-white">Joined</p>
                    <p className="font-medium mt-1">{selectedUser.joinedAt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                  <div className="text-center">
                    <p className="text-sm text-white">Bookings</p>
                    <p className="text-2xl font-bold">{selectedUser.bookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white">Wallet Balance</p>
                    <p className="text-2xl font-bold text-primary">{selectedUser.walletBalance.toLocaleString()} Kip</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedUser.status !== "suspended" ? (
                  <Button
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => { setShowDetailDialog(false); setShowSuspendDialog(true) }}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                ) : (
                  <Button
                    onClick={() => { setShowDetailDialog(false); setShowActivateDialog(true) }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => { setShowDetailDialog(false); setShowDeleteDialog(true) }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{selectedUser?.name}</strong>? They will not be able to access their account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate <strong>{selectedUser?.name}</strong>? They will regain access to their account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleActivate}>
              Activate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
