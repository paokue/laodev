import { Link, Form, useLocation } from "react-router"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Code2,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Home,
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  LayoutDashboard,
  LucideIcon,
} from "lucide-react"

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/developers", label: "Developers" },
  { href: "/posts", label: "Posts" },
  { href: "/knowledge", label: "Knowledge Sharing" },
]

const userMenuItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/user", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/bookings", label: "My Bookings", icon: Calendar },
  { href: "/user/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/profile", label: "Profile", icon: User },
]

const developerMenuItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/developer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/developer/bookings", label: "My Bookings", icon: Calendar },
  { href: "/developer/articles", label: "My Articles", icon: FileText },
  { href: "/developer/earnings", label: "Earnings", icon: DollarSign },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: User },
]

interface DashboardHeaderProps {
  userType: "developer" | "user"
  userName: string
  navItems?: { href: string; label: string; icon?: LucideIcon }[]
}

export function DashboardHeader({ userType, userName }: DashboardHeaderProps) {
  const location = useLocation()
  const pathname = location.pathname
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2)
  const menuItems = userType === "developer" ? developerMenuItems : userMenuItems

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-background/50 backdrop-blur-sm"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary transition-all duration-300 group-hover:scale-105 group-hover:glow-sm">
            <Code2 className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Lao<span className="gradient-text">Dev</span>
          </span>
        </Link>

        {/* Desktop Navigation - same as landing page */}
        <div className="hidden items-center gap-1 md:flex">
          {mainNavLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm transition-colors",
                  isActive ? "text-primary" : "text-white hover:text-white"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute bottom-0 left-4 right-4 h-px bg-primary transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )} />
              </Link>
            )
          })}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{userName}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-4 px-1.5 text-[10px]",
                      userType === "developer"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-blue-500/10 text-blue-400"
                    )}
                  >
                    {userType === "developer" ? "Developer" : "User"}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border bg-card/95 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-white">
                    {userType === "developer" ? "Developer Account" : "User Account"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link to={item.href} className="cursor-pointer">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Form method="post" action="/logout">
                  <button type="submit" className="flex w-full items-center text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border bg-card/95 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-white">
                    {userType === "developer" ? "Developer Account" : "User Account"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link to={item.href} className="cursor-pointer">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Form method="post" action="/logout">
                  <button type="submit" className="flex w-full items-center text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}
