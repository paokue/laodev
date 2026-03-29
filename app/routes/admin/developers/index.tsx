import { toast } from "sonner"
import { prisma } from "@/lib/prisma"
import { useFetcher, useSearchParams, useNavigate } from "react-router"
import { useState, useEffect, useCallback } from "react"
import type { Route } from "./+types/index"
import { requireAdmin } from "@/lib/admin-session.server"

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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataTable, Column, FilterOption, type ServerParams } from "@/components/admin/data-table"


import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Briefcase,
  Clock,
  UserRoundX,
  UserCheck,
  Users,
  Ban,
  Trash2,
} from "lucide-react"
import { Developer } from "@/interface/developer"
import { formatExperience, timeAgo } from "@/utils/functions"
import { getStatusBadge } from "./components/getStatusBadge"


const PAGE_SIZE = 10

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const url = new URL(request.url)
  const search = url.searchParams.get("search") || ""
  const statusFilter = url.searchParams.get("status") || ""
  const locationFilter = url.searchParams.get("location") || ""
  const experienceFilter = url.searchParams.get("experience") || ""
  const sortKey = url.searchParams.get("sortKey") || ""
  const sortDir = url.searchParams.get("sortDir") || "asc"
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))

  // Build where clause
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { title: { contains: search, mode: "insensitive" } },
    ]
  }

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter.toUpperCase()
  }

  if (locationFilter && locationFilter !== "all") {
    where.location = { contains: locationFilter, mode: "insensitive" }
  }

  if (experienceFilter && experienceFilter !== "all") {
    const [min, max] = experienceFilter === "11"
      ? [11, 100]
      : experienceFilter.split("-").map(Number)
    where.experience = { gte: min, lte: max }
  }

  // Build orderBy
  let orderBy: Record<string, unknown> = { createdAt: "desc" }
  if (sortKey) {
    const dir = sortDir === "desc" ? "desc" : "asc"
    if (sortKey === "name") {
      orderBy = { user: { name: dir } }
    } else if (["hourlyRate", "experience", "status"].includes(sortKey)) {
      orderBy = { [sortKey]: dir }
    } else if (sortKey === "location") {
      orderBy = { location: dir }
    }
  }

  const [developers, totalCount, totalAll, pendingCount, activeCount, rejectedCount, suspendedCount] = await Promise.all([
    prisma.developer.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        location: true,
        skills: true,
        experience: true,
        hourlyRate: true,
        status: true,
        rating: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            bio: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    }),
    prisma.developer.count({ where }),
    prisma.developer.count(),
    prisma.developer.count({ where: { status: "PENDING" } }),
    prisma.developer.count({ where: { status: "ACTIVE" } }),
    prisma.developer.count({ where: { status: "REJECTED" } }),
    prisma.developer.count({ where: { status: "SUSPENDED" } }),
  ])

  return {
    developers: developers.map((dev) => ({
      id: dev.id,
      name: dev.user.name,
      email: dev.user.email,
      title: dev.title,
      location: dev.location || "",
      skills: dev.skills,
      experience: formatExperience(dev.experience),
      hourlyRate: dev.hourlyRate,
      bio: dev.user.bio || "",
      appliedAt: timeAgo(new Date(dev.createdAt)),
      status: dev.status.toLowerCase() as Developer["status"],
      bookings: dev._count.bookings,
      rating: dev.rating,
    })),
    totalCount,
    totalAll,
    pendingCount,
    activeCount,
    rejectedCount,
    suspendedCount,
    // Pass back current params for DataTable initial state
    params: {
      search,
      status: statusFilter,
      location: locationFilter,
      experience: experienceFilter,
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
  const developerId = String(formData.get("developerId"))

  if (!developerId) {
    return { error: "Developer ID is required" }
  }

  if (intent === "approve") {
    await prisma.developer.update({
      where: { id: developerId },
      data: { status: "ACTIVE" },
    })
    return { success: "Developer approved" }
  }

  if (intent === "reject") {
    await prisma.developer.update({
      where: { id: developerId },
      data: { status: "REJECTED" },
    })
    return { success: "Developer rejected" }
  }

  if (intent === "suspend") {
    await prisma.developer.update({
      where: { id: developerId },
      data: { status: "SUSPENDED" },
    })
    return { success: "Developer suspended" }
  }

  if (intent === "activate") {
    await prisma.developer.update({
      where: { id: developerId },
      data: { status: "ACTIVE" },
    })
    return { success: "Developer activated" }
  }

  if (intent === "delete") {
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { userId: true },
    })
    if (developer) {
      await prisma.developer.delete({ where: { id: developerId } })
      await prisma.user.delete({ where: { id: developer.userId } })
    }
    return { success: "Developer deleted" }
  }

  return { error: "Invalid action" }
}

export default function AdminDevelopersPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const fetcher = useFetcher<typeof action>()

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setSelectedDeveloper(null)
      setShowRejectDialog(false)
      setShowSuspendDialog(false)
      setShowActivateDialog(false)
      setShowDeleteDialog(false)
      setRejectReason("")
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const handleApprove = (id: string) => {
    fetcher.submit(
      { intent: "approve", developerId: id },
      { method: "post" }
    )
  }

  const handleReject = () => {
    if (selectedDeveloper) {
      fetcher.submit(
        { intent: "reject", developerId: selectedDeveloper.id },
        { method: "post" }
      )
    }
  }

  const handleSuspend = () => {
    if (selectedDeveloper) {
      fetcher.submit(
        { intent: "suspend", developerId: selectedDeveloper.id },
        { method: "post" }
      )
    }
  }

  const handleActivate = () => {
    if (selectedDeveloper) {
      fetcher.submit(
        { intent: "activate", developerId: selectedDeveloper.id },
        { method: "post" }
      )
    }
  }

  const handleDelete = () => {
    if (selectedDeveloper) {
      fetcher.submit(
        { intent: "delete", developerId: selectedDeveloper.id },
        { method: "post" }
      )
    }
  }

  const { developers: localDevelopers, totalCount, totalAll, pendingCount, activeCount, rejectedCount, suspendedCount, params } = loaderData

  const handleParamsChange = useCallback((p: ServerParams) => {
    const sp = new URLSearchParams()
    if (p.search) sp.set("search", p.search)
    if (p.filters.status && p.filters.status !== "all") sp.set("status", p.filters.status)
    if (p.filters.location && p.filters.location !== "all") sp.set("location", p.filters.location)
    if (p.filters.experience && p.filters.experience !== "all") sp.set("experience", p.filters.experience)
    if (p.sort) {
      sp.set("sortKey", p.sort.key)
      sp.set("sortDir", p.sort.direction)
    }
    if (p.page > 1) sp.set("page", String(p.page))
    setSearchParams(sp)
  }, [setSearchParams])

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "active", label: "Active" },
        { value: "rejected", label: "Rejected" },
        { value: "suspended", label: "Suspended" },
      ],
    },
    {
      key: "location",
      label: "Location",
      options: [
        { value: "Vientiane", label: "Vientiane" },
        { value: "Luang Prabang", label: "Luang Prabang" },
        { value: "Savannakhet", label: "Savannakhet" },
        { value: "Pakse", label: "Pakse" },
      ],
    },
    {
      key: "experience",
      label: "Experience",
      options: [
        { value: "1-2", label: "1-2 years" },
        { value: "3-5", label: "3-5 years" },
        { value: "5-7", label: "5-7 years" },
        { value: "7-10", label: "7-10 years" },
        { value: "11", label: "> 10 years" },
      ],
    },
  ]

  const columns: Column<Developer>[] = [
    {
      key: "name",
      label: "Developer",
      sortable: true,
      render: (dev) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {dev.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{dev.name}</p>
            <p className="text-sm text-white">{dev.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (dev) => (
        <span className="text-sm text-white">{dev.email}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (dev) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4 text-white" />
          {dev.location}
        </div>
      ),
    },
    {
      key: "experience",
      label: "Experience",
      sortable: true,
      render: (dev) => (
        <div className="flex items-center gap-1 text-sm">
          <Briefcase className="h-4 w-4 text-white" />
          {dev.experience} yrs
        </div>
      ),
    },
    {
      key: "hourlyRate",
      label: "Rate",
      sortable: true,
      render: (dev) => (
        <span className="font-medium text-primary">{dev.hourlyRate} Kip/hr</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (dev) => getStatusBadge(dev.status),
    },
  ]

  const renderMobileCard = (dev: Developer) => (
    <Card key={dev.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {dev.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{dev.name}</p>
              <p className="text-sm text-white">{dev.title}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/admin/developers/${dev.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              {dev.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleApprove(dev.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedDeveloper(dev)
                      setShowRejectDialog(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              {dev.status === "active" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSelectedDeveloper(dev); setShowSuspendDialog(true) }}>
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                </>
              )}
              {dev.status === "suspended" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSelectedDeveloper(dev); setShowActivateDialog(true) }}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => { setSelectedDeveloper(dev); setShowDeleteDialog(true) }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {dev.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {dev.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{dev.skills.length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {getStatusBadge(dev.status)}
          <span className="font-semibold text-primary">{dev.hourlyRate} Kip/hr</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1 text-white">
            <MapPin className="h-4 w-4" />
            {dev.location}
          </div>
          <div className="flex items-center gap-1 text-white">
            <Briefcase className="h-4 w-4" />
            {dev.experience} years
          </div>
        </div>

        {dev.status === "pending" && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedDeveloper(dev)
                setShowRejectDialog(true)
              }}
            >
              Reject
            </Button>
            <Button size="sm" className="flex-1" onClick={() => handleApprove(dev.id)}>
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Stats

  return (
    <div className="p-2 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
        <p className="text-white">
          Review and manage developer applications
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-white">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
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
                <p className="text-sm text-white">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Ban className="h-5 w-5 text-orange-500" />
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
        data={localDevelopers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search developers by name..."
        filters={filters}
        pageSize={PAGE_SIZE}
        renderMobileCard={renderMobileCard}
        serverSide
        totalItems={totalCount}
        onParamsChange={handleParamsChange}
        initialSearch={params.search}
        initialFilters={{
          status: params.status,
          location: params.location,
          experience: params.experience,
        }}
        initialPage={params.page}
        initialSort={params.sortKey ? { key: params.sortKey, direction: params.sortDir as "asc" | "desc" } : null}
        actions={(dev) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/admin/developers/${dev.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              {dev.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleApprove(dev.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedDeveloper(dev)
                      setShowRejectDialog(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              {dev.status === "active" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSelectedDeveloper(dev); setShowSuspendDialog(true) }}>
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                </>
              )}
              {dev.status === "suspended" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSelectedDeveloper(dev); setShowActivateDialog(true) }}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => { setSelectedDeveloper(dev); setShowDeleteDialog(true) }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Developer</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{selectedDeveloper?.name}</strong>? They will not be visible to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              Suspend Developer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Developer</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate <strong>{selectedDeveloper?.name}</strong>? They will be visible to users again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleActivate}>
              Activate Developer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Developer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedDeveloper?.name}</strong>? This will permanently remove their account and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Developer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
