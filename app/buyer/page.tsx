//app/buyer/page.tsx
//Buyer profile page - Protected route - buyers only

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function BuyerPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "BUYER") {
    redirect("/")
  }

  //fetch buyer profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      buyerProfile: true,
    },
  })

  if (!user?.buyerProfile) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/*header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-foreground">
              AIM-Mombasa
            </Link>
            <span className="text-sm text-muted-foreground">/ Profile</span>
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
        {/* Welcome Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {user.name}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore verified cars and find your perfect match
          </p>
        </div>

        {/* Quick Actions - placeholder*/}
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/cars"
            className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Browse Cars</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore verified inventory (Coming in Phase 2)
            </p>
          </Link>

          <button
            disabled
            className="rounded-lg border bg-card p-6 shadow-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">My Favorites</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              View saved cars (Coming in Phase 2)
            </p>
          </button>

          <button
            disabled
            className="rounded-lg border bg-card p-6 shadow-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">BOLO Requests</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage alerts (Coming in Phase 3)
            </p>
          </button>

          <button
            disabled
            className="rounded-lg border bg-card p-6 shadow-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              View your history (Coming in Phase 2)
            </p>
          </button>
        </div>
      </main>
    </div>
  )
}
