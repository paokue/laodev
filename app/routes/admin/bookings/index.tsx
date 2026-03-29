import { useState, useEffect, useCallback } from "react"
import { useFetcher, useSearchParams } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { DataTable, Column, FilterOption, type ServerParams } from "@/components/admin/data-table"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-session.server"
import { toast } from "sonner"
import type { Route } from "./+types/index"
import {
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  User,
  Code2,
  CheckCircle2,
  XCircle,
  Loader,
  CalendarCheck,
  CalendarX,
  CalendarClock,
} from "lucide-react"

interface BookingItem {
  id: string
  client: string
  clientEmail: string
  developer: string
  developerEmail: string
  topic: string
  description: string
  date: string
  time: string
  duration: number
  amount: number
  status: string
  createdAt: string
}

const PAGE_SIZE = 10

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
    case "CONFIRMED":
      return (
        <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Confirmed
        </Badge>
      )
    case "COMPLETED":
      return (
        <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} mins`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const url = new URL(request.url)
  const search = url.searchParams.get("search") || ""
  const statusFilter = url.searchParams.get("status") || ""
  const dateFrom = url.searchParams.get("dateFrom") || ""
  const dateTo = url.searchParams.get("dateTo") || ""
  const sortKey = url.searchParams.get("sortKey") || ""
  const sortDir = url.searchParams.get("sortDir") || "asc"
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))

  // Build where clause
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { topic: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { developer: { user: { name: { contains: search, mode: "insensitive" } } } },
    ]
  }

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter
  }

  if (dateFrom || dateTo) {
    where.date = {}
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59.999Z")
  }

  // Build orderBy
  let orderBy: Record<string, unknown> = { createdAt: "desc" }
  if (sortKey) {
    const dir = sortDir === "desc" ? "desc" : "asc"
    if (["date", "amount", "status", "createdAt", "duration"].includes(sortKey)) {
      orderBy = { [sortKey]: dir }
    } else if (sortKey === "client") {
      orderBy = { user: { name: dir } }
    } else if (sortKey === "developer") {
      orderBy = { developer: { user: { name: dir } } }
    }
  }

  const [bookings, totalCount, pendingCount, confirmedCount, completedCount, cancelledCount] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        topic: true,
        description: true,
        date: true,
        time: true,
        duration: true,
        amount: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        developer: { select: { user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
  ])

  return {
    bookings: bookings.map((b) => ({
      id: b.id,
      client: b.user.name,
      clientEmail: b.user.email,
      developer: b.developer.user.name,
      developerEmail: b.developer.user.email,
      topic: b.topic,
      description: b.description || "",
      date: new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: b.time,
      duration: b.duration,
      amount: b.amount,
      status: b.status,
      createdAt: new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    })),
    totalCount,
    stats: { pendingCount, confirmedCount, completedCount, cancelledCount },
    params: { search, status: statusFilter, dateFrom, dateTo, sortKey, sortDir, page },
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request)
  const formData = await request.formData()
  const intent = String(formData.get("intent"))
  const bookingId = String(formData.get("bookingId"))

  if (!bookingId) return { error: "Booking ID is required" }

  if (intent === "confirm") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    })
    return { success: "Booking confirmed" }
  }

  if (intent === "complete") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    })
    return { success: "Booking marked as complete" }
  }

  if (intent === "cancel") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })
    return { success: "Booking cancelled" }
  }

  return { error: "Invalid action" }
}

export default function AdminBookingsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const fetcher = useFetcher<typeof action>()

  const { bookings: localBookings, totalCount, stats, params } = loaderData
  const isProcessing = fetcher.state !== "idle"

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setSelectedBooking(null)
      setShowConfirmDialog(false)
      setShowCompleteDialog(false)
      setShowCancelDialog(false)
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const handleAction = (intent: string) => {
    if (selectedBooking) {
      fetcher.submit({ intent, bookingId: selectedBooking.id }, { method: "post" })
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
    if (p.filters.dateFrom) sp.set("dateFrom", p.filters.dateFrom)
    if (p.filters.dateTo) sp.set("dateTo", p.filters.dateTo)
    setSearchParams(sp)
  }, [setSearchParams])

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "PENDING", label: "Pending" },
        { value: "CONFIRMED", label: "Confirmed" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
    },
    {
      key: "date",
      label: "Booking Date",
      type: "dateRange" as const,
      options: [],
    },
  ]

  const renderDropdownActions = (booking: BookingItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
          <Eye className="mr-2 h-4 w-4" />View Details
        </DropdownMenuItem>
        {booking.status === "PENDING" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setShowConfirmDialog(true) }}>
              <CheckCircle2 className="mr-2 h-4 w-4" />Confirm
            </DropdownMenuItem>
          </>
        )}
        {booking.status === "CONFIRMED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setShowCompleteDialog(true) }}>
              <CheckCircle2 className="mr-2 h-4 w-4" />Mark Complete
            </DropdownMenuItem>
          </>
        )}
        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => { setSelectedBooking(booking); setShowCancelDialog(true) }}
            >
              <XCircle className="mr-2 h-4 w-4" />Cancel
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columns: Column<BookingItem>[] = [
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-secondary">
              {b.client.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{b.client}</p>
            <p className="text-xs text-white">{b.clientEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "developer",
      label: "Developer",
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {b.developer.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{b.developer}</span>
        </div>
      ),
    },
    {
      key: "topic",
      label: "Topic",
      render: (b) => (
        <div className="max-w-[180px]">
          <p className="truncate text-sm">{b.topic}</p>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date & Time",
      sortable: true,
      render: (b) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-white" />
            {b.date}
          </div>
          <div className="flex items-center gap-1 text-white">
            <Clock className="h-3 w-3" />
            {b.time} ({formatDuration(b.duration)})
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (b) => (
        <span className="font-semibold text-primary">{b.amount.toLocaleString()} Kip</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (b) => getStatusBadge(b.status),
    },
  ]

  const renderMobileCard = (b: BookingItem) => (
    <Card key={b.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{b.topic}</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Calendar className="h-4 w-4 text-white" />
              <span>{b.date}</span>
              <Clock className="h-4 w-4 text-white" />
              <span>{b.time}</span>
            </div>
          </div>
          {renderDropdownActions(b)}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white" />
              <div>
                <p className="text-xs text-white">Client</p>
                <p className="text-sm font-medium">{b.client}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <div className="text-right">
                <p className="text-xs text-white">Developer</p>
                <p className="text-sm font-medium">{b.developer}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            {getStatusBadge(b.status)}
            <span className="text-lg font-bold text-primary">{b.amount.toLocaleString()} Kip</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-white">Manage all consultation bookings</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <CalendarClock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-white">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <CalendarCheck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-white">Confirmed</p>
                <p className="text-2xl font-bold">{stats.confirmedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-white">Completed</p>
                <p className="text-2xl font-bold">{stats.completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <CalendarX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-white">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={localBookings}
        columns={columns}
        searchKey="client"
        searchPlaceholder="Search by client, developer, or topic..."
        filters={filters}
        pageSize={PAGE_SIZE}
        renderMobileCard={renderMobileCard}
        serverSide
        totalItems={totalCount}
        onParamsChange={handleParamsChange}
        initialSearch={params.search}
        initialFilters={{ status: params.status, dateFrom: params.dateFrom, dateTo: params.dateTo }}
        initialPage={params.page}
        initialSort={params.sortKey ? { key: params.sortKey, direction: params.sortDir as "asc" | "desc" } : null}
        actions={renderDropdownActions}
      />

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedBooking && !showConfirmDialog && !showCompleteDialog && !showCancelDialog}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>View and manage booking information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedBooking.status)}
                  <span className="text-2xl font-bold text-primary">{selectedBooking.amount.toLocaleString()} Kip</span>
                </div>

                <div className="p-3 rounded-lg border border-border">
                  <p className="font-medium">{selectedBooking.topic}</p>
                  {selectedBooking.description && (
                    <p className="text-sm text-white mt-1">{selectedBooking.description}</p>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <User className="h-4 w-4" />
                      Client
                    </div>
                    <p className="mt-1 font-medium">{selectedBooking.client}</p>
                    <p className="text-sm text-white">{selectedBooking.clientEmail}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <Code2 className="h-4 w-4" />
                      Developer
                    </div>
                    <p className="mt-1 font-medium">{selectedBooking.developer}</p>
                    <p className="text-sm text-white">{selectedBooking.developerEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-white" />
                    <span>{selectedBooking.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white" />
                    <span>{selectedBooking.time} ({formatDuration(selectedBooking.duration)})</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
                {selectedBooking.status === "PENDING" && (
                  <Button onClick={() => setShowConfirmDialog(true)}>Confirm</Button>
                )}
                {selectedBooking.status === "CONFIRMED" && (
                  <Button onClick={() => setShowCompleteDialog(true)}>Mark Complete</Button>
                )}
                {(selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED") && (
                  <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>Cancel</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => { setShowConfirmDialog(open); if (!open) setSelectedBooking(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Confirm the booking for <strong>{selectedBooking?.client}</strong> with <strong>{selectedBooking?.developer}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowConfirmDialog(false); setSelectedBooking(null) }} disabled={isProcessing}>Cancel</Button>
            <Button onClick={() => handleAction("confirm")} disabled={isProcessing}>
              {isProcessing ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={(open) => { setShowCompleteDialog(open); if (!open) setSelectedBooking(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Complete</DialogTitle>
            <DialogDescription>
              Mark the booking between <strong>{selectedBooking?.client}</strong> and <strong>{selectedBooking?.developer}</strong> as completed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCompleteDialog(false); setSelectedBooking(null) }} disabled={isProcessing}>Cancel</Button>
            <Button onClick={() => handleAction("complete")} disabled={isProcessing}>
              {isProcessing ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Mark Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={(open) => { setShowCancelDialog(open); if (!open) setSelectedBooking(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the booking for <strong>{selectedBooking?.client}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCancelDialog(false); setSelectedBooking(null) }} disabled={isProcessing}>Back</Button>
            <Button variant="destructive" onClick={() => handleAction("cancel")} disabled={isProcessing}>
              {isProcessing ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
