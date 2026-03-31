import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/ui/navbar"
import { HeroSection } from "@/components/home/hero-section"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  // Fetch active hero section from database
  const heroData = await prisma.heroSection.findFirst({
    where: { isActive: true }
  })

  // Default values if no hero section exists in DB
  const hero = {
    headline: heroData?.headline ?? "LIMITLESS",
    subheadline: heroData?.subheadline ?? "No more wasted trips. Browse live inventory, set alerts, and connect with trusted dealers.",
    tagline: heroData?.tagline ?? "PERFORMANCE",
    backgroundImageUrl: heroData?.backgroundImageUrl,
    foregroundImageUrl: heroData?.foregroundImageUrl,
    selectedColor: heroData?.selectedColor,
    hasFeaturedCar: heroData?.hasFeaturedCar,
    featuredCarId: heroData?.featuredCarId,
    specs: (heroData?.specs as { label: string; value: string }[]) || null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={session?.user} />

      <main className="flex-1">
        {/* Dynamic Hero Section */}
        <HeroSection
          headline={hero.headline}
          subheadline={hero.subheadline}
          tagline={hero.tagline}
          backgroundImageUrl={hero.backgroundImageUrl}
          foregroundImageUrl={hero.foregroundImageUrl}
          selectedColor={hero.selectedColor}
          hasFeaturedCar={hero.hasFeaturedCar}
          featuredCarId={hero.featuredCarId}
          specs={hero.specs}
        />

        {/* Status Badge & Features (Keeping from original design but refined) */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center space-y-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-medium text-primary animate-pulse">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Phase 3 Prerequisite: Dynamic Content System Live ✓
            </div>

            {/* Feature Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 w-full">
              {[
                {
                  title: "Real-Time Inventory",
                  description: "Live stock updates from verified dealers across Mombasa",
                  icon: (
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                },
                {
                  title: "BOLO Alerts",
                  description: "Get notified the moment your dream car hits the market",
                  icon: (
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  )
                },
                {
                  title: "360° Tours",
                  description: "Experience every angle with virtual walkarounds on select listings",
                  icon: (
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )
                },
                {
                  title: "AI Verified",
                  description: "Smart validation algorithms ensuring listing accuracy and trust",
                  icon: (
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
              ].map((feature, idx) => (
                <div key={idx} className="group rounded-2xl border bg-card p-8 text-left transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 font-bold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Tech Stack / Credit */}
            <div className="pt-12 text-sm text-muted-foreground border-t w-full">
              <p className="font-medium">Built with cutting-edge technology</p>
              <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-70">
                 <span>Next.js 15</span>
                 <span>TypeScript</span>
                 <span>Prisma ORM</span>
                 <span>PostgreSQL</span>
                 <span>NextAuth.js</span>
                 <span>Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="font-semibold text-foreground">AIM-Mombasa</p>
          <p className="text-sm text-muted-foreground">© 2026 | Technical University of Mombasa (TUM) Research Project</p>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground pt-4">
             <Link href="/about" className="hover:text-primary transition-colors">About Project</Link>
             <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
             <Link href="/contact" className="hover:text-primary transition-colors">Contact Research Team</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
