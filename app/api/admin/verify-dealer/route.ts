import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const pendingDealers = await prisma.dealerProfile.findMany({
      where: {
        isVerified: false
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(pendingDealers)
  } catch (error: unknown) {
    console.error("[DEALER_VERIFICATION_GET]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { dealerId, action } = body // action: 'approve' | 'reject'

    if (!dealerId || !action) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    if (action === "approve") {
      const dealer = await prisma.dealerProfile.update({
        where: { id: dealerId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        }
      })

      // Create notification for dealer
      await prisma.notification.create({
        data: {
          type: "DEALER_VERIFIED",
          title: "Account Verified",
          message: "Congratulations! Your dealer account has been verified. You can now publish car listings.",
          link: "/dashboard",
          targetRole: "DEALER"
        }
      })

      return NextResponse.json(dealer)
    } else if (action === "reject") {
      const dealer = await prisma.dealerProfile.findUnique({
        where: { id: dealerId }
      })

      if (!dealer) {
        return new NextResponse("Dealer not found", { status: 404 })
      }

      // Notification for rejection
      await prisma.notification.create({
        data: {
          type: "DEALER_VERIFIED",
          title: "Verification Update",
          message: "There was an issue with your dealer verification. Please check your business details and try again.",
          link: "/dashboard",
          targetRole: "DEALER"
        }
      })

      return NextResponse.json({ message: "Dealer verification rejected" })
    }

    return new NextResponse("Invalid action", { status: 400 })
  } catch (error: unknown) {
    console.error("[DEALER_VERIFICATION_POST]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Error", { status: 500 })
  }
}
