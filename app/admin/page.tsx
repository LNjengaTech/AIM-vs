import { prisma } from "@/lib/prisma"
import { 
  Users, 
  Store, 
  Car, 
  UserPlus, 
  CheckCircle, 
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function AdminDashboardPage() {
  // Fetch stats concurrently
  const [
    totalBuyers,
    totalDealers,
    pendingVerifications,
    totalCars,
    totalReviews,
    newDealersThisWeek
  ] = await Promise.all([
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.dealerProfile.count(),
    prisma.dealerProfile.count({ where: { isVerified: false } }),
    prisma.car.count(),
    prisma.review.count(),
    prisma.dealerProfile.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const stats = [
    {
      title: "Total Buyers",
      value: totalBuyers,
      icon: Users,
      description: "Registered users looking for cars",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Total Dealers",
      value: totalDealers,
      icon: Store,
      description: "Partners registered on platform",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Pending Verifications",
      value: pendingVerifications,
      icon: UserPlus,
      description: "Dealers waiting for approval",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      href: "/admin/verifications"
    },
    {
      title: "Total Inventory",
      value: totalCars,
      icon: Car,
      description: "Active listings across all dealers",
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide overview and management</p>
      </div>

      <div className="grid gap-4 grid-cols-2 4xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-0 ">
            <CardHeader className=" flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={` ${stat.bg} ${stat.color} rounded-3xl p-1`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {stat.href && (
                <Link 
                  href={stat.href} 
                  className="mt-2 flex items-center text-xs font-medium text-primary hover:underline"
                >
                  Action required <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 4xl:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {/* Quick stats grid for secondary metrics */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-4xl p-2 bg-background shadow-xl">
                     <div className="rounded-full bg-yellow-500/10 p-2 text-yellow-500">
                        <MessageSquare className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-sm font-medium">New Reviews</p>
                        <p className="text-2xl font-bold">{totalReviews}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-4xl p-2 bg-background shadow-xl">
                     <div className="rounded-full bg-pink-500/10 p-2 text-pink-500">
                        <TrendingUp className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-sm font-medium">Weekly Growth</p>
                        <p className="text-2xl font-bold">+{newDealersThisWeek} Dealers</p>
                     </div>
                  </div>
               </div>
               
               <div className="rounded-4xl border p-6 text-center bg-background shadow-xl">
                  <p className="text-sm text-muted-foreground">
                    Detailed graphs and traffic analysis available on the 
                    <Link href="/admin/analytics" className="mx-1 text-primary hover:underline">Analytics Page</Link>.
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/admin/verifications">
              <div className="flex items-center justify-between rounded-4xl border px-4 py-3 hover:bg-accent transition-colors">
                <span className="text-sm font-medium">Verify Dealers</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/hero">
              <div className="flex items-center justify-between rounded-4xl border px-4 py-3 hover:bg-accent transition-colors">
                <span className="text-sm font-medium">Manage Hero Section</span>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/reviews">
              <div className="flex items-center justify-between rounded-4xl border px-4 py-3 hover:bg-accent transition-colors">
                <span className="text-sm font-medium">Moderate Reviews</span>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
