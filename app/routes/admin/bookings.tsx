import { useState } from "react"
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
import { DataTable, Column, FilterOption } from "@/components/admin/data-table"
import {
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  DollarSign,
  User,
  Code2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react"

interface Booking {
  id: string
  client: string
  clientEmail: string
  developer: string
  developerEmail: string
  service: string
  date: string
  time: string
  duration: string
  amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled" | "refunded"
  paymentStatus: "paid" | "pending" | "refunded"
  createdAt: string
}

const bookings: Booking[] = [
  {
    id: "1",
    client: "Bounmy Khamphouthong",
    clientEmail: "bounmy@email.com",
    developer: "Somsak Phommavong",
    developerEmail: "somsak@email.com",
    service: "Code Review",
    date: "2024-03-25",
    time: "10:00 AM",
    duration: "1 hour",
    amount: 45,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2024-03-20",
  },
  {
    id: "2",
    client: "Viengkham Thammavong",
    clientEmail: "viengkham@email.com",
    developer: "Keo Bounsavath",
    developerEmail: "keo@email.com",
    service: "Mentorship Session",
    date: "2024-03-26",
    time: "2:00 PM",
    duration: "2 hours",
    amount: 80,
    status: "pending",
    paymentStatus: "paid",
    createdAt: "2024-03-22",
  },
  {
    id: "3",
    client: "Thongphet Vongsavath",
    clientEmail: "thongphet@email.com",
    developer: "Khamla Phommachan",
    developerEmail: "khamla@email.com",
    service: "Career Advice",
    date: "2024-03-22",
    time: "11:00 AM",
    duration: "30 mins",
    amount: 25,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-03-18",
  },
  {
    id: "4",
    client: "Manivanh Souphanthong",
    clientEmail: "manivanh@email.com",
    developer: "Somsak Phommavong",
    developerEmail: "somsak@email.com",
    service: "Project Consultation",
    date: "2024-03-24",
    time: "3:00 PM",
    duration: "1 hour",
    amount: 55,
    status: "cancelled",
    paymentStatus: "refunded",
    createdAt: "2024-03-19",
  },
  {
    id: "5",
    client: "Phouthone Keomany",
    clientEmail: "phouthone@email.com",
    developer: "Keo Bounsavath",
    developerEmail: "keo@email.com",
    service: "Code Review",
    date: "2024-03-27",
    time: "9:00 AM",
    duration: "1 hour",
    amount: 40,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2024-03-23",
  },
  {
    id: "6",
    client: "Somphet Rattanavong",
    clientEmail: "somphet@email.com",
    developer: "Khamla Phommachan",
    developerEmail: "khamla@email.com",
    service: "Technical Interview Prep",
    date: "2024-03-28",
    time: "4:00 PM",
    duration: "1.5 hours",
    amount: 60,
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2024-03-24",
  },
]

export default function AdminBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [localBookings, setLocalBookings] = useState(bookings)

  const handleConfirm = (id: string) => {
    setLocalBookings(
      localBookings.map((booking) =>
        booking.id === id ? { ...booking, status: "confirmed" as const } : booking
      )
    )
  }

  const handleCancel = (id: string) => {
    setLocalBookings(
      localBookings.map((booking) =>
        booking.id === id
          ? { ...booking, status: "cancelled" as const, paymentStatus: "refunded" as const }
          : booking
      )
    )
  }

  const handleComplete = (id: string) => {
    setLocalBookings(
      localBookings.map((booking) =>
        booking.id === id ? { ...booking, status: "completed" as const } : booking
      )
    )
  }

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Booking Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "refunded", label: "Refunded" },
      ],
    },
    {
      key: "service",
      label: "Service",
      options: [
        { value: "Code Review", label: "Code Review" },
        { value: "Mentorship Session", label: "Mentorship Session" },
        { value: "Career Advice", label: "Career Advice" },
        { value: "Project Consultation", label: "Project Consultation" },
        { value: "Technical Interview Prep", label: "Technical Interview Prep" },
      ],
    },
  ]

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
            Confirmed
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            Cancelled
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-white">
            Refunded
          </Badge>
        )
    }
  }

  const getPaymentBadge = (status: Booking["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400">Paid</Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
        )
      case "refunded":
        return (
          <Badge className="bg-muted text-white">Refunded</Badge>
        )
    }
  }

  const columns: Column<Booking>[] = [
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (booking) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {booking.client.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{booking.client}</p>
            <p className="text-xs text-white">{booking.clientEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "developer",
      label: "Developer",
      sortable: true,
      render: (booking) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {booking.developer.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{booking.developer}</span>
        </div>
      ),
    },
    {
      key: "service",
      label: "Service",
      sortable: true,
      render: (booking) => <Badge variant="secondary">{booking.service}</Badge>,
    },
    {
      key: "date",
      label: "Date & Time",
      sortable: true,
      render: (booking) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-white" />
            {booking.date}
          </div>
          <div className="flex items-center gap-1 text-white">
            <Clock className="h-3 w-3" />
            {booking.time} ({booking.duration})
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (booking) => (
        <span className="font-semibold text-primary">{booking.amount} Kip</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (booking) => getStatusBadge(booking.status),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      sortable: true,
      render: (booking) => getPaymentBadge(booking.paymentStatus),
    },
  ]

  const renderMobileCard = (booking: Booking) => (
    <Card key={booking.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">{booking.service}</Badge>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-white" />
              <span>{booking.date}</span>
              <Clock className="h-4 w-4 text-white" />
              <span>{booking.time}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {booking.status === "pending" && (
                <DropdownMenuItem onClick={() => handleConfirm(booking.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Booking
                </DropdownMenuItem>
              )}
              {booking.status === "confirmed" && (
                <DropdownMenuItem onClick={() => handleComplete(booking.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleCancel(booking.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel & Refund
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white" />
              <div>
                <p className="text-xs text-white">Client</p>
                <p className="text-sm font-medium">{booking.client}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <div className="text-right">
                <p className="text-xs text-white">Developer</p>
                <p className="text-sm font-medium">{booking.developer}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {getStatusBadge(booking.status)}
              {getPaymentBadge(booking.paymentStatus)}
            </div>
            <span className="text-lg font-bold text-primary">{booking.amount} Kip</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-white">Manage all consultation bookings</p>
      </div>

      <DataTable
        data={localBookings}
        columns={columns}
        searchKey="client"
        searchPlaceholder="Search by client name..."
        filters={filters}
        pageSize={10}
        renderMobileCard={renderMobileCard}
        actions={(booking) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {booking.status === "pending" && (
                <DropdownMenuItem onClick={() => handleConfirm(booking.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Booking
                </DropdownMenuItem>
              )}
              {booking.status === "confirmed" && (
                <DropdownMenuItem onClick={() => handleComplete(booking.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleCancel(booking.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel & Refund
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>View and manage booking information</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{selectedBooking.service}</Badge>
                  <span className="text-2xl font-bold text-primary">{selectedBooking.amount} Kip</span>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <User className="h-4 w-4" />
                      Client
                    </div>
                    <p className="mt-1 font-medium">{selectedBooking.client}</p>
                    <p className="text-sm text-white">{selectedBooking.clientEmail}</p>
                  </div>
                  <div className="rounded-lg border p-4">
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
                    <span>{selectedBooking.time} ({selectedBooking.duration})</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {getStatusBadge(selectedBooking.status)}
                  {getPaymentBadge(selectedBooking.paymentStatus)}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
                {selectedBooking.status === "pending" && (
                  <Button
                    onClick={() => {
                      handleConfirm(selectedBooking.id)
                      setSelectedBooking(null)
                    }}
                  >
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <Button
                    onClick={() => {
                      handleComplete(selectedBooking.id)
                      setSelectedBooking(null)
                    }}
                  >
                    Mark Complete
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
