

// app/dashboard/page.tsx
// Dealer dashboard - Protected route (dealers only)

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "DEALER") {
    redirect("/")
  }

  // Fetch dealer profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      dealerProfile: {
        include: {
          analytics: true,
        },
      },
    },
  })

  if (!user?.dealerProfile) {
    redirect("/")
  }

  const { dealerProfile } = user

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-row gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user.name}
          </h1>
        </div>

        {/*Twitter-Style*/}
        <div className="flex flex-col gap-1">
          {dealerProfile.isPioneer && (
            <div className="border inline-flex items-center gap-1 rounded-full px-4 py-1 text-xs font-medium transition-colors">
              Pioneer dealer
              <VerifiedBadge variant="pioneer" size={20} />
            </div>

          )}
          {dealerProfile.isVerified && (
            <div className="border inline-flex items-center gap-1 rounded-full px-4 py-1 text-xs font-medium transition-colors">
            Verified dealer
            <VerifiedBadge variant="verified" size={20} />
          </div>
          )}

          {!dealerProfile.isVerified && (
            <Badge variant="warning">⏳ Pending Verification</Badge>
          )}
        </div>

      </div>


      {!dealerProfile.isVerified && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/10 dark:text-yellow-400">
          <h3 className="font-semibold">Account Pending Verification</h3>
          <p className="mt-1">
            Your account is currently under review. Listings you create will not be public until verified.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
          </div>
          <div className="text-2xl font-bold">{dealerProfile.analytics?.totalViews || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
          </div>
          <div className="text-2xl font-bold">{dealerProfile.analytics?.totalLeads || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
          </div>
          <div className="text-2xl font-bold">{dealerProfile.analytics?.totalSales || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Inventory</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">+0 from last month</p>
        </div>
      </div>

      {/* Recent Activity / Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <div className="mt-4 flex h-50 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            No recent activity
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Link href="/dashboard/add-car" className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
              <span className="text-sm font-medium">Add New Car</span>
              <span className="text-muted-foreground">→</span>
            </Link>
            <Link href="/dashboard/inventory" className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
              <span className="text-sm font-medium">Manage Inventory</span>
              <span className="text-muted-foreground">→</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
