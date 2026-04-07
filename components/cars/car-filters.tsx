"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FilterIcon } from "lucide-react"

export function CarFilters({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  //state maps to URL params
  const [filters, setFilters] = useState({
    make: searchParams.get("make") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    transmission: searchParams.get("transmission") || "",
    fuelType: searchParams.get("fuelType") || "",
    bodyType: searchParams.get("bodyType") || "",
    condition: searchParams.get("condition") || "",
  })

  //fixed
  //problem: Circular Dependency
  //fix: Idempotent Updates
  useEffect(() => {
    const timer = setTimeout(() => {
      //1.create the new params based on current state
      const newParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) newParams.set(key, value)
      })

      const newQueryString = newParams.toString()
      const currentQueryString = searchParams.toString()

      //2.only push if the query has actually changed
      if (newQueryString !== currentQueryString) {
        const path = newQueryString ? `/cars?${newQueryString}` : "/cars"

        //3.use .replace + scroll: false for better UX in filters
        router.replace(path, { scroll: false })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [filters, router, searchParams]) // searchParams is fine here if the check above exists


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
      fuelType: "",
      bodyType: "",
      condition: "",
    })
    //we push strictly to /cars to clear query
    router.push("/cars")
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="mb-4 w-full md:hidden" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <FilterIcon className="mr-2 h-4 w-4" />
        {isOpen ? "Hide Filters" : "Show Filters"}
      </Button>

      <div className={cn(
        "space-y-6 rounded-4xl bg-card p-4 shadow-2xl transition-all",
        isOpen ? "block" : "hidden md:block",
        className
      )}>
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
            className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", e.target.value)}
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              placeholder="Max"
              className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filters.minYear}
              onChange={(e) => handleChange("minYear", e.target.value)}
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              placeholder="Max"
              className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filters.maxYear}
              onChange={(e) => handleChange("maxYear", e.target.value)}
            />
          </div>
        </div>

        {/*Transmission (Quick Filter) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Transmission</label>
          <select
            className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.transmission}
            onChange={(e) => handleChange("transmission", e.target.value)}
          >
            <option value="">Any</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
            <option value="cvt">CVT</option>
          </select>
        </div>

        {/*Fuel Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fuel Type</label>
          <select
            className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.fuelType}
            onChange={(e) => handleChange("fuelType", e.target.value)}
          >
            <option value="">Any</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        {/*Body Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Body Type</label>
          <select
            className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.bodyType}
            onChange={(e) => handleChange("bodyType", e.target.value)}
          >
            <option value="">Any</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="station_wagon">Station Wagon</option>
            <option value="pickup">Pickup</option>
            <option value="van">Van</option>
          </select>
        </div>

        {/*Condition */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Condition</label>
          <select
            className="flex h-9 w-full rounded-3xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.condition}
            onChange={(e) => handleChange("condition", e.target.value)}
          >
            <option value="">Any</option>
            <option value="foreign_used">Foreign Used</option>
            <option value="local_used">Local Used</option>
            <option value="new">New</option>
          </select>
        </div>
      </div>
    </div>
    </>
  )
}
