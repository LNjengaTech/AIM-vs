import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { signOutAction } from "@/app/actions/auth"
import { MobileNav } from "@/components/buyer/mobile-nav"
import { BuyerNotifications } from "@/components/buyer/buyer-notifications"

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "BUYER") {
    redirect("/")
  }

  // Fetch buyer profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      buyerProfile: true,
    },
  })

  // Ensure buyer profile exists or execute onboarding if needed?
  // Current logic in page.tsx redirects to "/" if no profile.
  if (!user?.buyerProfile) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">

          <MobileNav/>

            <Link href="/" className="text-xl font-bold text-foreground">
              AIM-Mombasa
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span>/</span>
              <Link href="/buyer" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/buyer/favorites" className="hover:text-foreground transition-colors">Favorites</Link>
              <Link href="/buyer/bolo" className="hover:text-foreground transition-colors">BOLO Requests</Link>
              <Link href="/buyer/activity" className="hover:text-foreground transition-colors">Activity</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BuyerNotifications />
            <span className="text-sm text-foreground hidden sm:inline-block">{user.name}</span>
            <form action={signOutAction}>
              <button className="rounded-4xl border border-border px-4 py-2 text-sm transition-colors hover:bg-accent/50 hover:text-red-600">
                Sign Out
              </button>
            </form>
          </div>
        </div>
        {/* Mobile Nav - optional, keeping simple for now */}
      </header>
      
      <main className="container mx-auto px-2 md:px-4 py-8">
        {children}
      </main>
    </div>
  )
}
