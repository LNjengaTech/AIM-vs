// components/home/featured-cars-section.tsx
// Shows top-ranked available verified cars. Uses the existing getRankedCars utility.

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getRankedCars } from "@/lib/ranking"
import { CarCard } from "@/components/cars/car-card"
import { RankedCar } from "@/types/cars"

export async function FeaturedCarsSection() {
  const { cars } = await getRankedCars({
    page: 1,
    limit: 4,
    sortBy: "ranked",
  })

  if (cars.length === 0) return null

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">
              Live Inventory
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Featured Listings</h2>
            <p className="text-muted-foreground mt-1">
              Top-ranked, verified cars available right now in Mombasa.
            </p>
          </div>
          <Link
            href="/cars"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cars.map((car) => (
            <CarCard key={car.id} {...carToCardProps(car)} />
          ))}
        </div>

        <div className="mt-12 text-center sm:hidden">
          <Link
            href="/cars"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:scale-105"
          >
            View All Cars
          </Link>
        </div>
      </div>
    </section>
  )
}

function carToCardProps(car: RankedCar) {
  return {
    id: car.id,
    slug: car.slug,
    make: car.make,
    model: car.model,
    year: car.year,
    price: Number(car.price),
    image: car.images[0] || "",
    mileage: car.mileage,
    fuelType: car.fuelType,
    transmission: car.transmission,
    condition: car.condition,
    dealerName: car.dealer.businessName,
    isVerified: car.dealer.isVerified,
    isPioneer: car.dealer.isPioneer,
    isFavorited: false, // Homepage is public
  }
}
