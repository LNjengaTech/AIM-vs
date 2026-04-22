// components/home/key-features-section.tsx
// Platform feature highlights — 6 cards covering the core differentiators.

import { Shield, Bell, RotateCcw, Bot, BarChart3, Star, LucideIcon } from "lucide-react"

interface Feature {
  title: string
  description: string
  Icon: LucideIcon
}

const FEATURES: Feature[] = [
  {
    title: "Verified Dealers Only",
    description: "Every dealer on AIM-Mombasa is manually reviewed and approved by our team. Ghost listings from unverified sources don't exist here.",
    Icon: Shield,
  },
  {
    title: "BOLO Matchmaking",
    description: "Set a Be On Look Out alert with your exact criteria. The moment a matching car is listed, you get notified — no daily browsing needed.",
    Icon: Bell,
  },
  {
    title: "360° Virtual Walkaround",
    description: "Dealers with 8+ photos unlock an interactive turntable view. Inspect every angle before stepping foot in a showroom.",
    Icon: RotateCcw,
  },
  {
    title: "AI Assistant",
    description: "Ask the AIM Assistant anything — 'Is this price fair?', 'What should I check before buying a 2018 Axio?' — directly on any listing.",
    Icon: Bot,
  },
  {
    title: "Dealer Analytics",
    description: "Dealers see real-time views, favourites, and leads per listing. Know which cars attract attention and price accordingly.",
    Icon: BarChart3,
  },
  {
    title: "Pioneer Programme",
    description: "The first 10 verified dealers earn Pioneer status — a permanent badge and ranking boost that recognises early adoption.",
    Icon: Star,
  },
]

export function KeyFeaturesSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">
            Why AIM-Mombasa
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Built for Mombasa's Car Market
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-lg">
            Every feature was designed around the real problems buyers and dealers
            face in Mombasa — wasted trips, ghost listings, and no visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div 
              key={f.title} 
              className="group rounded-3xl border bg-card p-8 hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <f.Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
