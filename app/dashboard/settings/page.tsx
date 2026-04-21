// app/dashboard/settings/page.tsx
// Dealer settings page — profile, business info, notifications, password change.

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DealerSettingsClient } from "@/components/dashboard/dealer-settings-client"

export default async function DealerSettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "DEALER") redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { dealerProfile: true },
  })
  
  if (!user?.dealerProfile) redirect("/dashboard")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, business profile, and preferences.
        </p>
      </div>
      <DealerSettingsClient
        user={{
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          image: user.image ?? null,
        }}
        dealer={{
          id: user.dealerProfile.id,
          businessName: user.dealerProfile.businessName,
          phoneNumber: user.dealerProfile.businessPhone ?? "",
          location: user.dealerProfile.location ?? "",
          description: user.dealerProfile.description ?? "",
          isVerified: user.dealerProfile.isVerified,
          isPioneer: user.dealerProfile.isPioneer,
        }}
      />
    </div>
  )
}
