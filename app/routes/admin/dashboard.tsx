import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserCheck,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Link } from "react-router"

const stats = [
  {
    title: "Total Users",
    value: "2,345",
    change: "+12%",
    icon: Users,
  },
  {
    title: "Verified Developers",
    value: "512",
    change: "+8%",
    icon: UserCheck,
  },
  {
    title: "Active Posts",
    value: "89",
    change: "+23%",
    icon: FileText,
  },
  {
    title: "Total Revenue",
    value: "45,670 Kip",
    change: "+18%",
    icon: DollarSign,
  },
]

const pendingDevelopers = [
  {
    id: "1",
    name: "Khamphanh Sengmany",
    email: "khamphanh@email.com",
    title: "Frontend Developer",
    appliedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Vilay Southammavong",
    email: "vilay@email.com",
    title: "Data Scientist",
    appliedAt: "5 hours ago",
  },
  {
    id: "3",
    name: "Chanthone Keobounphanh",
    email: "chanthone@email.com",
    title: "Backend Developer",
    appliedAt: "1 day ago",
  },
]

const recentBookings = [
  {
    id: "1",
    client: "Bounmy K.",
    developer: "Somsak P.",
    amount: "45 Kip",
    status: "completed",
    date: "Today",
  },
  {
    id: "2",
    client: "Viengkham T.",
    developer: "Keo B.",
    amount: "40 Kip",
    status: "pending",
    date: "Today",
  },
  {
    id: "3",
    client: "Manivanh S.",
    developer: "Thongchanh S.",
    amount: "55 Kip",
    status: "completed",
    date: "Yesterday",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here{"'"}s what{"'"}s happening with LaoDev.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">{stat.change}</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Developer Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Developer applications awaiting review</CardDescription>
            </div>
            <Link to="/admin/developers">
              <Button variant="outline" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDevelopers.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                      {dev.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium">{dev.name}</p>
                      <p className="text-sm text-muted-foreground">{dev.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {dev.appliedAt}
                    </div>
                    <Link to={`/admin/developers/${dev.id}`}>
                      <Button size="sm">Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest consultation bookings</CardDescription>
            </div>
            <Link to="/admin/bookings">
              <Button variant="outline" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {booking.client} → {booking.developer}
                    </p>
                    <p className="text-sm text-muted-foreground">{booking.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">
                      {booking.amount}
                    </span>
                    <Badge
                      variant={
                        booking.status === "completed" ? "default" : "secondary"
                      }
                      className={
                        booking.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : ""
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
