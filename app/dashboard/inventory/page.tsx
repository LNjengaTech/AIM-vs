import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { InventoryListClient } from "@/components/dashboard/inventory-list-client"

export default async function InventoryPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "DEALER") {
    redirect("/auth/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { dealerProfile: true },
  })

  if (!user?.dealerProfile) return null

  const cars = await prisma.car.findMany({
    where: { dealerId: user.dealerProfile.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      slug: true,
      color: true,
      transmission: true,
      price: true,
      status: true,
      completenessScore: true,
      createdAt: true
    }
  })

  // Convert Decimal to number for client component
  const carsWithNumberPrice = cars.map(car => ({
    ...car,
    price: Number(car.price)
  }))

  return <InventoryListClient cars={carsWithNumberPrice} />
}
