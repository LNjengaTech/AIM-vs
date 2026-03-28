// app/api/favorites/route.ts
// API route for toggling car favorites

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== "BUYER") {
            return NextResponse.json(
                { error: "Unauthorized. Buyers only." },
                { status: 401 }
            )
        }

        const { carId } = await request.json()

        if (!carId) {
            return NextResponse.json(
                { error: "Car ID is required" },
                { status: 400 }
            )
        }

        // Check if buyer profile exists
        const buyerProfile = await prisma.buyerProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!buyerProfile) {
            return NextResponse.json(
                { error: "Buyer profile not found" },
                { status: 404 }
            )
        }

        // Check if favorite already exists
        const existing = await prisma.favorite.findUnique({
            where: {
                buyerId_carId: {
                    buyerId: buyerProfile.id,
                    carId: carId
                }
            }
        })

        if (existing) {
            // Remove favorite
            await prisma.favorite.delete({
                where: { id: existing.id }
            })

            return NextResponse.json({
                isFavorited: false,
                message: "Removed from favorites"
            })
        } else {
            // Add favorite
            await prisma.favorite.create({
                data: {
                    buyerId: buyerProfile.id,
                    carId: carId
                }
            })

            // Track engagement
            await prisma.engagement.create({
                data: {
                    buyerId: buyerProfile.id,
                    carId: carId,
                    type: "FAVORITE"
                }
            })

            return NextResponse.json({
                isFavorited: true,
                message: "Added to favorites"
            })
        }
    } catch (error) {
        console.error("Favorites API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(_request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== "BUYER") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const buyerProfile = await prisma.buyerProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                favorites: {
                    include: {
                        car: {
                            include: {
                                dealer: true
                            }
                        }
                    }
                }
            }
        })

        if (!buyerProfile) {
            return NextResponse.json({ favorites: [] })
        }

        return NextResponse.json({
            favorites: buyerProfile.favorites.map(fav => fav.car)
        })
    } catch (error) {
        console.error("Get favorites error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
