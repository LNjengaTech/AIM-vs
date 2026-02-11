"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Heart, Fuel, Gauge, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarCardProps {
  id: string
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
  className?: string
}

export function CarCard({
  id,
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
  className,
}: CarCardProps) {
  return (
    <Link 
        href={`/cars/${id}`}
        className={cn(
            "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/50",
            className
        )}
    >
      {/*Image Section */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
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
        
        {/*Badges*/}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isVerified && <Badge variant="success" className="bg-green-600/90 hover:bg-green-600">Verified Dealer</Badge>}
            {isPioneer && <Badge variant="secondary" className="bg-blue-600/90 text-white hover:bg-blue-600">Pioneer</Badge>}
            {condition === "new" && <Badge className="bg-purple-600/90 hover:bg-purple-600">Brand New</Badge>}
        </div>

        {/*favorite button-Placeholder*/}
        <button 
            onClick={(e) => {
                e.preventDefault()
                //TODO: Implement toggle favorite
            }}
            className="absolute right-2 top-2 rounded-full bg-white/80 p-2 text-gray-700 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500"
        >
            <Heart className="h-4 w-4" />
        </button>
      </div>

      {/*content section*/}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
            <h3 className="font-semibold text-foreground line-clamp-1">
                {year} {make} {model}
            </h3>
            <p className="text-lg font-bold text-primary">
                KES {Number(price).toLocaleString()}
            </p>
        </div>

        {/*specs Grid*/}
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
