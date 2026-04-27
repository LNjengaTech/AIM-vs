"use client"
import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

let socketInstance: Socket | null = null

function getSocket(): Socket {
  if (!socketInstance) {

    //production
    const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL

    //development
    //const url = typeof window !== "undefined" ? window.location.origin : ""
    socketInstance = io(url, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    })
  }
  return socketInstance
}

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return
    const socket = getSocket()
    socketRef.current = socket

    socket.emit("register", userId)

    return () => {
      // We do not disconnect on unmount since we want a singleton 
      // persistent connection across the application.
    }
  }, [userId])

  return socketRef.current ?? getSocket()
}
