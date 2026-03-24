import { Link, useRouteLoaderData } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Star,
  Users,
  ArrowRight,
  Search,
  Video,
  Plus,
  Home,
  Sparkles,
  MessageCircle,
} from "lucide-react"

const bottomBarItems = [
  { href: "/user", label: "Home", icon: Home },
  { href: "/user/bookings", label: "Booking", icon: Calendar },
  { href: "/developers", label: "Find Dev", icon: Search },
  { href: "/user/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/profile", label: "Profile", icon: Users },
]

const upcomingBookings = [
  {
    id: "1",
    developer: "Somsak Phommavong",
    title: "Senior Full-Stack Developer",
    service: "React Code Review",
    date: "Mar 24, 2026",
    time: "2:00 PM",
    duration: "1 hour",
    status: "confirmed",
    rating: 4.9,
  },
  {
    id: "2",
    developer: "Keo Bounyavong",
    title: "Mobile App Developer",
    service: "React Native Consultation",
    date: "Mar 26, 2026",
    time: "10:00 AM",
    duration: "30 minutes",
    status: "confirmed",
    rating: 4.8,
  },
]

const recentConsultations = [
  {
    id: "3",
    developer: "Thongchanh Sisouphon",
    title: "DevOps Engineer",
    service: "CI/CD Pipeline Setup",
    date: "Mar 15, 2026",
    duration: "1.5 hours",
    status: "completed",
    hasReview: true,
    rating: 5,
  },
]

const myPosts = [
  {
    id: "1",
    title: "Need help building a React Native app",
    status: "active",
    responses: 3,
    createdAt: "2 days ago",
    budget: "40-60 Kip",
  },
]

const recommendedDevelopers = [
  {
    id: "1",
    name: "Somsak Phommavong",
    title: "Senior Full-Stack Developer",
    skills: ["React", "Node.js", "TypeScript"],
    rating: 4.9,
    reviews: 47,
    hourlyRate: 45,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Keo Bounyavong",
    title: "Mobile App Developer",
    skills: ["React Native", "Flutter"],
    rating: 4.8,
    reviews: 32,
    hourlyRate: 40,
    isAvailable: true,
  },
]

export default function UserDashboardPage() {
  const layoutData = useRouteLoaderData("routes/user/layout") as { user: { name: string; email: string; role: string } } | undefined
  const user = layoutData?.user
  const firstName = user?.name?.split(" ")[0] || "User"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="user"
        userName={user?.name || "User"}
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, <span className="gradient-text">{firstName}</span>
                </h1>
                <p className="mt-1 text-white">
                  Ready to connect with expert developers?
                </p>
              </div>
              <div className="w-full flex items-center justify-between gap-2">
                <Link to="/developers">
                  <Button className="gap-2">
                    <Search className="h-4 w-4" />
                    Find Developers
                  </Button>
                </Link>
                <Link to="/posts/create">
                  <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary">
                    <Plus className="h-4 w-4" />
                    Post Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Upcoming Sessions", value: upcomingBookings.length, icon: Calendar, color: "text-blue-400", bgColor: "bg-blue-500/10" },
              { label: "Completed Sessions", value: recentConsultations.length, icon: Video, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
              { label: "Active Posts", value: myPosts.length, icon: FileText, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
              { label: "Messages", value: 5, icon: MessageSquare, color: "text-purple-400", bgColor: "bg-purple-500/10" },
            ].map((stat) => (
              <Card key={stat.label} className="px-0 py-2 sm:py-4 sm:px-0 group border-border transition-all hover:border-primary/30">
                <CardContent className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-white">{stat.label}</p>
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
                      Upcoming Sessions
                    </CardTitle>
                    <CardDescription>Your scheduled consultations</CardDescription>
                  </div>
                  <Link to="/user/bookings">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-white" />
                      <p className="mt-4 font-medium">No upcoming sessions</p>
                      <p className="mt-1 text-sm text-white">
                        Book a consultation to get started
                      </p>
                      <Link to="/developers">
                        <Button className="mt-4">Browse Developers</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="group flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border border-border">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {booking.developer.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{booking.developer}</p>
                              <p className="text-sm text-white">{booking.service}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white">
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
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              {booking.status}
                            </Badge>
                            <Button size="sm" variant="outline" className="border border-primary/40">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Posts */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      My Posts
                    </CardTitle>
                    <CardDescription>Your project consultation requests</CardDescription>
                  </div>
                  <Link to="/posts/create">
                    <Button size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      New Post
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {myPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-white" />
                      <p className="mt-4 font-medium">No posts yet</p>
                      <p className="mt-1 text-sm text-white">
                        Post a project to get help from developers
                      </p>
                      <Link to="/posts/create">
                        <Button className="mt-4">Create Your First Post</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myPosts.map((post) => (
                        <div
                          key={post.id}
                          className="group flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <h4 className="font-semibold">{post.title}</h4>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white">
                              <span>Posted {post.createdAt}</span>
                              <span className="text-primary font-medium">{post.budget}</span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {post.responses} responses
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              {post.status}
                            </Badge>
                            <Link to={`/user/posts/${post.id}`}>
                              <Button variant="outline" size="sm">
                                View Responses
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Consultations */}
              {recentConsultations.length > 0 && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Recent Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentConsultations.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-secondary">
                                {consultation.developer.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{consultation.developer}</p>
                              <p className="text-sm text-white">{consultation.service}</p>
                              <div className="mt-1 flex items-center gap-3 text-sm text-white">
                                <span>{consultation.date}</span>
                                <span>{consultation.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {consultation.hasReview ? (
                              <div className="flex items-center gap-1 text-yellow-400">
                                {Array.from({ length: consultation.rating }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                              </div>
                            ) : (
                              <Button variant="outline" size="sm">
                                Leave Review
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              Book Again
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="hidden sm:block space-y-6">

              {/* Recommended Developers */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recommended
                  </CardTitle>
                  <Link to="/developers">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendedDevelopers.map((dev) => (
                    <Link to={`/developers/${dev.id}`}>
                      <div
                        key={dev.id}
                        className="mb-2 group rounded-lg border border-border p-3 transition-all hover:border-primary/30"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {dev.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">{dev.name}</p>
                              {dev.isAvailable && (
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              )}
                            </div>
                            <p className="text-xs text-white truncate">{dev.title}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              <span className="flex items-center gap-0.5 text-yellow-400">
                                <Star className="h-3 w-3 fill-current" />
                                {dev.rating}
                              </span>
                              <span className="text-white">({dev.reviews})</span>
                              <span className="text-primary">{dev.hourlyRate} Kip/hr</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Somsak P.", message: "Looking forward to our session!", time: "2h ago" },
                      { name: "Keo B.", message: "I can help with your mobile app", time: "5h ago" },
                    ].map((msg, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{msg.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{msg.name}</p>
                          <p className="truncate text-sm text-white">{msg.message}</p>
                        </div>
                        <span className="text-xs text-white">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/user/messages">
                    <Button variant="ghost" className="mt-4 w-full">
                      View All Messages
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
