import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { Server as SocketIOServer, Socket } from "socket.io"
import { PrismaClient } from "@prisma/client"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()
const prisma = new PrismaClient()

// Track online users: Map<userId, socketId>
const onlineUsers = new Map<string, string>()

interface MessagePayload {
  conversationId: string
  senderId: string
  receiverId: string
  content: string
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "/", true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Long-polling fallback for Vercel/environments that don't support WebSockets
    transports: ["websocket", "polling"],
  })

  io.on("connection", (socket: Socket) => {
    // Client sends their userId on connect so we can track presence
    socket.on("register", (userId: string) => {
      if (typeof userId !== "string" || !userId) return
      onlineUsers.set(userId, socket.id)
      ;(socket as any).userId = userId // Store userId on socket instance
      socket.join(`user:${userId}`) // each user joins a private room
    })

    socket.on("join_conversation", (conversationId: string) => {
      if (typeof conversationId !== "string") return
      socket.join(`conversation:${conversationId}`)
    })

    socket.on("send_message", async (payload: MessagePayload) => {
      const { conversationId, senderId, receiverId, content } = payload
      
      // Security: Verify senderId matches the registered userId for this socket
      if ((socket as any).userId !== senderId) {
        console.warn(`[SOCKET] Spoofing attempt detected from socket ${socket.id}`)
        return
      }

      // Basic validation
      if (!senderId || !receiverId || !content?.trim() || !conversationId) return
      if (content.length > 2000) return // max message length

      try {
        // Persist to DB
        const message = await prisma.message.create({
          data: { senderId, receiverId, content: content.trim() },
          include: {
            sender: { select: { name: true, role: true } }
          }
        })

        // Update conversation updatedAt
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        })

        // Broadcast to everyone in the conversation room (sender + receiver)
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

        // Update unread badge for the receiver if they're not in this conversation room
        io.to(`user:${receiverId}`).emit("unread_count_changed")
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        console.error("[SOCKET_SEND_MESSAGE]", msg)
        socket.emit("message_error", "Failed to send message")
      }
    })

    socket.on("mark_read", async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (!conversationId || !userId) return
      try {
        await prisma.message.updateMany({
          where: { receiverId: userId, isRead: false },
          data: { isRead: true }
        })
        // Tell the sender their messages were read
        io.to(`conversation:${conversationId}`).emit("messages_read", { conversationId })
        io.to(`user:${userId}`).emit("unread_count_changed")
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        console.error("[SOCKET_MARK_READ]", msg)
      }
    })

    socket.on("disconnect", () => {
      // Remove from online users map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId)
          break
        }
      }
    })
  })

  const PORT = parseInt(process.env.PORT ?? "3000", 10)
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT} (with Socket.io)`)
  })
})
