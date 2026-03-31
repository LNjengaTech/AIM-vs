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
            className="object-cover opacity-80"
          />
        ) : (
          <div className="max-w-[1200px] mx-auto">
            <Image
              src="/images/showroom_bg4.avif"
              alt="Hero Environment"
              fill
              priority
              className="object-cover opacity-80"
            />
          </div>
          // <div
          //   className="absolute inset-0 bg-gradient-to-b from-primary/30 to-background"
          //   style={{ backgroundColor: selectedColor || undefined }}
          // />
        )}
        {/* Subtle overlay to ensure text readability if needed */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/60 to-transparent z-0" />
      </div>

      {/* Layer Z-10: Huge Typography (Sandwiched) */}
      <div className="relative inset-10 z-10 flex flex-col items-center justify-center pt-28 pointer-events-none select-none">

        {/* The massive tagline (behind the car) */}
        {tagline && (
          <span className="text-[10vw] leading-[0.8] font-black tracking-tighter text-foreground/90 uppercase my-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-1000">
            {tagline}
          </span>
        )}

      </div>

      <div className="z-30 absolute inset-10 flex flex-col items-center justify-center pt-28 pointer-events-none select-none">
        {/* The small headline */}
        {headline && (
          <h1 className="text-xl md:text-3xl lg:text-5xl font-bold tracking-[0.2em] uppercase text-foreground/90 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {headline}
          </h1>
        )}



        {subheadline && (
          <p className="text-sm md:text-xl lg:text-2xl text-muted-foreground max-w-xl text-center mx-auto mt-4 px-4 font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {subheadline}
          </p>
        )}
      </div>



      {/* Layer Z-20: Foreground Cutout Image */}
      <div className="absolute inset-0 z-20 flex items-end justify-center pb-[15vh] md:pb-[20vh] pointer-events-none">
        {foregroundImageUrl && foregroundImageUrl.startsWith('http') ? (
          <div className="relative w-full max-w-[1200px] aspect-[2/1] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Image
              src={foregroundImageUrl}
              alt="Featured Car Focus"
              fill
              priority
              className="object-contain object-bottom scale-110 drop-shadow-2xl"
            />
          </div>
        ) : (
          <div className="relative w-full max-w-[1200px] aspect-[2/1] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Image
              src="/images/audi_q8_vorsprung_118-Photoroom.png"
              alt="Hero Environment"
              fill
              priority
              className="object-cover opacity-80"
            />
          </div>
        )}
      </div>

      {/* Layer Z-30: Interactivity and Specs */}
      <div className="relative z-30 mt-auto pb-10 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">

        {/* Specs Ribbon */}
        {specs && specs.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 mb-10 px-4">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex items-center">
                {/*Separator - hidden on the first item */}
                {idx !== 0 && (
                  <div className="hidden md:block h-12 w-px bg-white/50 mr-6 md:mr-16" />
                )}

                <div className="flex flex-col items-center backdrop-blur-md w-60 rounded-xl p-4 border border-white/10 shadow-xl">
                  <span className="text-xl md:text-3xl font-bold text-foreground uppercase">{spec.value}</span>
                  <span className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mt-1">{spec.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/cars"
            className="rounded-none bg-primary hover:bg-primary/90 px-10 py-4 text-sm tracking-wider uppercase font-bold text-primary-foreground shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
          >
            Explore Inventory
          </Link>
          <Link
            href="/auth/signup/dealer"
            className="rounded-none border border-foreground/20 bg-background/20 backdrop-blur-md px-10 py-4 text-sm tracking-wider uppercase font-bold text-foreground transition-all hover:bg-foreground hover:text-background"
          >
            Sell With Us
          </Link>
        </div>

        {/* Featured Car Indicator */}
        {hasFeaturedCar && featuredCarId && (
          <div className="mt-8 animate-in fade-in duration-1000 delay-700">
            <span className="inline-flex items-center gap-2 rounded-none border border-primary/20 bg-primary/10 px-4 py-2 text-xs tracking-widest uppercase font-bold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Featured Model Available
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
