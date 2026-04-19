/**
 * app/api/admin/notifications/route.ts
 * API route to fetch recent admin-targeted notifications.
 * Only returns platform-wide notifications (buyerId IS NULL).
 * Excludes personal buyer BOLO match notifications.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Only fetch platform-wide notifications (no buyerId = not a personal buyer notification).
    // Buyer BOLO match notifications have buyerId set — those must NOT appear in the admin panel.
    const notifications = await prisma.notification.findMany({
      where: {
        buyerId: null,
        OR: [
          { targetRole: "ADMIN" },
          { targetRole: null }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })

    const unreadCount = await prisma.notification.count({
      where: {
        buyerId: null,
        isRead: false,
        OR: [
          { targetRole: "ADMIN" },
          { targetRole: null }
        ]
      }
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error: unknown) {
    console.error("[ADMIN_NOTIFICATIONS_GET]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Error", { status: 500 })
  }
}
