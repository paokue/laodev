import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import { AnimatedCounter } from "@/components/animated-counter"
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Settings,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  Briefcase,
  Home,
  Video,
  Eye,
} from "lucide-react"

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

const stats = [
  {
    label: "Total Earnings",
    value: 4250,
    prefix: "",
    suffix: " Kip",
    icon: DollarSign,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    change: "+12%",
  },
  {
    label: "Consultations",
    value: 47,
    prefix: "",
    suffix: "",
    icon: Video,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    change: "+5",
  },
  {
    label: "Average Rating",
    value: 4.9,
    prefix: "",
    suffix: "",
    icon: Star,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    change: "Excellent",
    isDecimal: true,
  },
  {
    label: "Profile Views",
    value: 234,
    prefix: "",
    suffix: "",
    icon: Eye,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    change: "+18%",
  },
]

const upcomingBookings = [
  {
    id: "1",
    client: "Khamla Sisavath",
    service: "React Code Review",
    date: "Mar 24, 2026",
    time: "2:00 PM",
    duration: "1 hour",
    amount: 45,
    status: "confirmed",
  },
  {
    id: "2",
    client: "Bounmy Phanthavong",
    service: "Career Mentorship",
    date: "Mar 24, 2026",
    time: "4:30 PM",
    duration: "30 mins",
    amount: 25,
    status: "confirmed",
  },
  {
    id: "3",
    client: "Vilay Souvannaphoum",
    service: "Project Architecture Review",
    date: "Mar 25, 2026",
    time: "10:00 AM",
    duration: "1.5 hours",
    amount: 75,
    status: "pending",
  },
]

const consultationRequests = [
  {
    id: "1",
    client: "Sengphet Philavong",
    title: "Need help with React Native navigation",
    budget: "40-60 Kip",
    skills: ["React Native", "JavaScript"],
    postedAt: "2 hours ago",
  },
  {
    id: "2",
    client: "Anousone Vongkhamxao",
    title: "Database optimization for e-commerce site",
    budget: "80-100 Kip",
    skills: ["PostgreSQL", "Performance"],
    postedAt: "5 hours ago",
  },
]

const recentReviews = [
  {
    id: "1",
    client: "Souksamay K.",
    rating: 5,
    comment: "Excellent guidance on system architecture. Very knowledgeable!",
    date: "2 days ago",
  },
  {
    id: "2",
    client: "Phoukhong M.",
    rating: 5,
    comment: "Helped me debug a complex issue in minutes. Highly recommend!",
    date: "5 days ago",
  },
]

export default function DeveloperDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="developer"
        userName="Somsak Phommavong"
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, <span className="gradient-text">Somsak</span>
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Here{"'"}s what{"'"}s happening with your consultations today.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Available for Booking
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">
                      {stat.prefix}
                      {stat.isDecimal ? stat.value : (
                        <AnimatedCounter end={stat.value} duration={1500 + index * 200} />
                      )}
                      {stat.suffix}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Upcoming Bookings */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Bookings
                    </CardTitle>
                    <CardDescription>Your scheduled consultations</CardDescription>
                  </div>
                  <Link to="/developer/bookings">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="group flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card sm:flex-row sm:items-center sm:justify-between"
                      >
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
                              <span className="text-primary font-medium">{booking.amount} Kip</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }
                          >
                            {booking.status}
                          </Badge>
                          {booking.status === "pending" ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" className="h-8">
                              <Video className="mr-1 h-4 w-4" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Requests */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Consultation Requests
                    </CardTitle>
                    <CardDescription>Projects matching your skills</CardDescription>
                  </div>
                  <Link to="/developer/posts">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultationRequests.map((request) => (
                      <div
                        key={request.id}
                        className="group rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-secondary text-xs">
                                  {request.client.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">{request.client}</span>
                              <span className="text-xs text-muted-foreground">• {request.postedAt}</span>
                            </div>
                            <h4 className="mt-2 font-semibold">{request.title}</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {request.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">{request.budget}</span>
                            <Button size="sm">
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Link to="/developer/availability">
                    <Button variant="outline" className="w-full justify-between hover:border-primary/30">
                      Set Availability
                      <Clock className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/developer/services">
                    <Button variant="outline" className="w-full justify-between hover:border-primary/30">
                      Manage Services
                      <Briefcase className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/developer/profile">
                    <Button variant="outline" className="w-full justify-between hover:border-primary/30">
                      Edit Profile
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Reviews</CardTitle>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">4.9</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{review.client}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                        <span className="mt-1 block text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Summary */}
              <Card className="border-border bg-gradient-to-br from-primary/10 via-card to-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Gross Earnings</span>
                      <span className="font-semibold">1,245 Kip</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Platform Fee (10%)</span>
                      <span className="text-muted-foreground">-124.50 Kip</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Net Earnings</span>
                        <span className="text-xl font-bold text-primary">1,120.50 Kip</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/developer/earnings">
                    <Button variant="outline" className="mt-4 w-full">
                      View Details
                    </Button>
                  </Link>
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
    </div>
  )
}
