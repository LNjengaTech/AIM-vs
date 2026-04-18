"use client"
import { useState, useEffect } from "react"
import { useSocket } from "./use-socket"

export function useUnreadMessageCount(userId: string | undefined) {
  const [count, setCount] = useState(0)
  const socket = useSocket(userId)

  useEffect(() => {
    if (!userId) return

    // Initial HTTP fetch
    fetch("/api/messages/unread-count")
      .then(r => r.json())
      .then((data: unknown) => {
        if (typeof data === "object" && data !== null && "count" in data) {
          setCount(Number((data as Record<string, unknown>).count))
        }
      })
      .catch((err) => {
        console.error("Failed to fetch unread count:", err)
      })

    // Real-time update
    const handleUnreadChanged = () => {
      fetch("/api/messages/unread-count")
        .then(r => r.json())
        .then((data: unknown) => {
          if (typeof data === "object" && data !== null && "count" in data) {
            setCount(Number((data as Record<string, unknown>).count))
          }
        })
        .catch(() => {})
    }

    socket.on("unread_count_changed", handleUnreadChanged)
    return () => { 
      socket.off("unread_count_changed", handleUnreadChanged) 
    }
  }, [socket, userId])

  return count
}
