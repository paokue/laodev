import { useState, useEffect } from "react"
import { useFetcher } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DataTable, Column, FilterOption } from "@/components/admin/data-table"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-session.server"
import { sendTopUpStatusEmail } from "@/lib/mailer"
import { toast } from "sonner"
import type { Route } from "./+types/payments"
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  DollarSign,
  Wallet,
  Clock,
  ImageIcon,
  Loader,
} from "lucide-react"

interface TopUpItem {
  id: string
  userName: string
  userEmail: string
  amount: number
  slipUrl: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const topUpRequests = await prisma.topUpRequest.findMany({
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

  // Fetch user info for all requests
  const userIds = [...new Set(topUpRequests.map((r) => r.userId))]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  const items: TopUpItem[] = topUpRequests.map((r) => {
    const user = userMap.get(r.userId)
    return {
      id: r.id,
      userName: user?.name || "Unknown",
      userEmail: user?.email || "",
      amount: r.amount,
      slipUrl: r.slipUrl,
      status: r.status,
      createdAt: new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    }
  })

  // Stats
  const pendingCount = items.filter((i) => i.status === "PENDING").length
  const approvedCount = items.filter((i) => i.status === "APPROVED").length
  const rejectedCount = items.filter((i) => i.status === "REJECTED").length
  const totalApproved = items
    .filter((i) => i.status === "APPROVED")
    .reduce((sum, i) => sum + i.amount, 0)

  return {
    items,
    stats: { pendingCount, approvedCount, rejectedCount, totalApproved },
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
    // Update status
    await prisma.topUpRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    })

    // Upsert wallet and add balance
    const wallet = await prisma.wallet.upsert({
      where: { userId: topUpRequest.userId },
      create: {
        userId: topUpRequest.userId,
        balance: topUpRequest.amount,
      },
      update: {
        balance: { increment: topUpRequest.amount },
      },
    })

    // Create wallet transaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "TOP_UP",
        amount: topUpRequest.amount,
        description: `Top-up approved - ${topUpRequest.amount.toLocaleString()} Kip`,
      },
    })

    // Send email notification
    if (user) {
      try {
        await sendTopUpStatusEmail(user.email, user.name, topUpRequest.amount, "APPROVED")
      } catch (e) {
        console.error("Failed to send approval email:", e)
      }
    }

    return { success: "Top-up approved and balance updated" }
  }

  if (intent === "reject") {
    const reason = String(formData.get("reason") || "").trim()

    await prisma.topUpRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    })

    // Send email notification
    if (user) {
      try {
        await sendTopUpStatusEmail(user.email, user.name, topUpRequest.amount, "REJECTED", reason)
      } catch (e) {
        console.error("Failed to send rejection email:", e)
      }
    }

    return { success: "Top-up rejected" }
  }

  return { error: "Invalid action" }
}

export default function AdminPaymentsPage({ loaderData }: Route.ComponentProps) {
  const { items, stats } = loaderData
  const [selectedRequest, setSelectedRequest] = useState<TopUpItem | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [slipPreview, setSlipPreview] = useState<string | null>(null)
  const fetcher = useFetcher<typeof action>()

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setSelectedRequest(null)
      setShowRejectDialog(false)
      setRejectReason("")
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const isProcessing = fetcher.state !== "idle"

  const handleApprove = (id: string) => {
    fetcher.submit({ intent: "approve", requestId: id }, { method: "post" })
  }

  const handleReject = () => {
    if (!selectedRequest) return
    fetcher.submit(
      { intent: "reject", requestId: selectedRequest.id, reason: rejectReason },
      { method: "post" }
    )
  }

  const getStatusBadge = (status: TopUpItem["status"]) => {
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
    }
  }

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
  ]

  const columns: Column<TopUpItem>[] = [
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
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (req) => (
        <span className="font-semibold">{req.amount.toLocaleString()} Kip</span>
      ),
    },
    {
      key: "slipUrl",
      label: "Slip",
      render: (req) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSlipPreview(req.slipUrl) }}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          View
        </button>
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

  const renderMobileCard = (req: TopUpItem) => (
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedRequest(req)}>
                <Eye className="mr-2 h-4 w-4" />View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSlipPreview(req.slipUrl)}>
                <ImageIcon className="mr-2 h-4 w-4" />View Slip
              </DropdownMenuItem>
              {req.status === "PENDING" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleApprove(req.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSelectedRequest(req); setShowRejectDialog(true) }}>
                    <XCircle className="mr-2 h-4 w-4" />Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {getStatusBadge(req.status)}
          <span className="text-xl font-bold">{req.amount.toLocaleString()} Kip</span>
        </div>

        <p className="mt-2 text-xs text-white">{req.createdAt}</p>

        {req.status === "PENDING" && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedRequest(req); setShowRejectDialog(true) }}>
              Reject
            </Button>
            <Button size="sm" className="flex-1" onClick={() => handleApprove(req.id)}>
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-white">Review and manage top-up requests</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white">Total Approved</p>
                <p className="text-2xl font-bold">{stats.totalApproved.toLocaleString()} <span className="text-sm font-normal text-white">Kip</span></p>
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
        pageSize={50}
        renderMobileCard={renderMobileCard}
        actions={(req) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedRequest(req)}>
                <Eye className="mr-2 h-4 w-4" />View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSlipPreview(req.slipUrl)}>
                <ImageIcon className="mr-2 h-4 w-4" />View Slip
              </DropdownMenuItem>
              {req.status === "PENDING" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleApprove(req.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSelectedRequest(req); setShowRejectDialog(true) }}>
                    <XCircle className="mr-2 h-4 w-4" />Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest && !showRejectDialog} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Top-up Request Details</DialogTitle>
                <DialogDescription>Review the payment slip and approve or reject</DialogDescription>
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

                {/* Amount */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-white">
                    <Wallet className="h-5 w-5" />
                    <span>Top-up Amount</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{selectedRequest.amount.toLocaleString()} Kip</span>
                </div>

                {/* Payment Slip */}
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

                {/* Date */}
                <p className="text-sm text-white">Submitted: {selectedRequest.createdAt}</p>
              </div>

              {selectedRequest.status === "PENDING" && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => { setShowRejectDialog(true) }}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                    ) : (
                      <><CheckCircle2 className="mr-2 h-4 w-4" />Approve</>
                    )}
                  </Button>
                </DialogFooter>
              )}

              {selectedRequest.status !== "PENDING" && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
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
