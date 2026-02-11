"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CarFilters({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  //state maps to URL params
  const [filters, setFilters] = useState({
    make: searchParams.get("make") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    transmission: searchParams.get("transmission") || "",
  })

  //debounce updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
      })
      
      //reset page on filter change
      params.delete("page")

      router.push(`/cars?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters, router, searchParams])

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
      setFilters({
        make: "",
        minPrice: "",
        maxPrice: "",
        minYear: "",
        maxYear: "",
        transmission: "",
      })
      //we push strictly to /cars to clear query
      router.push("/cars")
  }

  return (
    <div className={cn("space-y-6 rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto px-2 text-xs">
            Reset
        </Button>
      </div>

      <div className="space-y-4">
        {/*search */}
        <div className="space-y-2">
            <label className="text-sm font-medium">Make/Model</label>
            <input
                type="text"
                placeholder="Search..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filters.make}
                onChange={(e) => handleChange("make", e.target.value)}
            />
        </div>

        {/* Price Range */}
        <div className="space-y-2">
            <label className="text-sm font-medium">Price (KES)</label>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="Min"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filters.minPrice}
                    onChange={(e) => handleChange("minPrice", e.target.value)}
                />
                <span className="text-muted-foreground">-</span>
                 <input
                    type="number"
                    placeholder="Max"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filters.maxPrice}
                    onChange={(e) => handleChange("maxPrice", e.target.value)}
                />
            </div>
        </div>

        {/* Year Range */}
         <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="Min"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filters.minYear}
                    onChange={(e) => handleChange("minYear", e.target.value)}
                />
                <span className="text-muted-foreground">-</span>
                 <input
                    type="number"
                    placeholder="Max"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filters.maxYear}
                    onChange={(e) => handleChange("maxYear", e.target.value)}
                />
            </div>
        </div>

         {/*Transmission (Quick Filter) */}
         <div className="space-y-2">
            <label className="text-sm font-medium">Transmission</label>
            <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filters.transmission}
                onChange={(e) => handleChange("transmission", e.target.value)}
            >
                <option value="">Any</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="cvt">CVT</option>
            </select>
        </div>
      </div>
    </div>
  )
}
