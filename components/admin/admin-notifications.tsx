"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  Store, 
  UserCheck, 
  Car
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: "POST" })
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "NEW_DEALER": return <Store className="h-4 w-4 text-purple-500" />
      case "NEW_REVIEW": return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "DEALER_VERIFIED": return <UserCheck className="h-4 w-4 text-green-500" />
      case "NEW_CAR_LISTING": return <Car className="h-4 w-4 text-orange-500" />
      default: return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full p-2 hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4">
              {unreadCount} New
            </Badge>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className={cn(
                  "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted/50",
                  !n.isRead && "bg-primary/5"
                )}
                onSelect={() => markAsRead(n.id)}
              >
                <div className="flex w-full items-start justify-between gap-3">
                   <div className="mt-1">{getIcon(n.type)}</div>
                   <div className="flex-1 space-y-1">
                      <p className={cn("text-sm leading-none", !n.isRead ? "font-bold" : "font-medium text-muted-foreground")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                   </div>
                   {!n.isRead && (
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                   )}
                </div>
                <div className="flex w-full items-center justify-between mt-2 pt-2 border-t border-muted/30">
                   <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(n.createdAt).toLocaleDateString()}
                   </div>
                   {n.link && (
                      <Link 
                        href={n.link} 
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(n.id)
                        }}
                      >
                         View <ExternalLink className="h-2 w-2" />
                      </Link>
                   )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full text-center justify-center p-2 text-xs font-medium text-primary hover:bg-transparent">
           View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
