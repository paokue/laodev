import { useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import {
  Calendar,
  Clock,
  MessageSquare,
  Search,
  Video,
  Star,
  Home,
  Users,
  ArrowRight,
} from "lucide-react"

const bottomBarItems = [
  { href: "/user", label: "Home", icon: Home },
  { href: "/user/bookings", label: "Bookings", icon: Calendar },
  { href: "/developers", label: "Find", icon: Search },
  { href: "/user/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/profile", label: "Profile", icon: Users },
]

const allBookings = [
  {
    id: "1",
    developer: "Somsak Phommavong",
    title: "Senior Full-Stack Developer",
    service: "React Code Review",
    date: "Mar 24, 2026",
    time: "2:00 PM",
    duration: "1 hour",
    amount: 45,
    status: "upcoming",
    rating: 4.9,
  },
  {
    id: "2",
    developer: "Keo Bounyavong",
    title: "Mobile App Developer",
    service: "React Native Consultation",
    date: "Mar 26, 2026",
    time: "10:00 AM",
    duration: "30 mins",
    amount: 25,
    status: "upcoming",
    rating: 4.8,
  },
  {
    id: "3",
    developer: "Thongchanh Sisouphon",
    title: "DevOps Engineer",
    service: "CI/CD Pipeline Setup",
    date: "Mar 15, 2026",
    duration: "1.5 hours",
    time: "3:00 PM",
    amount: 82,
    status: "completed",
    rating: 5.0,
    hasReview: true,
  },
  {
    id: "4",
    developer: "Viengkham Souvannavong",
    title: "Backend Developer",
    service: "API Design Consultation",
    date: "Mar 10, 2026",
    time: "11:00 AM",
    duration: "1 hour",
    amount: 50,
    status: "completed",
    rating: 4.7,
    hasReview: false,
  },
  {
    id: "5",
    developer: "Somphone Phommasack",
    title: "Frontend Developer",
    service: "UI/UX Review",
    date: "Mar 5, 2026",
    time: "2:00 PM",
    duration: "45 mins",
    amount: 35,
    status: "cancelled",
    rating: 4.6,
  },
]

export default function UserBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-secondary"
    }
  }

  const filterBookings = (status: string) => {
    return allBookings.filter((booking) => {
      if (status !== "all" && booking.status !== status) return false
      if (searchQuery &&
          !booking.developer.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !booking.service.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }

  const BookingCard = ({ booking }: { booking: typeof allBookings[0] }) => (
    <div className="group rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {booking.developer.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{booking.developer}</p>
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
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                {booking.rating}
              </span>
              <span className="font-medium text-primary">{booking.amount} Kip</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusStyles(booking.status)}>
            {booking.status}
          </Badge>
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
            <div className="flex gap-1">
              {!booking.hasReview && (
                <Button size="sm" variant="outline" className="h-8 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  <Star className="mr-1 h-4 w-4" />
                  Review
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-8">
                Book Again
              </Button>
            </div>
          )}
          {booking.status === "cancelled" && (
            <Button size="sm" variant="outline" className="h-8">
              Rebook
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="user"
        userName="Khamla Sisavath"
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My <span className="gradient-text">Bookings</span>
              </h1>
              <p className="mt-1 text-muted-foreground">
                Manage your consultation sessions
              </p>
            </div>
            <Link to="/developers">
              <Button className="gap-2">
                <Search className="h-4 w-4" />
                Book New Session
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Upcoming", count: allBookings.filter(b => b.status === "upcoming").length, color: "text-blue-400" },
              { label: "Completed", count: allBookings.filter(b => b.status === "completed").length, color: "text-emerald-400" },
              { label: "Cancelled", count: allBookings.filter(b => b.status === "cancelled").length, color: "text-red-400" },
              { label: "Total Spent", count: allBookings.filter(b => b.status === "completed").reduce((a, b) => a + b.amount, 0), prefix: "", suffix: " Kip", color: "text-primary" },
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by developer or service..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:gap-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterBookings("all").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {filterBookings("upcoming").length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 font-medium">No upcoming sessions</p>
                    <p className="text-sm text-muted-foreground">
                      Book a consultation with a developer
                    </p>
                    <Link to="/developers">
                      <Button className="mt-4">Browse Developers</Button>
                    </Link>
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

            <TabsContent value="cancelled" className="space-y-4">
              {filterBookings("cancelled").map((booking) => (
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
