import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DataTable, Column, FilterOption } from "@/components/admin/data-table"
import {
  MoreHorizontal,
  Eye,
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Receipt,
} from "lucide-react"

interface Payment {
  id: string
  transactionId: string
  payer: string
  payerEmail: string
  recipient: string
  recipientEmail: string
  type: "booking" | "subscription" | "refund" | "payout"
  amount: number
  fee: number
  netAmount: number
  status: "completed" | "pending" | "failed" | "refunded"
  method: "card" | "bank" | "wallet"
  createdAt: string
  description: string
}

const payments: Payment[] = [
  {
    id: "1",
    transactionId: "TXN-001234",
    payer: "Bounmy Khamphouthong",
    payerEmail: "bounmy@email.com",
    recipient: "Somsak Phommavong",
    recipientEmail: "somsak@email.com",
    type: "booking",
    amount: 45,
    fee: 4.5,
    netAmount: 40.5,
    status: "completed",
    method: "card",
    createdAt: "2024-03-25 10:30 AM",
    description: "Code Review Session",
  },
  {
    id: "2",
    transactionId: "TXN-001235",
    payer: "Viengkham Thammavong",
    payerEmail: "viengkham@email.com",
    recipient: "Keo Bounsavath",
    recipientEmail: "keo@email.com",
    type: "booking",
    amount: 80,
    fee: 8,
    netAmount: 72,
    status: "pending",
    method: "card",
    createdAt: "2024-03-25 09:15 AM",
    description: "Mentorship Session",
  },
  {
    id: "3",
    transactionId: "TXN-001236",
    payer: "LaoDev Platform",
    payerEmail: "platform@laodev.la",
    recipient: "Somsak Phommavong",
    recipientEmail: "somsak@email.com",
    type: "payout",
    amount: 450,
    fee: 0,
    netAmount: 450,
    status: "completed",
    method: "bank",
    createdAt: "2024-03-24 03:00 PM",
    description: "Weekly Payout",
  },
  {
    id: "4",
    transactionId: "TXN-001237",
    payer: "Manivanh Souphanthong",
    payerEmail: "manivanh@email.com",
    recipient: "LaoDev Platform",
    recipientEmail: "platform@laodev.la",
    type: "refund",
    amount: 55,
    fee: 0,
    netAmount: 55,
    status: "refunded",
    method: "card",
    createdAt: "2024-03-24 11:45 AM",
    description: "Cancelled Booking Refund",
  },
  {
    id: "5",
    transactionId: "TXN-001238",
    payer: "Thongphet Vongsavath",
    payerEmail: "thongphet@email.com",
    recipient: "Khamla Phommachan",
    recipientEmail: "khamla@email.com",
    type: "booking",
    amount: 25,
    fee: 2.5,
    netAmount: 22.5,
    status: "completed",
    method: "wallet",
    createdAt: "2024-03-23 02:30 PM",
    description: "Career Advice Session",
  },
  {
    id: "6",
    transactionId: "TXN-001239",
    payer: "Phouthone Keomany",
    payerEmail: "phouthone@email.com",
    recipient: "Keo Bounsavath",
    recipientEmail: "keo@email.com",
    type: "booking",
    amount: 40,
    fee: 4,
    netAmount: 36,
    status: "failed",
    method: "card",
    createdAt: "2024-03-23 10:00 AM",
    description: "Code Review Session",
  },
]

const stats = [
  {
    title: "Total Revenue",
    value: "12,450 Kip",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Platform Fees",
    value: "1,245 Kip",
    change: "+12%",
    trend: "up",
    icon: Receipt,
  },
  {
    title: "Pending Payouts",
    value: "2,340 Kip",
    change: "-5%",
    trend: "down",
    icon: Wallet,
  },
  {
    title: "Transactions",
    value: "234",
    change: "+23%",
    trend: "up",
    icon: CreditCard,
  },
]

export default function AdminPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [localPayments] = useState(payments)

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
        { value: "refunded", label: "Refunded" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { value: "booking", label: "Booking" },
        { value: "payout", label: "Payout" },
        { value: "refund", label: "Refund" },
        { value: "subscription", label: "Subscription" },
      ],
    },
    {
      key: "method",
      label: "Payment Method",
      options: [
        { value: "card", label: "Card" },
        { value: "bank", label: "Bank Transfer" },
        { value: "wallet", label: "Wallet" },
      ],
    },
  ]

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            Failed
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
            Refunded
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: Payment["type"]) => {
    switch (type) {
      case "booking":
        return <Badge>Booking</Badge>
      case "payout":
        return <Badge variant="secondary">Payout</Badge>
      case "refund":
        return <Badge variant="outline">Refund</Badge>
      case "subscription":
        return <Badge className="bg-primary/20 text-primary">Subscription</Badge>
    }
  }

  const getMethodIcon = (method: Payment["method"]) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "bank":
        return <DollarSign className="h-4 w-4" />
      case "wallet":
        return <Wallet className="h-4 w-4" />
    }
  }

  const columns: Column<Payment>[] = [
    {
      key: "transactionId",
      label: "Transaction",
      sortable: true,
      render: (payment) => (
        <div>
          <p className="font-mono text-sm font-medium">{payment.transactionId}</p>
          <p className="text-xs text-white">{payment.createdAt}</p>
        </div>
      ),
    },
    {
      key: "payer",
      label: "From",
      sortable: true,
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">
              {payment.payer.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{payment.payer}</span>
        </div>
      ),
    },
    {
      key: "recipient",
      label: "To",
      sortable: true,
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {payment.recipient.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{payment.recipient}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (payment) => getTypeBadge(payment.type),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (payment) => (
        <div>
          <span className="font-semibold">{payment.amount} Kip</span>
          {payment.fee > 0 && (
            <p className="text-xs text-white">
              Fee: {payment.fee} Kip
            </p>
          )}
        </div>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (payment) => (
        <div className="flex items-center gap-2 text-white">
          {getMethodIcon(payment.method)}
          <span className="capitalize">{payment.method}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (payment) => getStatusBadge(payment.status),
    },
  ]

  const renderMobileCard = (payment: Payment) => (
    <Card key={payment.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-sm font-medium">{payment.transactionId}</p>
            <p className="text-xs text-white">{payment.createdAt}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </DropdownMenuItem>
              {payment.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Payment
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {getTypeBadge(payment.type)}
            {getStatusBadge(payment.status)}
          </div>
          <span className="text-xl font-bold">{payment.amount} Kip</span>
        </div>

        <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white">From:</span>
            <span className="font-medium">{payment.payer}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">To:</span>
            <span className="font-medium">{payment.recipient}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Method:</span>
            <div className="flex items-center gap-1">
              {getMethodIcon(payment.method)}
              <span className="capitalize">{payment.method}</span>
            </div>
          </div>
          {payment.fee > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-white">Platform Fee:</span>
              <span className="text-destructive">-{payment.fee} Kip</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-white">Monitor all transactions and payouts</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-emerald-500" : "text-destructive"}>
                  {stat.change}
                </span>
                <span className="text-white">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        data={localPayments}
        columns={columns}
        searchKey="transactionId"
        searchPlaceholder="Search by transaction ID..."
        filters={filters}
        pageSize={10}
        renderMobileCard={renderMobileCard}
        actions={(payment) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </DropdownMenuItem>
              {payment.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Payment
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-lg">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Transaction {selectedPayment.transactionId}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {getTypeBadge(selectedPayment.type)}
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                  <span className="text-2xl font-bold">{selectedPayment.amount} Kip</span>
                </div>

                <p className="text-white">{selectedPayment.description}</p>

                <div className="grid gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-white">From</p>
                    <p className="font-medium">{selectedPayment.payer}</p>
                    <p className="text-sm text-white">{selectedPayment.payerEmail}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-white">To</p>
                    <p className="font-medium">{selectedPayment.recipient}</p>
                    <p className="text-sm text-white">{selectedPayment.recipientEmail}</p>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Amount</span>
                    <span>{selectedPayment.amount} Kip</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Platform Fee (10%)</span>
                    <span className="text-destructive">-{selectedPayment.fee} Kip</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 font-medium">
                    <span>Net Amount</span>
                    <span className="text-primary">{selectedPayment.netAmount} Kip</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-white">
                    {getMethodIcon(selectedPayment.method)}
                    <span className="capitalize">{selectedPayment.method}</span>
                  </div>
                  <span className="text-white">{selectedPayment.createdAt}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
