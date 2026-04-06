/**
 * app/api/admin/notifications/route.ts
 * API route to fetch recent admin-targeted notifications.
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

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetRole: "ADMIN" },
          { targetRole: null }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })

    return NextResponse.json(notifications)
  } catch (error: unknown) {
    console.error("[ADMIN_NOTIFICATIONS_GET]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Error", { status: 500 })
  }
}
