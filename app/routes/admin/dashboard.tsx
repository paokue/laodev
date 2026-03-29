import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserCheck,
  FileText,
  BookOpen,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Link } from "react-router"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-session.server"
import type { Route } from "./+types/dashboard"

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const [
    totalUsers,
    totalDevelopers,
    totalPosts,
    totalArticles,
    pendingDevelopers,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.developer.count(),
    prisma.post.count(),
    prisma.article.count(),
    prisma.developer.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        topic: true,
        amount: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
        developer: { select: { user: { select: { name: true } } } },
      },
    }),
  ])

  return {
    stats: {
      totalUsers,
      totalDevelopers,
      totalPosts,
      totalArticles,
    },
    pendingDevelopers: pendingDevelopers.map((d) => ({
      id: d.id,
      name: d.user.name,
      email: d.user.email,
      title: d.title,
      appliedAt: timeAgo(new Date(d.createdAt)),
    })),
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      client: b.user.name,
      developer: b.developer.user.name,
      topic: b.topic,
      amount: b.amount,
      status: b.status.toLowerCase(),
      date: timeAgo(new Date(b.createdAt)),
    })),
  }
}

export default function AdminDashboardPage({ loaderData }: Route.ComponentProps) {
  const { stats, pendingDevelopers, recentBookings } = loaderData

  const statCards = [
    { title: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users },
    { title: "Total Developers", value: stats.totalDevelopers.toLocaleString(), icon: UserCheck },
    { title: "Total Posts", value: stats.totalPosts.toLocaleString(), icon: FileText },
    { title: "Knowledge Sharing", value: stats.totalArticles.toLocaleString(), icon: BookOpen },
  ]

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-white">
          Welcome back! Here{"'"}s what{"'"}s happening with LaoDev.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
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
            {pendingDevelopers.length === 0 ? (
              <p className="text-sm text-white text-center py-6">No pending applications</p>
            ) : (
              <div className="space-y-4">
                {pendingDevelopers.map((dev) => (
                  <div
                    key={dev.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                        {dev.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium">{dev.name}</p>
                        <p className="text-sm text-white">{dev.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-1 text-sm text-white">
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
            )}
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
            {recentBookings.length === 0 ? (
              <p className="text-sm text-white text-center py-6">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {booking.client} → {booking.developer}
                      </p>
                      <p className="text-xs text-white mt-0.5">{booking.topic}</p>
                      <p className="text-xs text-white">{booking.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary text-sm">
                        {booking.amount.toLocaleString()} Kip
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          booking.status === "completed"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                            : booking.status === "cancelled"
                              ? "border-destructive/50 bg-destructive/10 text-destructive"
                              : "border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
