import { useState, useRef, useEffect, useCallback } from "react"
import { useFetcher } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import { AnimatedCounter } from "@/components/animated-counter"
import { redirect } from "react-router"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session.server"
import { uploadToBunny } from "@/lib/bunny.server"
import { toast } from "sonner"
import type { Route } from "./+types/earnings"
import {
  Calendar,
  MessageSquare,
  FileText,
  Download,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Users,
  Wallet,
  BanknoteIcon,
  BanknoteArrowDown,
  DollarSign,
  Plus,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader,
} from "lucide-react"

const ITEMS_PER_PAGE = 20
const PLATFORM_FEE_RATE = 0.1 // 10% platform fee

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

// Merge bookings & withdrawals into a unified sorted list
function buildTransactionList(
  bookings: Array<{
    id: string
    amount: number
    topic: string
    status: string
    createdAt: string
    user: { name: string }
  }>,
  withdrawals: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
) {
  const items: Array<{
    id: string
    type: "earning" | "withdrawal"
    client: string
    service: string
    amount: number
    fee: number
    net: number
    date: string
    status: string
  }> = []

  for (const b of bookings) {
    const fee = b.amount * PLATFORM_FEE_RATE
    items.push({
      id: b.id,
      type: "earning",
      client: b.user.name,
      service: b.topic,
      amount: b.amount,
      fee,
      net: b.amount - fee,
      date: new Date(b.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: b.status.toLowerCase(),
    })
  }

  for (const w of withdrawals) {
    items.push({
      id: w.id,
      type: "withdrawal",
      client: "Withdrawal",
      service: "Bank Transfer",
      amount: -w.amount,
      fee: 0,
      net: -w.amount,
      date: new Date(w.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: w.status.toLowerCase(),
    })
  }

  items.sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    return db - da
  })

  return items
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireUser(request, ["DEVELOPER", "ADMIN"])

  const url = new URL(request.url)
  const cursor = url.searchParams.get("cursor")
  const isLoadMore = url.searchParams.get("loadMore") === "true"

  const developer = await prisma.developer.findUnique({
    where: { userId: session.userId },
    select: { id: true, totalEarnings: true, user: { select: { name: true } } },
  })

  if (!developer) {
    throw redirect("/developer")
  }

  // Fetch paginated bookings (completed ones = earnings)
  const bookings = await prisma.booking.findMany({
    where: {
      developerId: developer.id,
      status: "COMPLETED",
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE + 1, // +1 to check if there's more
    select: {
      id: true,
      amount: true,
      topic: true,
      status: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  })

  // Fetch paginated withdrawals
  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      developerId: developer.id,
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE + 1,
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  })

  // Merge, sort, trim to page size
  const allItems = buildTransactionList(
    bookings.slice(0, ITEMS_PER_PAGE) as any,
    withdrawals.slice(0, ITEMS_PER_PAGE) as any
  )
  const pageItems = allItems.slice(0, ITEMS_PER_PAGE)
  const hasMore = bookings.length > ITEMS_PER_PAGE || withdrawals.length > ITEMS_PER_PAGE || allItems.length > ITEMS_PER_PAGE
  const nextCursor = pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null

  // For load-more requests, only return transaction data
  if (isLoadMore) {
    return {
      userName: developer.user.name,
      totalEarnings: 0,
      totalWithdrawn: 0,
      availableBalance: 0,
      paymentMethods: [],
      earningsByService: [],
      transactions: pageItems,
      hasMore,
      nextCursor,
    }
  }

  // Full page load: compute totals + earnings by service
  const [allCompletedBookings, allWithdrawals, paymentMethods] = await Promise.all([
    prisma.booking.findMany({
      where: { developerId: developer.id, status: "COMPLETED" },
      select: { amount: true, topic: true },
    }),
    prisma.withdrawal.aggregate({
      where: {
        developerId: developer.id,
        status: { in: ["PENDING", "APPROVED", "COMPLETED"] },
      },
      _sum: { amount: true },
    }),
    prisma.paymentMethod.findMany({
      where: { developerId: developer.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, accountName: true, qrCodeUrl: true, isDefault: true },
    }),
  ])

  // Calculate totals from completed bookings
  const totalEarnings = allCompletedBookings.reduce((sum, b) => sum + b.amount, 0)
  const totalFees = totalEarnings * PLATFORM_FEE_RATE
  const totalNet = totalEarnings - totalFees
  const totalWithdrawn = allWithdrawals._sum.amount || 0
  const availableBalance = totalNet - totalWithdrawn

  // Group by service/topic
  const serviceMap = new Map<string, number>()
  for (const b of allCompletedBookings) {
    const topic = b.topic || "Other"
    serviceMap.set(topic, (serviceMap.get(topic) || 0) + (b.amount - b.amount * PLATFORM_FEE_RATE))
  }
  const totalServiceAmount = Array.from(serviceMap.values()).reduce((a, b) => a + b, 0)
  const earningsByService = Array.from(serviceMap.entries())
    .map(([service, amount]) => ({
      service,
      amount: Math.round(amount * 100) / 100,
      percentage: totalServiceAmount > 0 ? Math.round((amount / totalServiceAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    userName: developer.user.name,
    totalEarnings: totalNet,
    totalWithdrawn,
    availableBalance,
    paymentMethods,
    earningsByService,
    transactions: pageItems,
    hasMore,
    nextCursor,
  }
}

export async function action({ request }: Route.ActionArgs) {
  const session = await requireUser(request, ["DEVELOPER", "ADMIN"])
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  const developer = await prisma.developer.findUnique({
    where: { userId: session.userId },
    select: { id: true, totalEarnings: true },
  })

  if (!developer) {
    return { error: "Developer not found" }
  }

  if (intent === "add-payment-method") {
    const accountName = String(formData.get("accountName")).trim()
    const qrCodeFile = formData.get("qrCode") as File

    if (!accountName) {
      return { error: "Bank account name is required" }
    }

    if (!qrCodeFile || qrCodeFile.size === 0) {
      return { error: "QR code image is required" }
    }

    const qrCodeUrl = await uploadToBunny(qrCodeFile, "payment-qr")

    const existingCount = await prisma.paymentMethod.count({
      where: { developerId: developer.id },
    })

    await prisma.paymentMethod.create({
      data: {
        developerId: developer.id,
        accountName,
        qrCodeUrl,
        isDefault: existingCount === 0,
      },
    })

    return { success: "Payment method added" }
  }

  if (intent === "withdraw") {
    const amount = parseFloat(String(formData.get("amount")))
    const paymentMethodId = String(formData.get("paymentMethodId"))

    if (!amount || amount <= 0) {
      return { error: "Please enter a valid amount" }
    }

    const [allCompletedBookings, totalWithdrawnAgg] = await Promise.all([
      prisma.booking.aggregate({
        where: { developerId: developer.id, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: {
          developerId: developer.id,
          status: { in: ["PENDING", "APPROVED", "COMPLETED"] },
        },
        _sum: { amount: true },
      }),
    ])

    const totalNet = ((allCompletedBookings._sum.amount || 0) * (1 - PLATFORM_FEE_RATE))
    const availableBalance = totalNet - (totalWithdrawnAgg._sum.amount || 0)

    if (amount > availableBalance) {
      return { error: "Amount exceeds available balance" }
    }

    if (!paymentMethodId) {
      return { error: "Please select a payment method" }
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, developerId: developer.id },
    })

    if (!paymentMethod) {
      return { error: "Invalid payment method" }
    }

    await prisma.withdrawal.create({
      data: {
        developerId: developer.id,
        amount,
        paymentMethodId,
      },
    })

    return { success: "Withdrawal request submitted" }
  }

  return { error: "Invalid action" }
}

export default function DeveloperEarningsPage({ loaderData }: Route.ComponentProps) {
  const {
    userName,
    paymentMethods,
    availableBalance,
    totalEarnings,
    totalWithdrawn,
    earningsByService,
    transactions: initialTransactions,
    hasMore: initialHasMore,
    nextCursor: initialCursor,
  } = loaderData

  const [period, setPeriod] = useState("month")
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  // Infinite scroll state
  const [transactions, setTransactions] = useState(initialTransactions)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [nextCursor, setNextCursor] = useState(initialCursor)
  const observerRef = useRef<HTMLDivElement>(null)

  // Reset when loader data changes (e.g. after action revalidation)
  useEffect(() => {
    setTransactions(initialTransactions)
    setHasMore(initialHasMore)
    setNextCursor(initialCursor)
  }, [initialTransactions, initialHasMore, initialCursor])

  // Add payment form state
  const [newAccountName, setNewAccountName] = useState("")
  const [newQrFile, setNewQrFile] = useState<File | null>(null)
  const [newQrPreview, setNewQrPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [withdrawError, setWithdrawError] = useState("")

  const paymentFetcher = useFetcher<typeof action>()
  const withdrawFetcher = useFetcher<typeof action>()
  const loadMoreFetcher = useFetcher<typeof loader>()

  const isAddingPayment = paymentFetcher.state !== "idle"
  const isWithdrawing = withdrawFetcher.state !== "idle"
  const isLoadingMore = loadMoreFetcher.state !== "idle"

  // Append new items when load-more completes
  useEffect(() => {
    if (loadMoreFetcher.data?.transactions) {
      setTransactions((prev) => [...prev, ...loadMoreFetcher.data!.transactions])
      setHasMore(loadMoreFetcher.data.hasMore)
      setNextCursor(loadMoreFetcher.data.nextCursor)
    }
  }, [loadMoreFetcher.data])

  // IntersectionObserver for auto-load
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || !nextCursor) return
    loadMoreFetcher.load(`/developer/earnings?loadMore=true&cursor=${nextCursor}`)
  }, [hasMore, isLoadingMore, nextCursor])

  useEffect(() => {
    const node = observerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  // Handle add payment response
  useEffect(() => {
    if (paymentFetcher.data?.success) {
      toast.success(paymentFetcher.data.success)
      setShowAddPayment(false)
      setNewAccountName("")
      setNewQrFile(null)
      setNewQrPreview(null)
    }
    if (paymentFetcher.data?.error) {
      toast.error(paymentFetcher.data.error)
    }
  }, [paymentFetcher.data])

  // Handle withdraw response
  useEffect(() => {
    if (withdrawFetcher.data?.success) {
      toast.success(withdrawFetcher.data.success)
      setShowWithdraw(false)
      setWithdrawAmount("")
      setSelectedPaymentMethod("")
      setWithdrawError("")
    }
    if (withdrawFetcher.data?.error) {
      setWithdrawError(withdrawFetcher.data.error)
    }
  }, [withdrawFetcher.data])

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewQrFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setNewQrPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAddPayment = () => {
    if (!newAccountName.trim() || !newQrFile) return
    const formData = new FormData()
    formData.set("intent", "add-payment-method")
    formData.set("accountName", newAccountName.trim())
    formData.set("qrCode", newQrFile)
    paymentFetcher.submit(formData, { method: "post", encType: "multipart/form-data" })
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      setWithdrawError("Please enter a valid amount")
      return
    }
    if (amount > availableBalance) {
      setWithdrawError("Amount exceeds available balance")
      return
    }
    if (!selectedPaymentMethod) {
      setWithdrawError("Please select a payment method")
      return
    }
    const formData = new FormData()
    formData.set("intent", "withdraw")
    formData.set("amount", String(amount))
    formData.set("paymentMethodId", selectedPaymentMethod)
    withdrawFetcher.submit(formData, { method: "post" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400"
      case "pending":
        return "bg-amber-500/20 text-amber-400"
      case "approved":
        return "bg-blue-500/20 text-blue-400"
      case "rejected":
        return "bg-rose-500/20 text-rose-400"
      default:
        return "bg-secondary text-white"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="developer"
        userName={userName}
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My <span className="gradient-text">Earnings</span>
              </h1>
              <p className="mt-1 text-white">
                Track your income and withdrawals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="p-2 sm:p-4">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Earned
                  </p>
                  <p className="text-2xl font-bold">{totalEarnings.toFixed(2)} Kip</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white flex items-center gap-2">
                    <BanknoteArrowDown className="h-4 w-4" />
                    Withdrawn
                  </p>
                  <p className="text-2xl font-bold">{totalWithdrawn.toFixed(2)} Kip</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Available Balance
                  </p>
                  <p className="text-xl font-bold text-primary sm:text-2xl">
                    <AnimatedCounter end={availableBalance} duration={1500} decimals={2} /> Kip
                  </p>
                </div>
                <Button className="w-auto mt-2 gap-2" onClick={() => setShowWithdraw(true)}>
                  <BanknoteIcon className="h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Transactions */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All your earnings and withdrawals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.length === 0 && (
                      <p className="text-sm text-white text-center py-8">No transactions yet</p>
                    )}
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.type === "earning" ? "bg-emerald-500/10" : "bg-blue-500/10"
                          }`}>
                            {transaction.type === "earning" ? (
                              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5 text-rose-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.client}</p>
                            <p className="text-sm text-white">{transaction.service}</p>
                            <p className="text-xs text-white">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === "earning" ? "text-emerald-400" : "text-rose-500"
                            }`}>
                              {transaction.type === "earning" ? "+" : ""}{transaction.net.toFixed(2)} Kip
                            </p>
                            {transaction.type === "earning" && transaction.fee > 0 && (
                              <p className="text-xs text-white">
                                Fee: {transaction.fee.toFixed(2)} Kip
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusBadge(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {/* Infinite scroll sentinel */}
                    <div ref={observerRef} className="py-2">
                      {isLoadingMore && (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Loader className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-white">Loading more...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payout Methods */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Payout Methods</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowAddPayment(true)}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentMethods.length === 0 && (
                    <p className="text-sm text-white text-center py-4">No payment methods yet</p>
                  )}
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{method.accountName}</p>
                          {method.qrCodeUrl && (
                            <p className="text-xs text-emerald-400">QR Code attached</p>
                          )}
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Earnings by Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {earningsByService.length === 0 && (
                    <p className="text-sm text-white text-center py-4">No earnings data yet</p>
                  )}
                  {earningsByService.map((item) => (
                    <div key={item.service}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate mr-2">{item.service}</span>
                        <span className="font-medium shrink-0">{item.amount.toFixed(2)} Kip</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomBar items={bottomBarItems} />

      {/* Add Payment Method Modal */}
      <Dialog open={showAddPayment} onOpenChange={(open) => {
        setShowAddPayment(open)
        if (!open) {
          setNewAccountName("")
          setNewQrFile(null)
          setNewQrPreview(null)
        }
      }}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Add Payment Method
            </DialogTitle>
            <DialogDescription>
              Add your bank account details for withdrawals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bank Account Name <span className="text-rose-500">*</span></Label>
              <Input
                placeholder="e.g. BCEL One - Somsak"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload QR Code <span className="text-rose-500">*</span></Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />
              {newQrPreview ? (
                <div className="relative">
                  <img
                    src={newQrPreview}
                    alt="QR Code Preview"
                    className="w-full max-h-48 object-contain rounded-xl border border-border bg-background p-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80"
                    onClick={() => {
                      setNewQrFile(null)
                      setNewQrPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/50 p-8 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload QR code</p>
                    <p className="text-xs text-white mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border"
              disabled={isAddingPayment}
              onClick={() => {
                setShowAddPayment(false)
                setNewAccountName("")
                setNewQrFile(null)
                setNewQrPreview(null)
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              disabled={!newAccountName.trim() || !newQrFile || isAddingPayment}
              onClick={handleAddPayment}
            >
              {isAddingPayment ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Add Method
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdraw} onOpenChange={(open) => {
        setShowWithdraw(open)
        if (!open) {
          setWithdrawAmount("")
          setSelectedPaymentMethod("")
          setWithdrawError("")
        }
      }}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BanknoteIcon className="h-5 w-5 text-primary" />
              Withdraw Funds
            </DialogTitle>
            <DialogDescription>
              Withdraw your available balance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Available Balance Display */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm text-white">Available Balance</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {availableBalance.toFixed(2)} <span className="text-lg">Kip</span>
              </p>
            </div>

            {/* Withdraw Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Withdraw Amount</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  max={availableBalance}
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value)
                    setWithdrawError("")
                  }}
                  className="border-border bg-background pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white">
                  Kip
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Method</Label>
              {paymentMethods.length > 0 ? (
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPaymentMethod(method.id)
                        setWithdrawError("")
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{method.accountName}</p>
                        {method.isDefault && (
                          <p className="text-xs text-primary">Default</p>
                        )}
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-white mb-2" />
                  <p className="text-sm text-white">No payment methods added</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1"
                    onClick={() => {
                      setShowWithdraw(false)
                      setShowAddPayment(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {withdrawError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {withdrawError}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border"
              disabled={isWithdrawing}
              onClick={() => setShowWithdraw(false)}
            >
              Cancel
            </Button>
            {paymentMethods.length > 0 ? (
              <Button
                className="flex-1 gap-2"
                disabled={isWithdrawing}
                onClick={handleWithdraw}
              >
                {isWithdrawing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BanknoteIcon className="h-4 w-4" />
                    Withdraw
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  setShowWithdraw(false)
                  setShowAddPayment(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Add Payment Method
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
