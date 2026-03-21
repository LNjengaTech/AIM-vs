import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      include: {
        buyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("[ADMIN_REVIEWS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { reviewId, action } = body // action: 'publish' | 'remove' | 'republish'

    if (!reviewId || !action) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    let updatedReview

    if (action === "publish" || action === "republish") {
      updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          isPublished: true,
          isRemoved: false
        }
      })
    } else if (action === "remove") {
      updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          isPublished: false,
          isRemoved: true
        }
      })
    } else {
      return new NextResponse("Invalid action", { status: 400 })
    }

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("[ADMIN_REVIEWS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
