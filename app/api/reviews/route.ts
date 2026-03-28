import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
    content: z.string().min(10, "Review must be at least 10 characters"),
    rating: z.number().min(1).max(5).optional(),
})

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const buyer = await prisma.buyerProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!buyer) return new NextResponse("Buyer profile not found", { status: 404 })

        const body = await req.json()
        const validatedData = reviewSchema.parse(body)

        const review = await prisma.review.create({
            data: {
                buyerId: buyer.id,
                content: validatedData.content,
                rating: validatedData.rating,
                isPublished: false // Default to unpublished until admin approves
            }
        })

        // Create notification for admin
        await prisma.notification.create({
            data: {
                type: "NEW_REVIEW",
                title: "New Review Submitted",
                message: `New review from ${session.user.name}`,
                link: `/admin/reviews?id=${review.id}`
            }
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error("[REVIEW_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
