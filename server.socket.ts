// server.socket.ts
// Standalone Socket.io server for Render deployment.
// Handles real-time admin ↔ dealer messaging only.
// Next.js runs separately on Vercel — this file has no knowledge of it.

import { createServer } from "http"
import { Server as SocketIOServer, Socket } from "socket.io"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
].filter((o): o is string => Boolean(o))

const httpServer = createServer((req, res) => {
  // Health check endpoint — Render requires an open port with HTTP response
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.end("OK")
    return
  }
  res.writeHead(404)
  res.end()
})

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

const onlineUsers = new Map<string, string>()

interface MessagePayload {
  conversationId: string
  senderId: string
  receiverId: string
  content: string
}

io.on("connection", (socket: Socket) => {
  socket.on("register", (userId: string) => {
    if (typeof userId !== "string" || !userId) return
    onlineUsers.set(userId, socket.id)
    socket.join(`user:${userId}`)
  })

  socket.on("join_conversation", (conversationId: string) => {
    if (typeof conversationId !== "string") return
    socket.join(`conversation:${conversationId}`)
  })

  socket.on("send_message", async (payload: MessagePayload) => {
    const { conversationId, senderId, receiverId, content } = payload
    if (!senderId || !receiverId || !content?.trim() || !conversationId) return
    if (content.length > 2000) return

    try {
      const message = await prisma.message.create({
        data: { senderId, receiverId, content: content.trim() },
        include: { sender: { select: { name: true, role: true } } },
      })

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })

      io.to(`conversation:${conversationId}`).emit("new_message", {
        id: message.id,
        conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
        senderName: message.sender.name,
        senderRole: message.sender.role,
      })

      io.to(`user:${receiverId}`).emit("unread_count_changed")
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      console.error("[SOCKET_SEND_MESSAGE]", msg)
      socket.emit("message_error", "Failed to send message")
    }
  })

  socket.on(
    "mark_read",
    async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (!conversationId || !userId) return
      try {
        await prisma.message.updateMany({
          where: { receiverId: userId, isRead: false },
          data: { isRead: true },
        })
        io.to(`conversation:${conversationId}`).emit("messages_read", { conversationId })
        io.to(`user:${userId}`).emit("unread_count_changed")
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        console.error("[SOCKET_MARK_READ]", msg)
      }
    }
  )

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)
        break
      }
    }
  })
})

const PORT = parseInt(process.env.PORT ?? "10000", 10)

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.io server running on port ${PORT}`)
  console.log(`Accepting connections from: ${ALLOWED_ORIGINS.join(", ")}`)
})