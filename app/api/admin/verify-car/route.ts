import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const unverifiedCars = await prisma.car.findMany({
      where: {
        isVerified: false,
        dealer: {
          isVerified: false
        }
      },
      select: {
        id: true,
        slug: true,
        make: true,
        model: true,
        year: true,
        price: true,
        images: true,
        createdAt: true,
        dealer: {
          select: {
            businessName: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(unverifiedCars)
  } catch (error: unknown) {
    console.error("[CAR_VERIFICATION_GET]", error instanceof Error ? error.message : "Unknown error")
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
    const { carId, action } = body // action: 'approve' | 'reject'

    if (!carId || !action) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    if (action === "approve") {
      const car = await prisma.car.update({
        where: { id: carId },
        data: {
          isVerified: true
        }
      })

      // Create notification for dealer
      const dealer = await prisma.car.findUnique({
        where: { id: carId },
        select: { dealerId: true, make: true, model: true }
      })

      if (dealer) {
        await prisma.notification.create({
          data: {
            type: "DEALER_VERIFIED", // Reusing this type or we could add NEW_CAR_LISTING
            title: "Listing Approved",
            message: `Your listing for ${car.make} ${car.model} has been verified and is now live!`,
            link: `/cars/${car.slug}`
          }
        })
      }

      return NextResponse.json(car)
    } else if (action === "reject") {
        // Deleting the car to keep DB clean if it's bad data.
        await prisma.car.delete({
            where: { id: carId }
        })

      return NextResponse.json({ message: "Car listing rejected and removed" })
    }

    return new NextResponse("Invalid action", { status: 400 })
  } catch (error: unknown) {
    console.error("[CAR_VERIFICATION_POST]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Error", { status: 500 })
  }
}
