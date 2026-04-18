import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const count = await prisma.message.count({
      where: { 
        receiverId: session.user.id, 
        isRead: false 
      }
    })

    return NextResponse.json({ count })
  } catch (error: unknown) {
    console.error("[GET_UNREAD_COUNT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
