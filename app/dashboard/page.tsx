//app/dashboard/page.tsx
//Dealer dashboard - Protected route (dealers only)
//Server-side authentication: Uses auth() for session check

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "DEALER") {
    redirect("/")
  }

  //fetch dealer profile
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
    <div className="min-h-screen bg-background">
      {/*header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-foreground">
              AIM-Mombasa
            </Link>
            <span className="text-sm text-muted-foreground">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground">{user.name}</span>
            <form action={async () => {
              "use server"
              const { signOut } = await import("@/lib/auth")
              await signOut()
            }}>
              <button className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/*welcome Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-muted-foreground">
                {dealerProfile.businessName}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {dealerProfile.isPioneer && (
                <Badge variant="success">
                  ⭐ Pioneer Dealer
                </Badge>
              )}
              {dealerProfile.isVerified ? (
                <Badge variant="success">
                  ✓ Verified
                </Badge>
              ) : (
                <Badge variant="warning">
                  ⏳ Pending Verification
                </Badge>
              )}
            </div>
          </div>

          {!dealerProfile.isVerified && (
            <div className="mt-6 rounded-lg bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-400">
              <p className="font-medium">Account Pending Verification</p>
              <p className="mt-1">
                Your account is currently under review. An admin will verify your business permit and approve your account soon.
              </p>
            </div>
          )}
        </div>

        {/*stats - Views, leads, sales (placeholder)*/}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {dealerProfile.analytics?.totalViews || 0}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {dealerProfile.analytics?.totalLeads || 0}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {dealerProfile.analytics?.totalSales || 0}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Cars Listed</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">0</p>
            <p className="mt-1 text-xs text-muted-foreground">Coming in Phase 2</p>
          </div>
        </div>

        {/*quick actions - Placeholders for Phase 2 features*/}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              disabled
              className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h3 className="font-medium text-foreground">Add New Car</h3>
              <p className="mt-1 text-sm text-muted-foreground">Coming in Phase 2</p>
            </button>

            <button
              disabled
              className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h3 className="font-medium text-foreground">Manage Inventory</h3>
              <p className="mt-1 text-sm text-muted-foreground">Coming in Phase 2</p>
            </button>

            <button
              disabled
              className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h3 className="font-medium text-foreground">View Analytics</h3>
              <p className="mt-1 text-sm text-muted-foreground">Coming in Phase 2</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
