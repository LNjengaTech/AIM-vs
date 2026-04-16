/**
 * app/api/cars/[slug]/route.ts
 * API route for individual car listing management (Update status, Delete).
 * Identified by unique slug.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateCompletenessScore } from "@/lib/utils"
import { generateUniqueCarSlug } from "@/lib/utils/slug"

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params

        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { slug },
            include: { dealer: true },
        })

        if (!car) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 })
        }

        if (car.dealer.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await prisma.car.delete({ where: { slug } })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error("[CAR_DELETE_ERROR]", error instanceof Error ? error.message : "Unknown error")
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params
        const body = await req.json()

        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { slug },
            include: { dealer: true },
        })

        if (!car) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 })
        }

        if (car.dealer.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // If this is just a status update from the inventory list
        if (Object.keys(body).length === 1 && body.status) {
            const updatedCar = await prisma.car.update({
                where: { slug },
                data: { status: body.status },
            })
            return NextResponse.json(updatedCar)
        }

        // Handle full update from the Edit Car form
        const {
            make,
            model,
            year,
            price,
            mileage,
            condition,
            description,
            bodyType,
            transmission,
            fuelType,
            color,
            engineCapacity,
            features,
            images,
            isFeatured,
            negotiable,
        } = body

        // Calculate completeness score
        const has360View = (images?.length || 0) >= 24
        const completenessScore = calculateCompletenessScore({
            images,
            description,
            has360View,
            features,
        })

        // Check if slug-affecting fields changed
        let newSlug = slug
        if (
            (make && make !== car.make) ||
            (model && model !== car.model) ||
            (year && year !== car.year)
        ) {
            newSlug = await generateUniqueCarSlug(
                make || car.make,
                model || car.model,
                year || car.year,
                prisma
            )
        }

        const updatedCar = await prisma.car.update({
            where: { slug },
            data: {
                make,
                model,
                year,
                price,
                mileage,
                condition,
                description,
                bodyType,
                transmission,
                fuelType,
                color,
                engineCapacity,
                features,
                images,
                isFeatured,
                negotiable,
                has360View,
                completenessScore,
                slug: newSlug,
            },
        })

        return NextResponse.json(updatedCar)
    } catch (error: unknown) {
        console.error("[CAR_PATCH_ERROR]", error instanceof Error ? error.message : "Unknown error")
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
