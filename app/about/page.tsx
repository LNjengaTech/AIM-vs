// app/about/page.tsx
// About AIM-Mombasa — project story, problem, tech stack, and the team.
// Public page. No auth required.

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/home/footer"
import Link from "next/link"

export const metadata = {
  title: "About AIM-Mombasa | Verified Car Marketplace",
  description: "Learn about AIM-Mombasa — a research project by Lonnex Njenga at the Technical University of Mombasa, digitising the used car market in Mombasa, Kenya.",
}

export default async function AboutPage() {
  const session = await auth()

  const [dealerCount, carCount] = await Promise.all([
    prisma.dealerProfile.count({ where: { isVerified: true } }),
    prisma.car.count({ where: { status: "AVAILABLE", isVerified: true } }),
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={session?.user} />

      <main className="flex-1">
        {/* Hero Block */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Our Story
            </p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Built for Mombasa. Designed for Trust.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              AIM-Mombasa started with a simple frustration — driving across Mombasa to
              view a car that was already sold, or listed at a different price than
              advertised. We built the platform we wished existed.
            </p>
          </div>
        </div>

        {/* The Problem Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">The Problem We Solve</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Mombasa's used car market has long been fragmented — dealers in Ganjoni,
                  Nyali, and Shimanzi relying on WhatsApp statuses and outdated listings
                  on platforms that don't reflect actual stock.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Buyers waste hours — sometimes days — visiting showrooms only to find
                  the car is sold, overpriced, or misrepresented. Dealers lose high-intent
                  buyers who give up and buy elsewhere.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <PainCard icon="🚗" title="Ghost Listings" description="Cars listed as available that were sold weeks ago" />
                <PainCard icon="📍" title="Wasted Trips" description="Driving across Mombasa only to find mismatches" />
                <PainCard icon="💸" title="Price Opacity" description="No way to know if a price is fair without research" />
                <PainCard icon="🔍" title="No Matching" description="No system to notify buyers when their ideal car arrives" />
              </div>
            </div>
          </div>
        </section>

        {/* Our Solution Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-4">What We Built</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              AIM-Mombasa is a live digital twin of Mombasa's car showrooms. Inventory
              is updated in real time by verified dealers. Buyers browse, set BOLO alerts,
              and connect — without a single wasted trip.
            </p>
            {/* Live stats as proof */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-3xl border bg-card p-6">
                <p className="text-3xl font-bold text-primary">{carCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Available Cars</p>
              </div>
              <div className="rounded-3xl border bg-card p-6">
                <p className="text-3xl font-bold text-primary">{dealerCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Verified Dealers</p>
              </div>
              <div className="rounded-3xl border bg-card p-6">
                <p className="text-3xl font-bold text-primary">1</p>
                <p className="text-sm text-muted-foreground mt-1">City (Mombasa)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-8">Technology Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Next.js 16", role: "Full-stack framework", color: "bg-black text-white" },
                { name: "TypeScript", role: "Type safety", color: "bg-blue-600 text-white" },
                { name: "PostgreSQL", role: "Database", color: "bg-blue-800 text-white" },
                { name: "Prisma ORM", role: "Data layer", color: "bg-indigo-600 text-white" },
                { name: "NextAuth v5", role: "Authentication", color: "bg-purple-600 text-white" },
                { name: "Cloudinary", role: "Image storage", color: "bg-cyan-600 text-white" },
                { name: "Socket.io", role: "Real-time messaging", color: "bg-gray-700 text-white" },
                { name: "Gemini Flash", role: "AI features", color: "bg-green-600 text-white" },
              ].map(tech => (
                <div key={tech.name} className="rounded-3xl border bg-card p-4 text-center">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold mb-2 ${tech.color}`}>
                    {tech.name}
                  </div>
                  <p className="text-xs text-muted-foreground">{tech.role}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              100% free-tier infrastructure. No paid APIs.
            </p>
          </div>
        </section>

        {/* The Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-8">The Team</h2>
            <div className="rounded-3xl border bg-card p-8">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary">
                L
              </div>
              <h3 className="text-xl font-bold">Lonnex Njenga</h3>
              <p className="text-primary font-medium mt-1">Founder & Developer</p>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                Fourth-year IT student at the Technical University of Mombasa.
                AIM-Mombasa is a research project demonstrating applied full-stack
                development, AI integration, and real-world problem-solving in the
                context of Mombasa's automotive market.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs text-muted-foreground">
                🎓 Technical University of Mombasa (TUM)
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 border-t">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">
              Ready to experience a better car market?
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/cars" className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                Browse Cars
              </Link>
              <Link href="/contact" className="rounded-full border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function PainCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-3xl border bg-card p-4 hover:shadow-md transition-shadow">
      <span className="text-2xl">{icon}</span>
      <h4 className="font-semibold text-sm mt-2 mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
