"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Heart, Fuel, Gauge, Settings2 } from "lucide-react" // Importing icons to represent Fuel, Mileage, Transmission
import { cn } from "@/lib/utils"

interface CarCardProps {
  id: string
  slug: string
  make: string
  model: string
  year: number
  price: number
  image?: string
  mileage: number
  fuelType: string
  transmission: string
  condition: string
  dealerName?: string
  isVerified?: boolean
  isPioneer?: boolean
  isFavorited?: boolean
  className?: string
}

export function CarCard({
  id,
  slug,
  make,
  model,
  year,
  price,
  image,
  mileage,
  fuelType,
  transmission,
  condition,
  dealerName,
  isVerified,
  isPioneer,
  isFavorited = false,
  className,
}: CarCardProps) {
  const [isFav, setIsFav] = React.useState(isFavorited)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId: id })
      })

      if (response.status === 401) {
        // Redirect to login
        window.location.href = "/auth/login?redirect=/cars"
        return
      }

      if (!response.ok) throw new Error("Failed to toggle favorite")

      const data = await response.json()
      setIsFav(data.isFavorited)
    } catch (error) {
      console.error("Favorite error:", error)
    }
  }

  return (
    <Link 
        href={`/cars/${slug}`}
        className={cn(
            "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/50",
            className
        )}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {image ? (
            <Image
                src={image}
                alt={`${year} ${make} ${model}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
            </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isVerified && <Badge variant="success" className="bg-green-600/90 hover:bg-green-600">Verified Dealer</Badge>}
            {isPioneer && <Badge variant="secondary" className="bg-blue-600/90 text-white hover:bg-blue-600">Pioneer</Badge>}
            {condition === "new" && <Badge className="bg-purple-600/90 hover:bg-purple-600">Brand New</Badge>}
        </div>

        {/* Favorite Button */}
        <button 
            onClick={handleFavoriteClick}
            className={cn(
              "absolute right-2 top-2 rounded-full p-2 backdrop-blur-sm transition-all",
              isFav 
                ? "bg-red-500/90 text-white hover:bg-red-600" 
                : "bg-white/80 text-gray-700 hover:bg-white hover:text-red-500"
            )}
        >
            <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
            <h3 className="font-semibold text-foreground line-clamp-1">
                {year} {make} {model}
            </h3>
            <p className="text-lg font-bold text-primary">
                KES {Number(price).toLocaleString()}
            </p>
        </div>

        {/* Specs Grid */}
        <div className="mt-auto grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" />
                <span>{mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1">
                <Settings2 className="h-3.5 w-3.5" />
                <span>{transmission}</span>
            </div>
            <div className="flex items-center gap-1">
                <Fuel className="h-3.5 w-3.5" />
                <span>{fuelType}</span>
            </div>
             <div className="flex items-center gap-1">
                <span className="capitalize">{condition}</span>
            </div>
        </div>
        
        {dealerName && (
             <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                <span className="font-medium">Sold by:</span> {dealerName}
             </div>
        )}
      </div>
    </Link>
  )
}
