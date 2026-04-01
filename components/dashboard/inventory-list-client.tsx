"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { InventoryActions } from "@/components/dashboard/inventory-actions"
import { InventorySearch } from "@/components/dashboard/inventory-search"

interface Car {
  id: string
  year: number
  make: string
  model: string
  slug: string
  color: string
  transmission: string
  price: number
  status: string
  completenessScore: number
  createdAt: Date
}

interface InventoryListClientProps {
  cars: Car[]
}

export function InventoryListClient({ cars }: InventoryListClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter cars based on search query
  const filteredCars = useMemo(() => {
    if (!searchQuery.trim()) return cars

    const query = searchQuery.toLowerCase()
    return cars.filter(car =>
      car.make.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      car.year.toString().includes(query) ||
      car.color.toLowerCase().includes(query) ||
      car.status.toLowerCase().includes(query)
    )
  }, [cars, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <Link 
          href="/dashboard/add-car" 
          className="flex items-center justify-center gap-2 rounded-4xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          Add Car
        </Link>
      </div>

      {/* Search Bar */}
      <InventorySearch onSearch={setSearchQuery} />

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {filteredCars.length} {filteredCars.length === 1 ? 'result' : 'results'} found
        </p>
      )}

      <div className="rounded-4xl bg-card shadow-2xl border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Car</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Completeness</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Added</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredCars.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {searchQuery 
                        ? `No cars match "${searchQuery}"`
                        : "No cars listed yet. Click \"Add Car\" to get started."}
                   </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="font-medium">{car.year} {car.make} {car.model}</div>
                      <div className="text-xs text-muted-foreground">{car.color} • {car.transmission}</div>
                    </td>
                    <td className="p-4 align-middle">
                        KES {car.price.toLocaleString()}
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
                        <InventoryActions carId={car.id} carSlug={car.slug} currentStatus={car.status} />
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
