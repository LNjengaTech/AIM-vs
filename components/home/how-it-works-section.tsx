// components/home/how-it-works-section.tsx
// "How It Works" section. Tab switcher: For Buyers | For Dealers.
// Client component for tab interactivity only.
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const BUYER_STEPS = [
  {
    number: 1,
    title: "Browse Verified Cars",
    description: "Filter by make, model, price and year. Every listing is from a verified Mombasa dealer.",
  },
  {
    number: 2,
    title: "Set a BOLO Alert",
    description: "Can't find exactly what you want? Submit a BOLO request and get notified the moment a match is listed.",
  },
  {
    number: 3,
    title: "Connect & Visit",
    description: "Contact the dealer directly. No middlemen, no ghost listings — only real, available cars.",
  },
]

const DEALER_STEPS = [
  {
    number: 1,
    title: "Apply & Get Verified",
    description: "Sign up, submit your dealer permit, and get verified by the AIM team — usually within 24 hours.",
  },
  {
    number: 2,
    title: "List Your Inventory",
    description: "Upload your cars with photos and specs. Your completeness score determines your ranking.",
  },
  {
    number: 3,
    title: "Track Performance",
    description: "See views, leads, and favourites per listing on your analytics dashboard. Sell faster.",
  },
]

export function HowItWorksSection() {
  const [audience, setAudience] = React.useState<"buyer" | "dealer">("buyer")

  const steps = audience === "buyer" ? BUYER_STEPS : DEALER_STEPS

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">Simple Process</p>
        <h2 className="text-3xl font-bold tracking-tight mb-2">How It Works</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Whether you are buying or selling, AIM-Mombasa makes it straightforward.
        </p>

        <div className="inline-flex rounded-full bg-background p-1 mb-10 shadow-sm">
          <button
            onClick={() => setAudience("buyer")}
            className={cn(
              "rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200",
              audience === "buyer"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            For Buyers
          </button>
          <button
            onClick={() => setAudience("dealer")}
            className={cn(
              "rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200",
              audience === "dealer"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            For Dealers
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="group relative rounded-4xl bg-card p-8 text-left transition-all shadow-2xl hover:shadow-xl hover:-translate-y-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
