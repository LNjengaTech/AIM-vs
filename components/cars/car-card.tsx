"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Heart, Gauge, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { VerifiedBadge } from "@/components/ui/verified-badge"


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
  image, isFavorited = false,
  mileage,
  fuelType,
  transmission,
  condition,
  dealerName,
  isVerified,
  isPioneer,
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
    <Link href={`/cars/${slug}`} className="group relative flex flex-col overflow-hidden rounded-4xl bg-card  p-3 transition-all shadow-2xl">

      {/* Image Section */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl">
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
        <div className="absolute left-1 top-1 flex flex-col gap-1">
            {condition === "new" && <Badge className="bg-blue-600">New</Badge>}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute right-1 top-1 rounded-full p-2 backdrop-blur-sm transition-all",
            isFav
              ? "bg-red-500/90 text-white hover:bg-red-600"
              : "bg-white/80 text-gray-700 hover:bg-white hover:text-red-500"
          )}
        >
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col pt-4">
        <div className="mb-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-1">
            {year} {make} {model}
          </h3>
          <p className="text-md font-bold text-foreground">
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
            
             
        </div>

        {dealerName && (
          <div className="flex items-center gap-1 mt-4 border-t pt-3 text-xs text-muted-foreground">
            <span className="text-gray-500 text-xs font-md">{dealerName}</span>
            <div className="flex flex-row">
              {/*Priority logic: Show Pioneer if true, else show Verified if true instead of showing two badges*/}
              {isPioneer ? (
                <VerifiedBadge variant="pioneer" size={20} />
              ) : isVerified ? (
                <VerifiedBadge variant="verified" size={20} />
              ) : null}

              
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
