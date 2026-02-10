import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, ArrowBigLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { InventoryActions } from "@/components/dashboard/inventory-actions"

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
  })

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <ArrowBigLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>

        <Link href="/dashboard/add-car" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" >
          <PlusCircle className="h-4 w-4" /> Add Car
        </Link>

      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Car</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Completeness</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Added</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No cars listed yet. Click Add Car to get started.
                  </td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr key={car.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="font-medium">{car.year} {car.make} {car.model}</div>
                      <div className="text-xs text-muted-foreground">{car.color} • {car.transmission}</div>
                    </td>
                    <td className="p-4 align-middle">
                      KES {Number(car.price).toLocaleString()}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={car.status === "AVAILABLE" ? "success" : "secondary"}>
                        {car.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${car.completenessScore}%` }}
                          />
                        </div>
                        <span className="text-xs">{car.completenessScore}%</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(car.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <InventoryActions carId={car.id} currentStatus={car.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
