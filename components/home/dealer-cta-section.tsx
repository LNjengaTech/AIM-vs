// components/home/dealer-cta-section.tsx
// Dealer-facing call to action section. Placed near the bottom of the homepage.

import Link from "next/link"

export function DealerCTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with primary color and some texture */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
          Are You a Car Dealer in Mombasa?
        </h2>
        <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed">
          Join AIM-Mombasa and get your inventory in front of verified, high-intent
          buyers. The first 10 dealers earn Pioneer status and a permanent ranking
          advantage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup/dealer"
            className="inline-flex items-center justify-center rounded-full bg-white text-primary px-10 py-4 font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-xl active:scale-95"
          >
            Apply as a Dealer
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm px-10 py-4 font-bold text-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  )
}
