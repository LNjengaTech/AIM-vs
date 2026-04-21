// app/api/messages/conversations/route.ts
// API route for managing chat conversations. Handles fetching and creating conversations.

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId, role } = session.user

    if (role === "ADMIN") {
      // Admin sees all dealer conversations
      const conversations = await prisma.conversation.findMany({
        where: { adminId: userId },
        include: {
          dealer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" }
      })
      
      // Calculate unread counts per conversation

      const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'], // messages from dealers to admin
        where: {
          receiverId: userId,
          isRead: false,
          senderId: { in: conversations.map((c: { dealerId: string }) => c.dealerId) }
        },
        _count: {
          id: true,
        },
      })

      const countsMap = new Map(unreadCounts.map((u: { senderId: string, _count: { id: number } }) => [u.senderId, u._count.id]))

      const result = conversations.map((c: { dealerId: string; [key: string]: unknown }) => ({
        ...c,
        unreadCount: countsMap.get(c.dealerId) || 0
      }))

      return NextResponse.json(result)
    } else if (role === "DEALER") {
      // Dealer sees only their conversation with admin
      const conversation = await prisma.conversation.findUnique({
        where: { dealerId: userId },
        include: { admin: { select: { id: true, name: true } } }
      })
      
      return NextResponse.json({ conversation: conversation ?? null })
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 403 })
  } catch (error: unknown) {
    console.error("[GET_CONVERSATIONS]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dealerId = session.user.id

    // Find an admin user to assign to this conversation
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    })

    if (!admin) {
      return NextResponse.json({ error: "No admin found" }, { status: 404 })
    }

    const conversation = await prisma.conversation.upsert({
      where: { dealerId },
      update: {},
      create: {
        dealerId,
        adminId: admin.id,
      }
    })

    return NextResponse.json(conversation)
  } catch (error: unknown) {
    console.error("[POST_CONVERSATION]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
