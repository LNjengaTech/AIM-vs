/**
 * app/api/dealer/analytics/route.ts
 * Dealer analytics API — queries live Engagement and Car tables directly.
 * The DealerAnalytics cache table is never written to, so it always returned 0.
 * This fix reads real data from the source tables.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dealer = await prisma.dealerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })
    if (!dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    const dealerId = dealer.id

    // Total views across all dealer's cars
    const totalViews = await prisma.engagement.count({
      where: {
        type: "VIEW",
        car: { dealerId }
      }
    })

    // Total favourites — used as "leads" proxy (no CONTACT type yet)
    const totalLeads = await prisma.engagement.count({
      where: {
        type: "FAVORITE",
        car: { dealerId }
      }
    })

    // Alias for clarity in stat cards
    const totalFavorites = totalLeads

    // Total sold cars
    const totalSales = await prisma.car.count({
      where: { dealerId, status: "SOLD" }
    })

    // Total active listings
    const totalListings = await prisma.car.count({
      where: { dealerId, status: "AVAILABLE" }
    })

    // Total inventory (all statuses)
    const totalInventory = await prisma.car.count({
      where: { dealerId }
    })

    // Top 5 cars by total engagement count
    const topCars = await prisma.car.findMany({
      where: { dealerId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        slug: true,
        status: true,
        _count: { select: { engagements: true } }
      },
      orderBy: { engagements: { _count: "desc" } },
      take: 5
    })

    // Last 7 days trend — view engagements per day
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentEngagements = await prisma.engagement.findMany({
      where: {
        type: "VIEW",
        car: { dealerId },
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true }
    })

    const trendData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split("T")[0]
      const count = recentEngagements.filter(
        (e) => e.createdAt.toISOString().split("T")[0] === dateStr
      ).length
      return { date: dateStr, views: count }
    })

    // Top performing cars formatted for chart (legacy shape kept for BarChart)
    const topPerformingCars = topCars.map((car) => ({
      car: { id: car.id, make: car.make, model: car.model, year: car.year, images: [] as string[] },
      views: car._count.engagements
    }))

    return NextResponse.json({
      analytics: {
        totalViews,
        totalFavorites,
        totalLeads,
        totalSales,
        totalInventory,
        availableCars: totalListings
      },
      topPerformingCars,
      trendData,
    })
  } catch (error: unknown) {
    console.error("[DEALER_ANALYTICS_GET]", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
