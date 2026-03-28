import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, Search, Calendar, Tag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function BOLOPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!buyer) redirect("/")

  const bolos = await prisma.bOLORequest.findMany({
    where: { buyerId: buyer.id },
    orderBy: { createdAt: 'desc' },
    include: {
      matches: {
        include: {
           car: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">BOLO Requests</h1>
           <p className="text-muted-foreground mt-1">
             "Be On Look Out" - We'll notify you when matching cars match your criteria.
           </p>
        </div>
        <Link href="/buyer/bolo/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Request
          </Button>
        </Link>
      </div>

      {bolos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Search className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No requests yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mb-6">
            Tell us what you're looking for, and we'll help you find it.
          </p>
          <Link href="/buyer/bolo/new">
             <Button>Create your first BOLO</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bolos.map((bolo) => (
            <div key={bolo.id} className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
               <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                     <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">
                           {bolo.yearMin || ''} {bolo.yearMax ? `- ${bolo.yearMax}` : ''} {bolo.make || 'Any Make'} {bolo.model || ''}
                        </h3>
                        {bolo.isActive ? (
                            <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                        ) : (
                            <Badge variant="secondary">Inactive</Badge>
                        )}
                     </div>
                     
                     <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        {(bolo.priceMin || bolo.priceMax) && (
                            <div className="flex items-center gap-1">
                                <Tag className="h-4 w-4" />
                                <span>
                                    {bolo.priceMin ? `Min: KES ${Number(bolo.priceMin).toLocaleString()}` : ''}
                                    {bolo.priceMin && bolo.priceMax ? ' - ' : ''}
                                    {bolo.priceMax ? `Max: KES ${Number(bolo.priceMax).toLocaleString()}` : ''}
                                </span>
                            </div>
                        )}
                        {(bolo.transmission || bolo.fuelType) && (
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Specs:</span>
                                <span>{[bolo.transmission, bolo.fuelType].filter(Boolean).join(", ")}</span>
                            </div>
                        )}
                     </div>

                     {bolo.description && (
                        <p className="text-sm text-muted-foreground mt-2 border-l-2 pl-3 italic">
                           "{bolo.description}"
                        </p>
                     )}
                     
                     <div className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(bolo.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[150px]">
                      {/* Placeholder for match count/status */}
                      <div className="text-sm font-medium">
                         {bolo.matches.length} {bolo.matches.length === 1 ? 'Match' : 'Matches'} Found
                      </div>
                      
                      {/* Delete button (client component needed for interactivity or simple form action) */}
                      {/* For now just placeholder layout */}
                      <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" disabled>
                         <Trash2 className="h-4 w-4 mr-2" />
                         Delete
                      </Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
