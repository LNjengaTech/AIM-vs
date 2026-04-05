// app/api/cars/route.ts
// API route for car listing management (Creation, Fetching)

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { carSchema } from "@/lib/validations/car"
import { generateUniqueCarSlug } from "@/lib/utils/slug"

/**
 * POST handler to create a new car listing
 */
export async function POST(req: Request) {
    try {
        const session = await auth()

        // Dealer only authorization
        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const validation = carSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const data = validation.data

        // Get dealer profile
        const dealerProfile = await prisma.dealerProfile.findUnique({
            where: { userId: session.user.id },
        })

        if (!dealerProfile) {
            return NextResponse.json(
                { error: "Dealer profile not found" },
                { status: 404 }
            )
        }

        // Calculate completeness score (Senior Logic)
        let score = 50 // Base score for required fields
        if (data.description && data.description.length > 50) score += 10
        if (data.images && data.images.length > 0) score += 10
        if (data.images && data.images.length >= 5) score += 10
        if (data.features && data.features.length >= 3) score += 10
        if (score > 100) score = 100

        // Generate robust unique slug from make, model, year
        const slug = await generateUniqueCarSlug(data.make, data.model, data.year, prisma)

        // Create car in database
        const car = await prisma.car.create({
            data: {
                dealerId: dealerProfile.id,
                slug: slug, // Enforced non-null and unique
                make: data.make,
                model: data.model,
                year: data.year,
                price: data.price,
                mileage: data.mileage,
                condition: data.condition,
                description: data.description,
                bodyType: data.bodyType,
                transmission: data.transmission,
                fuelType: data.fuelType,
                color: data.color,
                engineCapacity: data.engineCapacity,
                features: data.features,
                images: data.images,
                isFeatured: data.isFeatured,
                negotiable: data.negotiable,
                completenessScore: score,
                status: "AVAILABLE",
                isVerified: false, // New cars must be verified by admin
                has360View: false,
                aiVerified: false,
            },
        })

        return NextResponse.json({ success: true, car }, { status: 201 })
    } catch (error: unknown) {
        console.error("[CAR_POST_ERROR]", error instanceof Error ? error.message : "Unknown error")
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
