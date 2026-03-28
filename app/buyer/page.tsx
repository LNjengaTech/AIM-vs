import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Heart, Search, Clock, MessageSquarePlus } from "lucide-react"

export default async function BuyerPage() {
  const session = await auth()
  // Auth checks handled in layout, but double checking for simple page logic if needed?
  // Layout wraps this so session exists.
  // Although page can be rendered independently in nextjs structure? No, layout wraps page.
  // But strictly speaking, page receives params/searchParams.
  // We can just rely on layout for major auth guard, or re-check if we need user data here specifically not passed down.
  // Layout doesn't pass user data to children directly easily in server components (context provider needed).
  // So we re-fetch user if we need specific user details for welcome message.

  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  return (
    <div className="space-y-8">
        {/* Welcome Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Buyer'}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Monitor your favorites, BOLO requests, and recent activity from your dashboard.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/cars"
            className="group flex flex-col items-start justify-between rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
          >
            <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Search className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">Browse Cars</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                Find your dream car from our verified inventory
                </p>
            </div>
          </Link>

          <Link
            href="/buyer/favorites"
            className="group flex flex-col items-start justify-between rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
          >
            <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Heart className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">My Favorites</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                View functionality for saved cars
                </p>
            </div>
          </Link>

          <Link
            href="/buyer/bolo"
            className="group flex flex-col items-start justify-between rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
          >
            <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Search className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">BOLO Requests</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                "Be On Look Out" - let us find a car for you
                </p>
            </div>
          </Link>

          <Link
            href="/buyer/activity"
            className="group flex flex-col items-start justify-between rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
          >
             <div className="mb-4 rounded-full bg-orange-100 p-3 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Clock className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                Track your history and interactions
                </p>
            </div>
          </Link>

          <Link
            href="/buyer/reviews/new"
            className="group flex flex-col items-start justify-between rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
          >
             <div className="mb-4 rounded-full bg-purple-100 p-3 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <MessageSquarePlus className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">Give Feedback</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                Share your experience with us
                </p>
            </div>
          </Link>
        </div>

        {/* Can add a preview of recent items here later */}
    </div>
  )
}
