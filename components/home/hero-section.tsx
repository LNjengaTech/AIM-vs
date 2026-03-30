import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  headline: string
  subheadline: string
  backgroundImageUrl?: string | null
  selectedColor?: string | null
  hasFeaturedCar?: boolean
  featuredCarId?: string | null
  className?: string
}

export function HeroSection({
  headline,
  subheadline,
  backgroundImageUrl,
  selectedColor,
  hasFeaturedCar,
  featuredCarId,
  className
}: HeroSectionProps) {
  return (
    <section className={cn("relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden", className)}>
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {backgroundImageUrl && backgroundImageUrl.startsWith('http') ? (
          <Image
            src={backgroundImageUrl}
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-primary/20 via-background to-background"
            style={{ backgroundColor: selectedColor || undefined }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] backdrop-saturate-150" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                {headline}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              {subheadline}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link
              href="/cars"
              className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
            >
              Browse Inventory
            </Link>
            <Link
              href="/auth/signup/dealer"
              className="rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-sm px-8 py-3 text-lg font-semibold text-foreground transition-all hover:bg-primary/10 hover:border-primary/50"
            >
              Sell Your Car
            </Link>
          </div>

          {/* Featured Car Indicator (Optional) */}
          {hasFeaturedCar && featuredCarId && (
            <div className="pt-12 animate-in fade-in duration-1000 delay-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Featured Model Available Now
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
