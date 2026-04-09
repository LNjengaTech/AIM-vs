// app/api/bolo/matches/route.ts
// API route for fetching BOLO matches for the authenticated buyer

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET handler to return all BOLOMatches for the authenticated buyer
 */
export async function GET() {
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

        const matches = await prisma.bOLOMatch.findMany({
            where: {
                boloRequest: {
                    buyerId: buyerProfile.id
                }
            },
            include: {
                car: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                        year: true,
                        price: true,
                        images: true,
                        slug: true,
                    }
                },
                boloRequest: {
                    select: {
                        id: true,
                        make: true,
                        model: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Format response to ensure it's easily consumable by the frontend
        const formattedMatches = matches.map(match => ({
            id: match.id,
            boloRequestId: match.boloRequestId,
            matchScore: match.matchScore,
            createdAt: match.createdAt,
            car: {
                id: match.car.id,
                make: match.car.make,
                model: match.car.model,
                year: match.car.year,
                price: match.car.price,
                image: match.car.images[0] || null,
                slug: match.car.slug
            },
            boloRequest: match.boloRequest
        }))

        return NextResponse.json({ success: true, matches: formattedMatches })
    } catch (error: unknown) {
        console.error("[BOLO_MATCHES_GET_ERROR]", error instanceof Error ? error.message : "Unknown error")
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
