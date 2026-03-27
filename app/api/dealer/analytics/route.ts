// API route for dealer analytics

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Get dealer profile
        const dealerProfile = await prisma.dealerProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!dealerProfile) {
            return NextResponse.json(
                { error: "Dealer profile not found" },
                { status: 404 }
            )
        }

        // Get all dealer's cars
        const cars = await prisma.car.findMany({
            where: { dealerId: dealerProfile.id },
            select: { id: true, status: true }
        })

        const carIds = cars.map(c => c.id)

        // Analytics Calculations
        const [
            totalViews,
            totalFavorites,
            totalLeads,
            totalInventory,
            soldCars,
            recentEngagements
        ] = await Promise.all([
            // Total unique views (VIEW engagements)
            prisma.engagement.count({
                where: {
                    carId: { in: carIds },
                    type: "VIEW"
                }
            }),

            // Total favorites
            prisma.engagement.count({
                where: {
                    carId: { in: carIds },
                    type: "FAVORITE"
                }
            }),

            // Total leads (CONTACT or CALL engagements)
            // Note: For now counting FAVORITE as leads until CONTACT type is added
            prisma.engagement.count({
                where: {
                    carId: { in: carIds },
                    type: "FAVORITE"
                }
            }),

            // Total inventory count
            prisma.car.count({
                where: { dealerId: dealerProfile.id }
            }),

            // Sold cars count
            prisma.car.count({
                where: {
                    dealerId: dealerProfile.id,
                    status: "SOLD"
                }
            }),

            // Recent engagements (last 10)
            prisma.engagement.findMany({
                where: { carId: { in: carIds } },
                include: {
                    buyer: {
                        include: {
                            user: {
                                select: { name: true, email: true }
                            }
                        }
                    },
                    car: {
                        select: { make: true, model: true, year: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 10
            })
        ])

        // Calculate views by car for top performing cars
        const viewsByCar = await prisma.engagement.groupBy({
            by: ['carId'],
            where: {
                carId: { in: carIds },
                type: "VIEW"
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        })

        // Get car details for top performing
        const topCarIds = viewsByCar.map(v => v.carId)
        const topCars = await prisma.car.findMany({
            where: { id: { in: topCarIds } },
            select: {
                id: true,
                make: true,
                model: true,
                year: true,
                images: true
            }
        })

        const topPerformingCars = viewsByCar.map(view => {
            const car = topCars.find(c => c.id === view.carId)
            return {
                car: car,
                views: view._count.id
            }
        })

        // Format recent activity
        const recentActivity = recentEngagements.map(engagement => ({
            id: engagement.id,
            type: engagement.type,
            buyerName: engagement.buyer.user.name,
            buyerEmail: engagement.buyer.user.email,
            carName: `${engagement.car.year} ${engagement.car.make} ${engagement.car.model}`,
            timestamp: engagement.createdAt
        }))

        return NextResponse.json({
            analytics: {
                totalViews,
                totalFavorites,
                totalLeads,
                totalInventory,
                totalSales: soldCars,
                availableCars: cars.filter(c => c.status === "AVAILABLE").length
            },
            topPerformingCars,
            recentActivity
        })

    } catch (error) {
        console.error("Dealer analytics error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
