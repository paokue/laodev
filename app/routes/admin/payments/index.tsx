import { useState, useEffect, useCallback } from "react"
import { useFetcher, useSearchParams } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
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
import { sendTopUpStatusEmail } from "@/lib/mailer"
import { toast } from "sonner"
import type { Route } from "./+types/index"
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  DollarSign,
  Wallet,
  Clock,
  Loader,
  Coffee,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface PaymentItem {
  id: string
  userName: string
  userEmail: string
  amount: number
  type: string
  status: string
  description: string
  slipUrl: string | null
  createdAt: string
}

const PAGE_SIZE = 50

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
    case "APPROVED":
      return (
        <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "TOP_UP":
      return (
        <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
          <ArrowDownRight className="mr-1 h-3 w-3" />
          Deposit
        </Badge>
      )
    case "COFFEE_TIP":
      return (
        <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
          <Coffee className="mr-1 h-3 w-3" />
          Coffee
        </Badge>
      )
    case "BOOKING_PAYMENT":
      return (
        <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
          <BookOpen className="mr-1 h-3 w-3" />
          Booking
        </Badge>
      )
    case "WITHDRAWAL":
      return (
        <Badge variant="outline" className="border-orange-500/50 bg-orange-500/10 text-orange-500">
          <ArrowUpRight className="mr-1 h-3 w-3" />
          Withdraw
        </Badge>
      )
    case "REFUND":
      return (
        <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-500">
          <ArrowDownRight className="mr-1 h-3 w-3" />
          Refund
        </Badge>
      )
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const url = new URL(request.url)
  const search = url.searchParams.get("search") || ""
  const statusFilter = url.searchParams.get("status") || ""
  const typeFilter = url.searchParams.get("type") || ""
  const dateFrom = url.searchParams.get("dateFrom") || ""
  const dateTo = url.searchParams.get("dateTo") || ""
  const sortKey = url.searchParams.get("sortKey") || ""
  const sortDir = url.searchParams.get("sortDir") || "asc"
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))

  // Build top-up where clause
  const topUpWhere: Record<string, unknown> = {}
  if (statusFilter && statusFilter !== "all") {
    topUpWhere.status = statusFilter
  }

  // If type filter is set and is not TOP_UP, skip top-up requests
  const includeTopUps = !typeFilter || typeFilter === "all" || typeFilter === "TOP_UP"

  // Fetch top-up requests
  const topUpRequests = includeTopUps
    ? await prisma.topUpRequest.findMany({
        where: topUpWhere,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          amount: true,
          slipUrl: true,
          status: true,
          createdAt: true,
        },
      })
    : []

  // Fetch wallet transactions (for coffee, booking, refund types)
  const txWhere: Record<string, unknown> = {}
  if (typeFilter && typeFilter !== "all" && typeFilter !== "TOP_UP") {
    txWhere.type = typeFilter
  } else if (!typeFilter || typeFilter === "all") {
    // Show all non-top-up transaction types
    txWhere.type = { in: ["COFFEE_TIP", "BOOKING_PAYMENT", "REFUND"] }
  }

  const includeTransactions = !typeFilter || typeFilter === "all" || typeFilter !== "TOP_UP"
  const walletTransactions = includeTransactions
    ? await prisma.walletTransaction.findMany({
        where: txWhere,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          createdAt: true,
          wallet: {
            select: {
              userId: true,
            },
          },
        },
      })
    : []

  // Collect all user IDs
  const allUserIds = [
    ...new Set([
      ...topUpRequests.map((r) => r.userId),
      ...walletTransactions.map((t) => t.wallet.userId),
    ]),
  ]
  const users = await prisma.user.findMany({
    where: { id: { in: allUserIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  // Build unified items list
  let items: PaymentItem[] = []

  // Add top-up requests
  for (const r of topUpRequests) {
    const user = userMap.get(r.userId)
    items.push({
      id: r.id,
      userName: user?.name || "Unknown",
      userEmail: user?.email || "",
      amount: r.amount,
      type: "TOP_UP",
      status: r.status,
      description: `Top-up request`,
      slipUrl: r.slipUrl,
      createdAt: new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
      }),
    })
  }

  // Add wallet transactions
  for (const t of walletTransactions) {
    const user = userMap.get(t.wallet.userId)
    items.push({
      id: t.id,
      userName: user?.name || "Unknown",
      userEmail: user?.email || "",
      amount: t.amount,
      type: t.type,
      status: "APPROVED",
      description: t.description,
      slipUrl: null,
      createdAt: new Date(t.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
      }),
    })
  }

  // Apply search filter
  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (i) => i.userName.toLowerCase().includes(q) || i.userEmail.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    )
  }

  // Apply date range filter
  if (dateFrom || dateTo) {
    const from = dateFrom ? new Date(dateFrom).getTime() : 0
    const to = dateTo ? new Date(dateTo + "T23:59:59.999Z").getTime() : Infinity
    items = items.filter((i) => {
      const d = new Date(i.createdAt).getTime()
      return d >= from && d <= to
    })
  }

  // Sort
  items.sort((a, b) => {
    if (sortKey === "amount") {
      return sortDir === "desc" ? b.amount - a.amount : a.amount - b.amount
    }
    if (sortKey === "userName") {
      return sortDir === "desc" ? b.userName.localeCompare(a.userName) : a.userName.localeCompare(b.userName)
    }
    // Default: newest first
    return 0
  })

  const totalCount = items.length

  // Paginate
  const paginatedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Stats from DB
  const [pendingCount, approvedCount, rejectedCount, totalApprovedAmount] = await Promise.all([
    prisma.topUpRequest.count({ where: { status: "PENDING" } }),
    prisma.topUpRequest.count({ where: { status: "APPROVED" } }),
    prisma.topUpRequest.count({ where: { status: "REJECTED" } }),
    prisma.topUpRequest.aggregate({ where: { status: "APPROVED" }, _sum: { amount: true } }),
  ])

  return {
    items: paginatedItems,
    totalCount,
    stats: {
      pendingCount,
      approvedCount,
      rejectedCount,
      totalApproved: totalApprovedAmount._sum.amount || 0,
    },
    params: { search, status: statusFilter, type: typeFilter, dateFrom, dateTo, sortKey, sortDir, page },
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request)
  const formData = await request.formData()
  const intent = String(formData.get("intent"))
  const requestId = String(formData.get("requestId"))

  const topUpRequest = await prisma.topUpRequest.findUnique({
    where: { id: requestId },
  })
  if (!topUpRequest) return { error: "Top-up request not found" }

  const user = await prisma.user.findUnique({
    where: { id: topUpRequest.userId },
    select: { name: true, email: true },
  })

  if (intent === "approve") {
    await prisma.topUpRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    })

    const wallet = await prisma.wallet.upsert({
      where: { userId: topUpRequest.userId },
      create: { userId: topUpRequest.userId, balance: topUpRequest.amount },
      update: { balance: { increment: topUpRequest.amount } },
    })

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "TOP_UP",
        amount: topUpRequest.amount,
        description: `Top-up approved - ${topUpRequest.amount.toLocaleString()} Kip`,
      },
    })

    if (user) {
      try { await sendTopUpStatusEmail(user.email, user.name, topUpRequest.amount, "APPROVED") }
      catch (e) { console.error("Failed to send approval email:", e) }
    }

    return { success: "Top-up approved and balance updated" }
  }

  if (intent === "reject") {
    const reason = String(formData.get("reason") || "").trim()

    await prisma.topUpRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    })

    if (user) {
      try { await sendTopUpStatusEmail(user.email, user.name, topUpRequest.amount, "REJECTED", reason) }
      catch (e) { console.error("Failed to send rejection email:", e) }
    }

    return { success: "Top-up rejected" }
  }

  return { error: "Invalid action" }
}

export default function AdminPaymentsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, totalCount, stats, params } = loaderData
  const [selectedRequest, setSelectedRequest] = useState<PaymentItem | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [slipPreview, setSlipPreview] = useState<string | null>(null)
  const fetcher = useFetcher<typeof action>()

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setSelectedRequest(null)
      setShowApproveDialog(false)
      setShowRejectDialog(false)
      setRejectReason("")
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const isProcessing = fetcher.state !== "idle"

  const handleApprove = () => {
    if (!selectedRequest) return
    fetcher.submit({ intent: "approve", requestId: selectedRequest.id }, { method: "post" })
  }

  const handleReject = () => {
    if (!selectedRequest) return
    fetcher.submit(
      { intent: "reject", requestId: selectedRequest.id, reason: rejectReason },
      { method: "post" }
    )
  }

  const handleParamsChange = useCallback((p: ServerParams) => {
    const sp = new URLSearchParams()
    if (p.search) sp.set("search", p.search)
    if (p.filters.status && p.filters.status !== "all") sp.set("status", p.filters.status)
    if (p.filters.type && p.filters.type !== "all") sp.set("type", p.filters.type)
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
        { value: "APPROVED", label: "Approved" },
        { value: "REJECTED", label: "Rejected" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { value: "TOP_UP", label: "Deposit" },
        { value: "COFFEE_TIP", label: "Coffee" },
        { value: "BOOKING_PAYMENT", label: "Booking" },
        { value: "REFUND", label: "Refund" },
      ],
    },
    {
      key: "date",
      label: "Date Range",
      type: "dateRange" as const,
      options: [],
    },
  ]

  const renderDropdownActions = (req: PaymentItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setSelectedRequest(req)}>
          <Eye className="mr-2 h-4 w-4" />View Details
        </DropdownMenuItem>
        {req.type === "TOP_UP" && req.status === "PENDING" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedRequest(req); setShowApproveDialog(true) }}>
              <CheckCircle2 className="mr-2 h-4 w-4" />Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedRequest(req); setShowRejectDialog(true) }}>
              <XCircle className="mr-2 h-4 w-4" />Reject
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columns: Column<PaymentItem>[] = [
    {
      key: "userName",
      label: "User",
      sortable: true,
      render: (req) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {req.userName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{req.userName}</p>
            <p className="text-xs text-white">{req.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (req) => getTypeBadge(req.type),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (req) => (
        <span className="font-semibold">{req.amount.toLocaleString()} Kip</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (req) => (
        <span className="text-sm text-white truncate max-w-[200px] block">{req.description}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (req) => getStatusBadge(req.status),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (req) => <span className="text-sm text-white">{req.createdAt}</span>,
    },
  ]

  const renderMobileCard = (req: PaymentItem) => (
    <Card key={req.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {req.userName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{req.userName}</p>
              <p className="text-xs text-white">{req.userEmail}</p>
            </div>
          </div>
          {renderDropdownActions(req)}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {getTypeBadge(req.type)}
          {getStatusBadge(req.status)}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold">{req.amount.toLocaleString()} Kip</span>
          <span className="text-xs text-white">{req.createdAt}</span>
        </div>

        {req.type === "TOP_UP" && req.status === "PENDING" && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedRequest(req); setShowRejectDialog(true) }}>
              Reject
            </Button>
            <Button size="sm" className="flex-1" onClick={() => { setSelectedRequest(req); setShowApproveDialog(true) }}>
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-white">Review and manage all payment transactions</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-white">Approved</p>
                <p className="text-2xl font-bold">{stats.approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-white">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white">Total Approved</p>
                <p className="text-xl font-bold">{stats.totalApproved.toLocaleString()} <span className="text-sm font-normal text-white">Kip</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchKey="userName"
        searchPlaceholder="Search by user name..."
        filters={filters}
        pageSize={PAGE_SIZE}
        renderMobileCard={renderMobileCard}
        serverSide
        totalItems={totalCount}
        onParamsChange={handleParamsChange}
        initialSearch={params.search}
        initialFilters={{ status: params.status, type: params.type, dateFrom: params.dateFrom, dateTo: params.dateTo }}
        initialPage={params.page}
        initialSort={params.sortKey ? { key: params.sortKey, direction: params.sortDir as "asc" | "desc" } : null}
        actions={renderDropdownActions}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest && !showRejectDialog && !showApproveDialog} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>Transaction information</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedRequest.userName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{selectedRequest.userName}</p>
                    <p className="text-sm text-white">{selectedRequest.userEmail}</p>
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                {/* Amount & Type */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-white">
                      <Wallet className="h-5 w-5" />
                      <span>Amount</span>
                    </div>
                    {getTypeBadge(selectedRequest.type)}
                  </div>
                  <span className="text-2xl font-bold text-primary">{selectedRequest.amount.toLocaleString()} Kip</span>
                </div>

                {/* Description */}
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-sm text-white">Description</p>
                  <p className="font-medium mt-1">{selectedRequest.description}</p>
                </div>

                {/* Payment Slip (only for top-up) */}
                {selectedRequest.slipUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Slip</p>
                    <button
                      onClick={() => setSlipPreview(selectedRequest.slipUrl)}
                      className="group relative w-full overflow-hidden rounded-lg border border-border"
                    >
                      <img
                        src={selectedRequest.slipUrl}
                        alt="Payment slip"
                        className="w-full max-h-64 object-contain bg-black/50 transition-opacity group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <span className="text-sm text-white font-medium">Click to view full size</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Rejected reason info */}
                {selectedRequest.status === "REJECTED" && (
                  <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                    <p className="text-sm font-medium text-destructive">Rejected</p>
                    <p className="text-sm text-white mt-1">This request was rejected. The user has been notified by email.</p>
                  </div>
                )}

                {/* Date */}
                <p className="text-sm text-white">Date: {selectedRequest.createdAt}</p>
              </div>

              {selectedRequest.type === "TOP_UP" && selectedRequest.status === "PENDING" && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRejectDialog(true)} disabled={isProcessing}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={() => setShowApproveDialog(true)} disabled={isProcessing}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}

              {(selectedRequest.status !== "PENDING" || selectedRequest.type !== "TOP_UP") && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={(open) => { setShowApproveDialog(open); if (!open) setSelectedRequest(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Top-up Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this top-up of <strong>{selectedRequest?.amount.toLocaleString()} Kip</strong> for <strong>{selectedRequest?.userName}</strong>? The balance will be added to their wallet immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader className="mr-2 h-4 w-4 animate-spin" />Processing...</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" />Approve</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={(open) => { setShowRejectDialog(open); if (!open) { setSelectedRequest(null); setRejectReason("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Top-up Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this top-up request. The user will be notified by email.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectReason("") }} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader className="mr-2 h-4 w-4 animate-spin" />Rejecting...</>
              ) : (
                "Reject Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full-screen Slip Preview */}
      <Dialog open={!!slipPreview} onOpenChange={() => setSlipPreview(null)}>
        <DialogContent className="max-w-2xl p-2">
          {slipPreview && (
            <img
              src={slipPreview}
              alt="Payment slip"
              className="w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
