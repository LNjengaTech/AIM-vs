import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ImageGallery } from "@/components/cars/image-gallery"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Calendar, Gauge, Fuel, Settings2, CheckCircle2 } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const car = await prisma.car.findUnique({ where: { id } })
  if (!car) return { title: "Car Not Found" }
  return { title: `${car.year} ${car.make} ${car.model} | AIM Mombasa` }
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const car = await prisma.car.findUnique({
    where: { id },
    include: { dealer: { include: { user: true } } }
  })

  if (!car) notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Gallery & Specs */}
        <div className="lg:col-span-2 space-y-8">
            <ImageGallery images={car.images} title={`${car.make} ${car.model}`} />
            
            <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-xl font-semibold">Specifications</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <SpecItem icon={<Calendar />} label="Year" value={car.year} />
                    <SpecItem icon={<Gauge />} label="Mileage" value={`${car.mileage} km`} />
                    <SpecItem icon={<Settings2 />} label="Transmission" value={car.transmission} />
                    <SpecItem icon={<Fuel />} label="Fuel" value={car.fuelType} />
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
                 <h2 className="mb-4 text-xl font-semibold">Description</h2>
                 <p className="whitespace-pre-wrap text-muted-foreground">{car.description || "No description."}</p>
            </div>

             {car.features.length > 0 && (
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="mb-4 text-xl font-semibold">Features</h2>
                    <ul className="grid grid-cols-2 gap-2">
                        {car.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary"/>{f}</li>
                        ))}
                    </ul>
                </div>
             )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
             <div className="rounded-xl border bg-card p-6 sticky top-24">
                <h1 className="text-2xl font-bold mb-1">{car.year} {car.make} {car.model}</h1>
                <p className="text-3xl font-bold text-primary mb-4">KES {Number(car.price).toLocaleString()}</p>
                
                <Button className="w-full mb-2" size="lg"><Phone className="mr-2 h-4 w-4" /> Contact Dealer</Button>
                
                <div className="mt-6 pt-6 border-t">
                    <p className="font-semibold mb-2">{car.dealer.businessName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" /> {car.dealer.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" /> {car.dealer.businessPhone}
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ icon, label, value }: { icon: any, label: string, value: any }) {
    return (
        <div className="space-y-1">
            <span className="flex items-center gap-2 text-xs text-muted-foreground capitalize">
                {/* Clone icon to set size if needed, or just rely on parent */}
                <div className="[&>svg]:h-4 [&>svg]:w-4">{icon}</div> {label}
            </span>
            <p className="font-medium capitalize">{value}</p>
        </div>
    )
}
