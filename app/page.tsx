// app/page.tsx
// AIM-Mombasa landing page. Composes all homepage sections.
// Server component — fetches live stats and featured cars at build time (ISR: 60s).

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/ui/navbar"
import { HeroSection } from "@/components/home/hero-section"
import { LiveStatsBar } from "@/components/home/live-stats-bar"
import { FeaturedCarsSection } from "@/components/home/featured-cars-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { KeyFeaturesSection } from "@/components/home/key-features-section"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { DealerCTASection } from "@/components/home/dealer-cta-section"
import { Footer } from "@/components/home/footer"
import ChatWidget from "@/components/aim-assistant/chat-widget-wrapper"
import { Suspense } from "react"

// ISR: revalidate every 60 seconds so stats and cars stay fresh
export const revalidate = 60

export default async function HomePage() {
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={session?.user} />
      
      <main className="flex-1">
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
        
        <Suspense fallback={<div className="h-24 bg-muted animate-pulse" />}>
          <LiveStatsBar />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-muted/20 animate-pulse" />}>
          <FeaturedCarsSection />
        </Suspense>

        <HowItWorksSection />
        
        <KeyFeaturesSection />
        
        <Suspense fallback={null}>
          <ReviewsSection />
        </Suspense>

        <DealerCTASection />
      </main>

      <Footer />
      
      <ChatWidget page="home" userRole={session?.user?.role ?? "guest"} />
    </div>
  )
}
