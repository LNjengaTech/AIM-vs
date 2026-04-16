/**
 * app/api/admin/analytics/route.ts
 * API route for platform-wide analytics aggregation.
 * Provides summary counts, inventory distribution, and recent activity.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Aggregate statistics
    const [
      totalUsers,
      totalBuyers,
      totalDealers,
      verifiedDealers,
      totalCarsByStatus,
      totalReviews,
      recentActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.user.count({ where: { role: "DEALER" } }),
      prisma.dealerProfile.count({ where: { isVerified: true } }),
      prisma.car.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.review.count(),
      prisma.engagement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          car: { select: { make: true, model: true } },
          buyer: { include: { user: { select: { name: true } } } }
        }
      })
    ])

    // Generate time-series data for the last 7 days from real Engagement data
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const engagements = await prisma.engagement.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, type: true },
    })

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const trafficData = last7Days.map(date => {
      const dayEngagements = engagements.filter(e =>
        e.createdAt.toISOString().split('T')[0] === date
      )
      return {
        date,
        views: dayEngagements.filter(e => e.type === 'VIEW').length,
        engagement: dayEngagements.filter(e => e.type !== 'VIEW').length,
      }
    })

    return NextResponse.json({
      counts: {
        totalUsers,
        totalBuyers,
        totalDealers,
        verifiedDealers,
        totalReviews,
      },
      inventory: totalCarsByStatus,
      trafficData,
      recentActivity
    })
  } catch (error: unknown) {
    console.error("[ADMIN_ANALYTICS_GET]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Error", { status: 500 })
  }
}
