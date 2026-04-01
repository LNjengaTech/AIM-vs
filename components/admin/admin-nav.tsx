"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  UserCheck, 
  MessageSquare, 
  Image as ImageIcon, 
  BarChart3, 
  Settings 
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Dealer Verifications",
    href: "/admin/verifications",
    icon: UserCheck,
  },
  {
    title: "Reviews Management",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Hero Section",
    href: "/admin/hero",
    icon: ImageIcon,
  },
  {
    title: "Platform Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

interface AdminNavProps {
  onNavigate?: () => void
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2 p-4">
      {adminNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-4xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
