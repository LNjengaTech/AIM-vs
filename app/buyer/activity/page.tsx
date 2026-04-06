import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Clock, Eye, Heart, MessageSquare } from "lucide-react"

export default async function ActivityPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!buyer) redirect("/")

  // Fetch engagements (View, Favorites, etc.)
  const engagements = await prisma.engagement.findMany({
    where: { buyerId: buyer.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
        car: {
            select: {
                id: true,
                make: true,
                model: true,
                year: true,
                slug: true
            }
        }
    }
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
         <Link href="/buyer" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
         </Link>
         <h1 className="text-3xl font-bold tracking-tight">Recent Activity</h1>
         <p className="text-muted-foreground mt-1">
           Your last 10 interactions on the platform.
         </p>
      </div>

      {engagements.length === 0 ? (
        <div className="text-center py-12 border rounded-4xl bg-card">
           <p className="text-muted-foreground">No recent activity found.</p>
           <Link href="/cars" className="text-primary hover:underline mt-2 inline-block">
              Start browsing
           </Link>
        </div>
      ) : (
        <div className="relative border-l border-muted ml-3 space-y-6 pb-6">
            {engagements.map((item) => {
                const getIcon = () => {
                   switch(item.type) {
                       case "VIEW": return <Eye className="h-4 w-4" />
                       case "FAVORITE": return <Heart className="h-4 w-4 text-red-500" />
                       case "CONTACT_DEALER": return <MessageSquare className="h-4 w-4 text-blue-500" />
                       default: return <Clock className="h-4 w-4" />
                   }
                }

                const getDescription = () => {
                     switch(item.type) {
                       case "VIEW": return "Viewed listing"
                       case "FAVORITE": return "Favorited"
                       case "CONTACT_DEALER": return "Contacted dealer about"
                       default: return "Interacted with"
                   }
                }

                return (
                    <div key={item.id} className="relative pl-8">
                        <div className="absolute -left-2.25 top-1 h-4 w-4 rounded-full border bg-background flex items-center justify-center ring-4 ring-background">
                            {/* Dot indicator */}
                             <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-4xl border bg-card/50 hover:bg-card transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-muted">
                                   {getIcon()}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {getDescription()} <Link href={`/cars/${item.car.slug}`} className="text-primary hover:underline">{item.car.year} {item.car.make} {item.car.model}</Link>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      )}
    </div>
  )
}
