// app/dashboard/inventory/[id]/edit/page.tsx
// Server component for editing a specific car listing.
// Ensures the user is an authenticated dealer and owns the car.

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditCarForm } from "@/components/dashboard/edit-car-form"

export default async function EditCarPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "DEALER") {
    redirect("/auth/login?redirect=/dashboard/inventory")
  }

  // Find the dealer profile
  const dealer = await prisma.dealerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!dealer) {
    redirect("/dashboard")
  }

  // Fetch the car, ensuring it belongs to the current dealer
  const car = await prisma.car.findFirst({
    where: {
      id: params.id,
      dealerId: dealer.id,
    },
  })

  if (!car) {
    // Car not found or doesn't belong to this dealer
    redirect("/dashboard/inventory")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
          <p className="text-muted-foreground mt-1">
            Update details for your {car.year} {car.make} {car.model}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl bg-card rounded-4xl p-6 border shadow-sm">
        <EditCarForm car={car} />
      </div>
    </div>
  )
}
