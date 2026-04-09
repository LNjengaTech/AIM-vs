import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, Search, Calendar, Tag, Trash2, CarFront } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { deleteBolo } from "@/app/actions/bolo"

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

  const allMatches = await prisma.bOLOMatch.findMany({
    where: { boloRequest: { buyerId: buyer.id } },
    include: { car: true, boloRequest: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BOLO Requests</h1>
          <p className="text-muted-foreground mt-1">
            &quot;Be On Look Out&quot; - We&apos;ll notify you when matching cars match your criteria.
          </p>
        </div>
        <Link href="/buyer/bolo/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Request
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Active Requests</TabsTrigger>
          <TabsTrigger value="matches">
            Matches
            {allMatches.length > 0 && (
              <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">{allMatches.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-4">
      {bolos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-4xl border border-dashed p-12 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Search className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No requests yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mb-6">
            Tell us what you&apos;re looking for, and we&apos;ll help you find it.
          </p>
          <Link href="/buyer/bolo/new">
            <Button>Create your first BOLO</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {bolos.map((bolo) => (
            <div key={bolo.id} className="rounded-4xl border bg-card p-2 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {bolo.yearMin || ''} {bolo.yearMax ? `- ${bolo.yearMax}` : ''} {bolo.make || 'Any Make'} {bolo.model || ''}
                    </h3>

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
                      &quot;{bolo.description}&quot;
                    </p>
                  )}

                  <div className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(bolo.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-37.5">
                  {/* Placeholder for match count/status */}
                  <div className="text-sm font-medium">
                    {bolo.matches.length} {bolo.matches.length === 1 ? 'Match' : 'Matches'} Found
                  </div>

                  <div className="flex items-center justify-between">

                    {bolo.isActive ? (
                      <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}

                    <form action={async () => {
                      "use server"
                      await deleteBolo(bolo.id)
                    }}>
                      <Button
                        variant="outline"
                        size="sm"
                        type="submit"
                        className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {allMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-4xl border border-dashed p-12 text-center animate-in fade-in-50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <CarFront className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No matches yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mb-6">
                We&apos;ll notify you when something fits. Keep an eye out!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMatches.map((match) => (
                <Link href={`/cars/${match.car.slug}`} key={match.id} className="block transition-transform hover:scale-[1.01]">
                  <Card className="rounded-4xl overflow-hidden hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                      <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-muted relative">
                        {match.car.images && match.car.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={match.car.images[0]} alt={match.car.make} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/20">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg line-clamp-1">{match.car.year} {match.car.make} {match.car.model}</h3>
                            <Badge 
                              variant={match.matchScore >= 80 ? "success" : match.matchScore >= 60 ? "warning" : "destructive"} 
                              className={
                                match.matchScore >= 80 ? "bg-green-100 text-green-800" : 
                                match.matchScore >= 60 ? "bg-amber-100 text-amber-800" : 
                                "bg-red-100 text-red-800"
                              }
                            >
                              {match.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-primary mb-2">KES {Number(match.car.price).toLocaleString()}</p>
                          <div className="flex gap-2 text-sm text-muted-foreground flex-wrap">
                            <span className="bg-secondary px-2 py-1 rounded-md">{match.car.transmission}</span>
                            <span className="bg-secondary px-2 py-1 rounded-md">{match.car.fuelType}</span>
                            <span className="bg-secondary px-2 py-1 rounded-md">{match.car.mileage.toLocaleString()} km</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 text-right">
                          Matched {new Date(match.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
