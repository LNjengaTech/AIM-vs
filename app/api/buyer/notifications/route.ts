// /home/lonnex/Desktop/PROJECTS/aim-mombasa/aim-mombasa-ag/app-src/app/api/buyer/notifications/route.ts
// Handles fetching unread notifications for the authenticated buyer

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "BUYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: "Buyer profile not found" }, { status: 404 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        buyerId: buyerProfile.id,
        isRead: false
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const unreadCount = notifications.length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error: unknown) {
    console.error("[BUYER_NOTIFICATIONS_GET]", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
