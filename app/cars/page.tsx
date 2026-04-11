import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CarFilters } from "@/components/cars/car-filters"
import { CarCard } from "@/components/cars/car-card"
import { CarSort } from "@/components/cars/car-sort"
import { Navbar } from "@/components/ui/navbar"
import { Metadata } from "next"
import { getRankedCars } from "@/lib/ranking"
import { CarFilters as CarFiltersType, CarSortOption } from "@/types/cars"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ChatWidget from "@/components/aim-assistant/chat-widget-wrapper"

export const metadata: Metadata = {
  title: "Browse Cars - AIM Mombasa",
  description: "Find your dream car from verified dealers in Mombasa.",
}

interface PageProps {
  searchParams: Promise<{
    make?: string
    minPrice?: string
    maxPrice?: string
    minYear?: string
    maxYear?: string
    transmission?: string
    fuelType?: string
    bodyType?: string
    condition?: string
    sort?: string
    page?: string
  }>
}

export default async function CarsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const session = await auth()
  
  // Parse Filters
  const make = searchParams.make
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined
  const minYear = searchParams.minYear ? Number(searchParams.minYear) : undefined
  const maxYear = searchParams.maxYear ? Number(searchParams.maxYear) : undefined
  const transmission = searchParams.transmission
  const fuelType = searchParams.fuelType
  const bodyType = searchParams.bodyType
  const condition = searchParams.condition
  const sort = searchParams.sort || "ranked"
  const page = searchParams.page ? Number(searchParams.page) : 1
  const limit = 12

  // Build Filters
  const filters: CarFiltersType = {
    make,
    priceMin: minPrice,
    priceMax: maxPrice,
    yearMin: minYear,
    yearMax: maxYear,
    transmission,
    fuelType,
    bodyType,
    condition,
    sortBy: sort as CarSortOption,
    page,
    limit
  }

  // Fetch Ranked Cars
  const { cars, total, totalPages } = await getRankedCars(filters)

  // Get favorite status for logged-in buyers
  let favoritedCarIds: string[] = []
  if (session?.user && session.user.role === "BUYER") {
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        favorites: {
          select: { carId: true }
        }
      }
    })
    favoritedCarIds = buyerProfile?.favorites.map(f => f.carId) || []
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session?.user} />
      
      <div className="container mx-auto px-1 md:p-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        <aside className="w-full md:w-64 flex-none"><CarFilters /></aside>

        <main className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight">Browse Inventory</h1>
                   <p className="text-muted-foreground">{total} vehicles found</p>
                </div>
                <CarSort /> 
            </div>

            {cars.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-4xl border border-dashed text-center">
                    <p className="text-lg font-medium">No cars found</p>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 md:gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {cars.map((car) => (
                        <CarCard
                            key={car.id}
                            id={car.id}
                            slug={car.slug}
                            make={car.make}
                            model={car.model}
                            year={car.year}
                            price={Number(car.price)}
                            image={car.images[0]} 
                            mileage={car.mileage}
                            fuelType={car.fuelType}
                            transmission={car.transmission}
                            condition={car.condition}
                            dealerName={car.dealer.businessName}
                            isVerified={car.dealer.isVerified}
                            isPioneer={car.dealer.isPioneer}
                            isFavorited={favoritedCarIds.includes(car.id)}
                        />
                    ))}
                </div>
            )}
            
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button variant="outline" disabled={page <= 1} asChild={page > 1}>
                    {page > 1 ? (
                      <Link href={`/cars?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>Previous</Link>
                    ) : (
                      <span>Previous</span>
                    )}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button variant="outline" disabled={page >= totalPages} asChild={page < totalPages}>
                    {page < totalPages ? (
                      <Link href={`/cars?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>Next</Link>
                    ) : (
                      <span>Next</span>
                    )}
                  </Button>
                </div>
            )}
        </main>
      </div>
      </div>
      <ChatWidget 
        page="marketplace" 
        userRole={session?.user?.role} 
        marketplaceContext={{
          listings: cars.slice(0, 15).map(car => ({
            make: car.make,
            model: car.model,
            year: car.year,
            price: Number(car.price),
            condition: car.condition,
            mileage: car.mileage
          }))
        }}
      />
    </div>
  )
}
