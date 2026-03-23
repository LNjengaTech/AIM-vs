import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CarFilters } from "@/components/cars/car-filters"
import { CarCard } from "@/components/cars/car-card"
import { CarSort } from "@/components/cars/car-sort"
import { Navbar } from "@/components/ui/navbar"
import { Prisma } from "@prisma/client"
import { Metadata } from "next"

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
  const sort = searchParams.sort || "newest"

  // Build Where Clause
  const where: Prisma.CarWhereInput = {
    status: "AVAILABLE",
  }

  if (make) {
    where.OR = [
      { make: { contains: make, mode: "insensitive" } },
      { model: { contains: make, mode: "insensitive" } },
    ]
  }

  if (minPrice || maxPrice) {
    where.price = { gte: minPrice, lte: maxPrice }
  }

  if (minYear || maxYear) {
    where.year = { gte: minYear, lte: maxYear }
  }

  if (transmission) {
    where.transmission = { equals: transmission, mode: "insensitive" }
  }

  // Determine Order
  let orderBy: Prisma.CarOrderByWithRelationInput = { createdAt: "desc" }
  if (sort === "price_asc") orderBy = { price: "asc" }
  else if (sort === "price_desc") orderBy = { price: "desc" }
  else if (sort === "mileage_asc") orderBy = { mileage: "asc" }

  // Fetch Cars
  const cars = await prisma.car.findMany({
    where,
    orderBy,
    include: { dealer: true },
    take: 20,
  })

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
      
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        <aside className="w-full md:w-64 flex-none"><CarFilters /></aside>

        <main className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight">Browse Inventory</h1>
                   <p className="text-muted-foreground">{cars.length} vehicles found</p>
                </div>
                <CarSort /> 
            </div>

            {cars.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                    <p className="text-lg font-medium">No cars found</p>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </main>
      </div>
    </div>
    </div>
  )
}
