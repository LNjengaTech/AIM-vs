// app/admin/settings/page.tsx
// Admin settings — account profile, security, platform configuration.

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminSettingsClient } from "@/components/admin/admin-settings-client"

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true }
  })
  
  if (!user) redirect("/admin")

  const [totalUsers, totalCars, totalDealers] = await Promise.all([
    prisma.user.count(),
    prisma.car.count(),
    prisma.dealerProfile.count(),
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, security, and platform configurations.
        </p>
      </div>
      <AdminSettingsClient 
        user={{
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          image: user.image ?? null
        }} 
        stats={{
          totalUsers,
          totalCars,
          totalDealers,
          platformVersion: "1.0.0 (Phase 3)"
        }}
      />
    </div>
  )
}
