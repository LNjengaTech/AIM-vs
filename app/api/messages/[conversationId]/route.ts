import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Verify user is a participant
    if (conversation.dealerId !== session.user.id && conversation.adminId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: conversation.dealerId, receiverId: conversation.adminId },
          { senderId: conversation.adminId, receiverId: conversation.dealerId },
        ]
      },
      orderBy: { createdAt: "asc" },
      take: 50,
      include: { sender: { select: { name: true, role: true } } }
    })

    return NextResponse.json(messages)
  } catch (error: unknown) {
    console.error("[GET_MESSAGES]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  _req: Request,
  { params: _params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // We can also extract conversationId if needed:
    // const { conversationId } = await params

    // Mark messages where receiver is current user as read
    await prisma.message.updateMany({
      where: { 
        receiverId: session.user.id,
        isRead: false,
        // we can also scope it to sender if needed, but any message meant for this user in this conversation context
        // is technically handled here. 
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[PATCH_MESSAGES_READ]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
