import { useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Video,
  Home,
  Users,
} from "lucide-react"

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

const allBookings = [
  {
    id: "1",
    client: "Khamla Sisavath",
    email: "khamla@email.com",
    service: "React Code Review",
    date: "Mar 24, 2026",
    time: "2:00 PM",
    duration: "1 hour",
    amount: 45,
    status: "upcoming",
  },
  {
    id: "2",
    client: "Bounmy Phanthavong",
    email: "bounmy@email.com",
    service: "Career Mentorship",
    date: "Mar 24, 2026",
    time: "4:30 PM",
    duration: "30 mins",
    amount: 25,
    status: "upcoming",
  },
  {
    id: "3",
    client: "Vilay Souvannaphoum",
    email: "vilay@email.com",
    service: "Project Architecture Review",
    date: "Mar 25, 2026",
    time: "10:00 AM",
    duration: "1.5 hours",
    amount: 75,
    status: "pending",
  },
  {
    id: "4",
    client: "Souksamay Keomany",
    email: "souksamay@email.com",
    service: "AWS Infrastructure Setup",
    date: "Mar 20, 2026",
    time: "3:00 PM",
    duration: "2 hours",
    amount: 110,
    status: "completed",
  },
  {
    id: "5",
    client: "Phoukhong Manivong",
    email: "phoukhong@email.com",
    service: "TypeScript Migration Help",
    date: "Mar 18, 2026",
    time: "11:00 AM",
    duration: "1 hour",
    amount: 55,
    status: "completed",
  },
  {
    id: "6",
    client: "Anousone Sithammavong",
    email: "anousone@email.com",
    service: "React Performance Optimization",
    date: "Mar 15, 2026",
    time: "2:00 PM",
    duration: "1.5 hours",
    amount: 75,
    status: "cancelled",
  },
]

export default function DeveloperBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterService, setFilterService] = useState("all")

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-secondary"
    }
  }

  const filterBookings = (status: string) => {
    return allBookings
      .filter((booking) => {
        if (status !== "all" && booking.status !== status) return false
        if (searchQuery && !booking.client.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !booking.service.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (filterService !== "all" && !booking.service.toLowerCase().includes(filterService.toLowerCase())) return false
        return true
      })
  }

  const BookingCard = ({ booking }: { booking: typeof allBookings[0] }) => (
    <div className="group rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {booking.client.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{booking.client}</p>
            <p className="text-sm text-muted-foreground">{booking.service}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {booking.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {booking.time}
              </span>
              <span className="font-medium text-primary">{booking.amount} Kip</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusStyles(booking.status)}>
            {booking.status}
          </Badge>
          {booking.status === "pending" && (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <CheckCircle className="mr-1 h-4 w-4" />
                Accept
              </Button>
              <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10">
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          {booking.status === "upcoming" && (
            <div className="flex gap-1">
              <Button size="sm" className="h-8">
                <Video className="mr-1 h-4 w-4" />
                Join
              </Button>
              <Button size="sm" variant="outline" className="h-8">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          )}
          {booking.status === "completed" && (
            <Button size="sm" variant="outline" className="h-8">
              View Details
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="developer"
        userName="Somsak Phommavong"
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My <span className="gradient-text">Bookings</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your consultation appointments
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Pending", count: allBookings.filter(b => b.status === "pending").length, color: "text-yellow-400" },
              { label: "Upcoming", count: allBookings.filter(b => b.status === "upcoming").length, color: "text-blue-400" },
              { label: "Completed", count: allBookings.filter(b => b.status === "completed").length, color: "text-emerald-400" },
              { label: "Total Earned", count: allBookings.filter(b => b.status === "completed").reduce((a, b) => a + b.amount, 0), prefix: "", suffix: " Kip", color: "text-primary" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.prefix}{stat.count}{stat.suffix}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client or service..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="review">Code Review</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
                <SelectItem value="architecture">Architecture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:gap-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterBookings("all").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {filterBookings("pending").length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 font-medium">No pending bookings</p>
                    <p className="text-sm text-muted-foreground">
                      New booking requests will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterBookings("pending").map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {filterBookings("upcoming").length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 font-medium">No upcoming bookings</p>
                    <p className="text-sm text-muted-foreground">
                      Confirmed bookings will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterBookings("upcoming").map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {filterBookings("completed").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomBar items={bottomBarItems} />
    </div>
  )
}
