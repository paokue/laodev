import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface BottomBarItem {
  href: string
  label: string
  icon: LucideIcon
}

interface BottomBarProps {
  items: BottomBarItem[]
}

export function BottomBar({ items }: BottomBarProps) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Safe area for iOS devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
