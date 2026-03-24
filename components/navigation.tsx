import { useState, useEffect } from "react"
import { Link, Form, useLocation, useRouteLoaderData } from "react-router"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Code2, ChevronDown, Sparkles, User, Calendar, FileText, MessageSquare, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/developers", label: "Developers" },
  { href: "/posts", label: "Posts" },
  { href: "/knowledge", label: "Knowledge Sharing" },
]

export function Navigation() {
  const rootData = useRouteLoaderData("root") as { user?: { name: string; email: string; role: string } | null } | undefined
  const user = rootData?.user
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || ""

  const userMenuItems = user?.role === "DEVELOPER"
    ? [
      { href: "/developer", label: "Dashboard", icon: User },
      { href: "/developer/bookings", label: "My Bookings", icon: Calendar },
      { href: "/developer/earnings", label: "Earnings", icon: FileText },
      { href: "/developer/messages", label: "Messages", icon: MessageSquare },
      { href: "/developer/profile", label: "Profile", icon: Settings },
    ]
    : [
      { href: "/user", label: "Dashboard", icon: User },
      { href: "/user/bookings", label: "My Bookings", icon: Calendar },
      { href: "/user/messages", label: "Messages", icon: MessageSquare },
      { href: "/user/profile", label: "Profile", icon: Settings },
    ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary transition-all duration-300 group-hover:scale-105 group-hover:glow-sm">
            <Code2 className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            LAO<span className="gradient-text">DEV</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card/50 py-1.5 pl-1.5 pr-3 transition-colors hover:border-primary/50 hover:bg-card">
                  <Avatar className="h-7 w-7 border border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-card/95 backdrop-blur-xl">
                <DropdownMenuLabel>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-white font-normal">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userMenuItems.map((item) => (
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
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="outline" className="group border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                  Log In
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="group gap-1.5 glow-sm hover:glow transition-all">
                    Get Started
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-border bg-card/95 backdrop-blur-xl">
                  <DropdownMenuItem asChild>
                    <Link to="/register/developer" className="cursor-pointer flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      Join as Developer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register/user" className="cursor-pointer flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Join as User
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/50 transition-colors hover:bg-card md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="relative h-5 w-5">
            <span className={cn(
              "absolute left-0 top-1/2 h-0.5 w-5 bg-current transition-all duration-300",
              isOpen ? "rotate-45" : "-translate-y-1.5"
            )} />
            <span className={cn(
              "absolute left-0 top-1/2 h-0.5 w-5 bg-current transition-all duration-300",
              isOpen ? "opacity-0" : "opacity-100"
            )} />
            <span className={cn(
              "absolute left-0 top-1/2 h-0.5 w-5 bg-current transition-all duration-300",
              isOpen ? "-rotate-45" : "translate-y-1.5"
            )} />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        "absolute left-0 right-0 top-full overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden",
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 border-transparent"
      )}>
        <div className="px-4 py-4 border border-primary rounded-md bg-primary/20">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, index) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "border-l-2 px-4 py-3 text-sm transition-colors animate-fade-in-up opacity-0",
                    isActive
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-white hover:bg-secondary hover:text-white"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            <hr className="my-2 border-border" />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-white">{user.email}</p>
                  </div>
                </div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white hover:bg-secondary hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <Form method="post" action="/logout">
                  <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-destructive hover:bg-secondary">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </Form>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center border border-primary">Log In</Button>
                </Link>
                <div className="flex items-center justify-between gap-2">
                  <Link to="/register/user" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full gap-2 border-primary/30">
                      <Sparkles className="h-4 w-4" />
                      Join as User
                    </Button>
                  </Link>
                  <Link to="/register/developer" onClick={() => setIsOpen(false)} className="w-full">
                    <Button className="w-full gap-2">
                      <Code2 className="h-4 w-4" />
                      Join as Developer
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
