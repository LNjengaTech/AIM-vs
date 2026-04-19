/**
 * components/dashboard/analytics-dashboard.tsx
 * Dealer analytics dashboard component providing insights into listing performance and buyer engagement.
 * Data is fetched live from the Engagement and Car tables via /api/dealer/analytics.
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Eye, Heart, ShoppingCart, TrendingUp } from "lucide-react"
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

interface CarPerformance {
  car: {
    id: string
    make: string
    model: string
    year: number
    images: string[]
  }
  views: number
}

interface EngagementBreakdown {
  totalViews: number
  totalFavorites: number
  totalLeads: number
  totalInventory: number
  totalSales: number
  availableCars: number
}

interface TrendPoint {
  date: string
  views: number
}

interface DealerAnalyticsData {
  analytics: EngagementBreakdown
  topPerformingCars: CarPerformance[]
  trendData: TrendPoint[]
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<DealerAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dealer/analytics")
      .then((res) => res.json())
      .then((json: DealerAnalyticsData) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-muted" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Failed to load analytics</div>
      </div>
    )
  }

  const { analytics, topPerformingCars, trendData } = data

  // Prepare chart data for top performing cars bar chart
  const performanceData = topPerformingCars.map((item) => ({
    name: `${item.car.make} ${item.car.model}`,
    views: item.views
  }))

  // Short date labels for trend chart (e.g. "Mon")
  const trendChartData = trendData.map((point) => ({
    day: new Date(point.date).toLocaleDateString("en-GB", { weekday: "short" }),
    views: point.views
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your dealership&apos;s performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all listings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalFavorites.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cars favourited by buyers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Favourites (lead proxy)</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cars marked sold</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Inventory</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.availableCars.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available cars</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInventory.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All listings</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Views Trend */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>7-Day View Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Daily listing views over the last week</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Cars */}
      {performanceData.length > 0 && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Top Performing Cars</CardTitle>
            <p className="text-sm text-muted-foreground">Cars with the most total engagements</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
