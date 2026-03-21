import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[ADMIN_NOTIFICATION_READ]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
