/**
 * app/admin/analytics/page.tsx
 * Admin analytics dashboard providing platform-wide insights and trends.
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell} from "recharts"
import { Users, Store, Car, Activity, Loader2, TrendingUp } from "lucide-react"

interface PlatformStats {
  totalUsers: number
  totalDealers: number
  verifiedDealers: number
  totalReviews: number
}

interface InventoryItem {
  status: string
  _count: {
    _all: number
  }
}

interface TrafficDataPoint {
  date: string
  views: number
  engagement: number
}

interface RecentActivity {
  id: string
  type: string
  createdAt: string
  buyer: {
    user: {
      name: string
    }
  }
  car: {
    make: string
    model: string
  }
}

interface AnalyticsData {
  counts: PlatformStats
  inventory: InventoryItem[]
  trafficData: TrafficDataPoint[]
  recentActivity: RecentActivity[]
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (!response.ok) throw new Error("Failed to fetch")
      const result = await response.json()
      setData(result)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error fetching analytics"
      console.error("[ANALYTICS_FETCH_ERROR]", message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const inventoryData = data?.inventory.map((item) => ({
    name: item.status,
    value: item._count._all
  })) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into platform growth and engagement</p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: data?.counts.totalUsers, icon: Users, color: "text-blue-500" },
          { label: "Total Dealers", value: data?.counts.totalDealers, icon: Store, color: "text-purple-500" },
          { label: "Verified Dealers", value: data?.counts.verifiedDealers, icon: TrendingUp, color: "text-green-500" },
          { label: "User Reviews", value: data?.counts.totalReviews, icon: Activity, color: "text-orange-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Chart */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
            <CardDescription>Views vs Interactivity over last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => value.split('-').slice(2).join('/')}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Distribution */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <CardDescription>Breakdown of cars by listing status</CardDescription>
          </CardHeader>
          <CardContent className="h-75 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Marketplace Activity</CardTitle>
          <CardDescription>The latest interactions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.buyer.user.name} 
                      <span className="text-muted-foreground font-normal ml-1">
                        {activity.type.toLowerCase().replace('_', ' ')}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.car.make} {activity.car.model}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                   {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
