import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CarCard } from "@/components/cars/car-card" // Reusing the car card component
import { Heart } from "lucide-react"

export default async function FavoritesPage() {
  const session = await auth()

  if (!session?.user) redirect("/auth/login")

  // Fetch favorites with related car details
  const favorites = await prisma.favorite.findMany({
    where: {
      buyer: {
        userId: session.user.id
      }
    },
    include: {
      car: {
        include: {
          dealer: true // To show dealer info if needed
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const favoritedCars = favorites.map(f => f.car)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
           <p className="text-muted-foreground mt-1">
             You have saved {favoritedCars.length} {favoritedCars.length === 1 ? 'car' : 'cars'}
           </p>
        </div>
        <Link href="/cars" className="text-sm font-medium text-primary hover:underline">
           Browse More Cars
        </Link>
      </div>

      {favoritedCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No favorites yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Start browsing our inventory and click the heart icon to save cars you're interested in.
          </p>
          <Link 
            href="/cars" 
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Browse Inventory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoritedCars.map((car) => (
            <CarCard
              key={car.id}
              id={car.id}
              slug={car.slug}
              make={car.make}
              model={car.model}
              year={car.year}
              price={Number(car.price)}
              image={car.images[0] || ""}
              mileage={car.mileage}
              fuelType={car.fuelType}
              transmission={car.transmission}
              condition={car.condition}
              dealerName={car.dealer.businessName}
              isVerified={car.dealer.isVerified}
              isPioneer={car.dealer.isPioneer}
              isFavorited={true} // Always true on favorites page
            />
          ))}
        </div>
      )}
    </div>
  )
}
