import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { ImageGallery } from "@/components/cars/image-gallery"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Calendar, Gauge, Fuel, Settings2, CheckCircle2, Settings } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { FavoriteButton } from "@/components/cars/favorite-button"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import Link from "next/link"
import ChatWidget from "@/components/aim-assistant/chat-widget-wrapper"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const car = await prisma.car.findUnique({ where: { slug } })
  if (!car) return { title: "Car Not Found" }
  return { title: `${car.year} ${car.make} ${car.model} | AIM Mombasa` }
}

export default async function CarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  const car = await prisma.car.findUnique({
    where: { slug },
    include: { dealer: { include: { user: true } } }
  })

  if (!car) notFound()
  
  // Public visibility check: Car must be verified OR its dealer must be verified
  // Admins can always view any listing
  const isVisible = car.isVerified || car.dealer.isVerified || (session?.user?.role === "ADMIN")
  if (!isVisible) notFound()

  // Check if car is favorited by current user
  let isFavorited = false
  if (session?.user && session.user.role === "BUYER") {
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (buyerProfile) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          buyerId_carId: {
            buyerId: buyerProfile.id,
            carId: car.id
          }
        }
      })
      isFavorited = !!favorite
    }
  }

  // Track page view
  if (session?.user && session.user.role === "BUYER") {
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (buyerProfile) {
      await prisma.engagement.create({
        data: {
          buyerId: buyerProfile.id,
          carId: car.id,
          type: "VIEW"
        }
      }).catch(() => {
        // Ignore errors
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session?.user} />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cars" className="hover:text-foreground transition-colors">Listings</Link>
          <span>/</span>
          <span className="text-foreground">{car.year} {car.make} {car.model}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Gallery & Specs */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            <ImageGallery images={car.images} title={`${car.make} ${car.model}`} />

            {/* Specifications */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Specifications</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <SpecItem icon={<Calendar />} label="Year" value={car.year} />
                <SpecItem icon={<Gauge />} label="Mileage" value={`${car.mileage.toLocaleString()} km`} />
                <SpecItem icon={<Settings2 />} label="Transmission" value={car.transmission} />
                <SpecItem icon={<Fuel />} label="Fuel Type" value={car.fuelType} />
                <SpecItem icon={<Settings2 />} label="Body Type" value={car.bodyType} />
                <SpecItem icon={<CheckCircle2 />} label="Condition" value={car.condition} />
                {car.engineCapacity && (
                  <SpecItem icon={<Settings2 />} label="Engine" value={car.engineCapacity} />
                )}
                <SpecItem icon={<Settings />} label="Color" value={car.color} />
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {car.description || "No description available."}
              </p>
            </div>

            {/* Features */}
            {car.features.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-xl font-semibold">Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {car.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-4xl shadow-2xl bg-card p-6 sticky top-24">
              <h1 className="text-2xl font-bold mb-1">
                {car.year} {car.make} {car.model}
              </h1>
              <p className="text-3xl font-bold text-primary mb-4">
                KES {Number(car.price).toLocaleString()}
              </p>

              {car.negotiable && (
                <Badge variant="secondary" className="mb-4">Negotiable</Badge>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <a href={`tel:${car.dealer.businessPhone}`} className="w-full mb-2 px-6 py-3 inline-flex justify-center gap-1 bg-primary rounded-lg text-gray-200 text-sm font-semibold ">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Dealer
                </a>

                <FavoriteButton
                  carId={car.id}
                  initialIsFavorited={isFavorited}
                  requiresAuth={!session?.user || session.user.role !== "BUYER"}
                />
              </div>

              {/* Dealer Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="font-semibold mb-2 inline-flex">Sold By: {car.dealer.businessName}
                  {car.dealer.isVerified && (
                  <VerifiedBadge variant="verified" size={20} />
                )}
                {car.dealer.isPioneer && (
                  <VerifiedBadge variant="pioneer" size={20} />
                )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{car.dealer.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{car.dealer.businessPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget 
        page="car-detail" 
        userRole={session?.user?.role} 
        carContext={{
          make: car.make,
          model: car.model,
          year: car.year,
          price: Number(car.price),
          mileage: car.mileage,
          condition: car.condition,
          fuelType: car.fuelType,
          transmission: car.transmission,
          features: car.features,
          dealerName: car.dealer.businessName,
          isVerified: car.dealer.isVerified,
        }} 
      />
    </div>
  )
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="space-y-1">
      <span className="flex items-center gap-2 text-xs text-muted-foreground capitalize">
        <div className="[&>svg]:h-4 [&>svg]:w-4">{icon}</div> {label}
      </span>
      <p className="font-medium capitalize">{value}</p>
    </div>
  )
}
