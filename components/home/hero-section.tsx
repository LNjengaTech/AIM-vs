import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface HeroSectionProps {
  headline?: string | null
  subheadline?: string | null
  tagline?: string | null
  backgroundImageUrl?: string | null
  foregroundImageUrl?: string | null
  selectedColor?: string | null
  hasFeaturedCar?: boolean
  featuredCarId?: string | null
  specs?: { label: string; value: string }[] | null
  foregroundImageX?: number | null
  foregroundImageY?: number | null
  foregroundImageScale?: number | null
  className?: string
}

export function HeroSection({
  headline,
  subheadline,
  tagline,
  backgroundImageUrl,
  foregroundImageUrl,
  selectedColor,
  hasFeaturedCar,
  featuredCarId,
  specs,
  foregroundImageX = 0,
  foregroundImageY = 0,
  foregroundImageScale = 1,
  className
}: HeroSectionProps) {
  return (
    <section className={cn("relative min-h-[90vh] md:min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background", className)}>

      {/* Layer Z-0: Environment / Background */}
      <div className="absolute inset-0 z-0">
        {backgroundImageUrl && backgroundImageUrl.startsWith('http') ? (
          <Image
            src={backgroundImageUrl}
            alt="Hero Environment"
            fill
            priority
            className="object-cover opacity-90 transition-opacity duration-1000"
            sizes="100vw"
            quality={90}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-background via-muted/20 to-background">
             <Image
              src="/images/AI_showroom1.png"
              alt="Hero Environment"
              fill
              priority
              className="object-cover opacity-80"
            />
          </div>
        )}

        {/* Dynamic backdrop color overlay */}
        {selectedColor && (
          <div 
            className="absolute inset-0 mix-blend-multiply opacity-20" 
            style={{ backgroundColor: selectedColor }}
          />
        )}

        {/* Smooth gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-background via-background/40 to-transparent z-10" />
      </div>

      {/* Layer Z-10: Sandwiched tagline (Behind the car) */}
      <div className="relative z-10 w-full flex items-center justify-center pointer-events-none select-none">
        {tagline && (
          <span 
            className="text-[clamp(4rem,20vw,24rem)] font-black tracking-tighter text-foreground/5 uppercase leading-none text-center px-4"
            style={{ 
              WebkitTextStroke: '1px rgba(255,255,255,0.05)',
              textShadow: '0 0 40px rgba(0,0,0,0.1)' 
            }}
          >
            {tagline}
          </span>
        )}
      </div>

      {/* Layer Z-30: Content (Headlines) */}
      <div className="z-30 absolute inset-0 flex flex-col items-center justify-center pt-20 pointer-events-none">
        {headline && (
          <h1 className="text-[clamp(1.25rem,4vw,3.5rem)] font-bold tracking-[0.3em] uppercase text-foreground/90 text-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {headline}
          </h1>
        )}
        {subheadline && (
          <p className="text-[clamp(0.875rem,2vw,1.25rem)] text-muted-foreground max-w-[min(90vw,600px)] text-center mx-auto mt-6 px-4 font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
            {subheadline}
          </p>
        )}
      </div>

      {/* Layer Z-20: Foreground cutout image */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        {foregroundImageUrl && foregroundImageUrl.startsWith('http') && (
          <div 
            className="relative w-full max-w-350 aspect-21/9 animate-in fade-in zoom-in-95 duration-1000 delay-300"
            style={{
              transform: `translate(${foregroundImageX}%, ${foregroundImageY}%) scale(${foregroundImageScale})`,
              filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))'
            }}
          >
            <Image
              src={foregroundImageUrl}
              alt="Featured Car Focus"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1400px) 100vw, 1400px"
            />
          </div>
        )}
      </div>

      {/* Layer Z-40: Interactivity and Specs (Always on top) */}
      <div className="relative z-40 mt-auto pb-12 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        
        {/* Featured Car Indicator - Debugged and refined */}
        {hasFeaturedCar && featuredCarId && (
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <Link 
              href={`/cars/${featuredCarId}`}
              className="group inline-flex items-center gap-3 rounded-full border border-primary/30 bg-background/50 backdrop-blur-xl px-6 py-2.5 text-[clamp(10px,1.2vw,14px)] tracking-widest uppercase font-bold text-primary shadow-2xl hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary group-hover:bg-primary-foreground transition-colors"></span>
              </span>
              Featured Model Available
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {specs && specs.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-12 mb-12 px-6">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex items-center">
                {idx !== 0 && (
                  <div className="hidden md:block h-10 w-px bg-foreground/10 mr-4 md:mr-12" />
                )}

                <div className="flex flex-col items-center backdrop-blur-xl bg-card/30 border border-white/5 shadow-2xl rounded-2xl p-4 md:px-8 md:py-5 group hover:bg-card/50 transition-all duration-300">
                  <span className="text-[clamp(1.1rem,2.5vw,2.2rem)] font-bold text-foreground uppercase tracking-tight group-hover:scale-110 transition-transform">{spec.value}</span>
                  <span className="text-[clamp(8px,1vw,11px)] tracking-[0.2em] uppercase text-muted-foreground mt-1.5 font-semibold">{spec.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 px-6">
          <Link
            href="/cars"
            className="group relative overflow-hidden rounded-full bg-primary px-12 py-5 text-[clamp(12px,1.5vw,14px)] tracking-widest uppercase font-black text-primary-foreground shadow-[0_20px_40px_-15px_rgba(var(--primary),0.5)] transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Inventory
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          <Link
            href="/auth/signup/dealer"
            className="rounded-full border border-foreground/10 bg-background/10 backdrop-blur-xl px-12 py-5 text-[clamp(12px,1.5vw,14px)] tracking-widest uppercase font-black text-foreground transition-all hover:bg-foreground hover:text-background active:scale-95"
          >
            Sell With Us
          </Link>
        </div>
      </div>
    </section>
  )
}
