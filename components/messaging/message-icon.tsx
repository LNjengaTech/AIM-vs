"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { useUnreadMessageCount } from "@/hooks/use-unread-message-count"
import { MessageDrawer } from "./message-drawer"

interface MessageIconProps {
  userId: string
  role: "ADMIN" | "DEALER"
}

export default function MessageIcon({ userId, role }: MessageIconProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = useUnreadMessageCount(userId)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Messages"
      >
        <MessageSquare className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Messages</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <MessageDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        userId={userId} 
        role={role} 
      />
    </>
  )
}
