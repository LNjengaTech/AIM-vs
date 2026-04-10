// /home/lonnex/Desktop/PROJECTS/aim-mombasa/aim-mombasa-ag/app-src/app/api/buyer/notifications/[id]/read/route.ts
// Handles marking a single buyer notification as read

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const notificationId = resolvedParams.id

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification || notification.buyerId !== buyerProfile.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 })
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    console.error("[BUYER_NOTIFICATION_READ_PATCH]", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
