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

      {/*;ayer Z-0: Environment / Background */}
      <div className="absolute inset-0 z-0">
        {backgroundImageUrl && backgroundImageUrl.startsWith('http') ? (
          <Image
            src={backgroundImageUrl || "/images/showroom_bg4.avif"}
            alt="Hero Environment"
            fill
            priority
            className="object-cover opacity-80"
            sizes="100vw"
            quality={85}
          />
        ) : (
          <div className="">
             <Image
            src="/images/AI_showroom1.png"
            alt="Hero Environment"
            fill
            priority
            className="object-cover opacity-80"
          />

          </div>
          // <div
          //   className="absolute inset-0 bg-linear-to-b from-primary/30 to-background"
          //   style={{ backgroundColor: selectedColor || undefined }}
          // />
        )}

        {/* Optional: Darken background slightly to pop the car */}
        {/* <div className="absolute inset-0 bg-black/20" /> */}

        {/*overlay - text readability*/}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background via-background/60 to-transparent z-0" />
      </div>

      {/*sandwiched tagline*/}
      <div className="relative z-10 top-30 flex h-full items-center justify-center pointer-events-none">
        {tagline && (
          <span className="text-[10vw] font-black tracking-tighter text-white uppercase leading-none">
            {tagline}
          </span>
        )}
      </div>

      <div className="z-30 absolute inset-10 flex flex-col items-center justify-center pt-28 pointer-events-none select-none">
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

      {/*foreground cutout image */}
      <div className="absolute inset-0 z-20 flex items-end justify-center pb-[15vh] md:pb-[20vh] pointer-events-none shadow-2xl">
        {foregroundImageUrl && foregroundImageUrl.startsWith('http') && (
          <div className="relative w-full max-w-300 aspect-2/1 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Image
              src={foregroundImageUrl}
              alt="Featured Car Focus"
              fill
              priority
              className="object-contain object-bottom scale-110 drop-shadow-2xl"
            />
          </div>
        )}

        {/* Optional: Darken foreground slightly to pop the car */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/*Interactivity and Specs */}
      <div className="relative z-30 mt-auto pb-10 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
        {specs && specs.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 mb-10 px-4">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex items-center">
                {/*Separator*/}
                {idx !== 0 && (
                  <div className="hidden md:block h-12 w-px bg-white/50 mr-6 md:mr-16" />
                )}

                <div className="flex flex-col items-center backdrop-blur-md lg:w-60 rounded-3xl p-4 border border-white/10 shadow-xl">
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
