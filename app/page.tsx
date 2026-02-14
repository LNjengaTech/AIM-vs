// app/page.tsx
// Home page - Landing page for AIM-Mombasa

import { auth } from "@/lib/auth"
import Link from "next/link"
import { Header } from "@/components/Header"

export default async function Home() {
  const session = await auth()


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl space-y-8">
          {/* Logo/Branding */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              <span className="text-primary">
                AIM-Mombasa
              </span>
            </h1>
            <p className="text-xl text-muted-foreground sm:text-2xl">
              AI-Enhanced Automotive Inventory Management
            </p>
          </div>

          {/* Main Tagline */}
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Find Your Perfect Car - Verified, Available, and Matched Just for You!
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              No more wasted trips. Browse live inventory, set alerts, and connect with trusted dealers in Mombasa.
            </p>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-medium text-primary">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Phase 2, Stage 2: Marketplace Complete ✓
          </div>

          {/* CTA Buttons */}
          {/* Main CTA */}
          <div className="flex justify-center py-4">
             <Link
                href="/cars"
                className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
              >
                Browse Inventory
              </Link>
          </div>

          {!session?.user && (
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/auth/signup/dealer"
                className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Join as Dealer
              </Link>
              <Link
                href="/auth/signup/buyer"
                className="rounded-lg border-2 border-primary px-8 py-3 font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Sign up as Buyer
              </Link>
            </div>
          )}

          {/* Feature Grid */}
          <div className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 text-left transition-shadow hover:shadow-lg">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Real-Time Inventory</h3>
              <p className="text-sm text-muted-foreground">
                Live stock updates from verified dealers
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 text-left transition-shadow hover:shadow-lg">
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
              <h3 className="mb-2 font-semibold text-foreground">BOLO Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when your dream car arrives
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 text-left transition-shadow hover:shadow-lg">
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">360° Tours</h3>
              <p className="text-sm text-muted-foreground">
                Virtual walkarounds from your phone
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 text-left transition-shadow hover:shadow-lg">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">AI Verified</h3>
              <p className="text-sm text-muted-foreground">
                Smart verification for accuracy
              </p>
            </div>
          </div>

          {/* Tech Stack Info */}
          <div className="pt-8 text-sm text-muted-foreground">
            <p className="font-medium">Built with</p>
            <p className="mt-2">
              Next.js • TypeScript • Tailwind CSS • Prisma • PostgreSQL • NextAuth • Cloudinary
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 AIM-Mombasa | Technical University of Mombasa (TUM)</p>
      </footer>
    </div>
  )
}
