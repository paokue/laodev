import { Link, Outlet, useLocation } from "react-router"
import {
  Code2,
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  // MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  DollarSign,
  BookOpen,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { requireAdmin } from "@/lib/admin-session.server"
import { prisma } from "@/lib/prisma"
import type { Route } from "./+types/layout"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/developers", label: "Developers", icon: UserCheck, badgeKey: "pendingDevs" },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/knowledge", label: "Knowledge", icon: BookOpen, badgeKey: "pendingArticles" },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar, badgeKey: "pendingBookings" },
  { href: "/admin/payments", label: "Payments", icon: DollarSign, badgeKey: "pendingPayments" },
  // { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export async function loader({ request }: Route.LoaderArgs) {
  const admin = await requireAdmin(request)

  const [pendingDevs, pendingBookings, pendingPayments] = await Promise.all([
    prisma.developer.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.topUpRequest.count({ where: { status: "PENDING" } }),
  ])

  return {
    admin,
    badges: {
      pendingDevs,
      pendingArticles: 0,
      pendingBookings,
      pendingPayments,
    },
  }
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { admin, badges } = loaderData
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = admin.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Admin Profile */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Link to="/admin" className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{admin.name}</p>
              <p className="truncate text-xs text-white">{admin.email}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3 p-4">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-white hover:bg-secondary hover:text-white"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {link.badgeKey && badges[link.badgeKey as keyof typeof badges] > 0 && (
                  <span className={cn(
                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}>
                    {badges[link.badgeKey as keyof typeof badges]}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <Link
            to="/admin/logout"
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Admin</span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1"><Outlet /></main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
