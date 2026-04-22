// components/home/live-stats-bar.tsx
// Horizontal stats strip showing live platform counts.
// Fetched server-side; ISR ensures it stays reasonably fresh.

import { prisma } from "@/lib/prisma"

export async function LiveStatsBar() {
  const [verifiedDealers, availableCars, boloRequests, citiesCount] =
    await Promise.all([
      prisma.dealerProfile.count({ where: { isVerified: true } }),
      prisma.car.count({ where: { status: "AVAILABLE", isVerified: true } }),
      prisma.bOLORequest.count({ where: { isActive: true } }),
      // Cities is static for now — Mombasa is the only city.
      // Return 1 until multi-city is built.
      Promise.resolve(1),
    ])

  return (
    <section className="border-y bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatPill value={availableCars} label="Cars Available" />
          <StatPill value={verifiedDealers} label="Verified Dealers" />
          <StatPill value={boloRequests} label="Active BOLO Alerts" />
          <StatPill value={citiesCount} label="City Covered" suffix="Mombasa" />
        </div>
      </div>
    </section>
  )
}

function StatPill({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  return (
    <div className="flex flex-col items-center py-2 transition-transform hover:scale-105">
      <span className="text-2xl md:text-3xl font-bold text-primary">
        {suffix ?? value.toLocaleString()}
      </span>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-center mt-1">
        {label}
      </span>
    </div>
  )
}
