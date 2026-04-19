/**
 * app/admin/users/[id]/page.tsx
 * Admin page to view a buyer's profile — their reviews, BOLO requests, and favourited cars.
 * Accessed from the Admin Reviews page via the "Profile" button on each review card.
 */

import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Star, Shield, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminUserProfilePage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    notFound()
  }

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      buyerProfile: {
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 5
          },
          boloRequests: {
            orderBy: { createdAt: "desc" },
            take: 5
          },
          favorites: {
            take: 5,
            include: {
              car: { select: { make: true, model: true, year: true, slug: true } }
            }
          }
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })

  const buyer = user.buyerProfile

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/admin/reviews"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reviews
      </Link>

      {/* User header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
          {user.name?.[0]?.toUpperCase() ?? <User className="h-6 w-6" />}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.name ?? "Unknown User"}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="capitalize">{user.role.toLowerCase()}</Badge>
            <Badge variant="outline" className="text-xs">Joined {joinDate}</Badge>
          </div>
        </div>
      </div>

      {!buyer ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            This user has no buyer profile.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Reviews */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {buyer.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews submitted.</p>
              ) : (
                <div className="space-y-3">
                  {buyer.reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border bg-muted/30 p-4 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                review.rating && s <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {review.isPublished && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Published</Badge>
                          )}
                          {review.isRemoved && (
                            <Badge variant="destructive" className="text-xs">Removed</Badge>
                          )}
                          {!review.isPublished && !review.isRemoved && (
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic line-clamp-3">
                        &ldquo;{review.content}&rdquo;
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* BOLO Requests */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Recent BOLO Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {buyer.boloRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No BOLO requests submitted.</p>
              ) : (
                <div className="space-y-2">
                  {buyer.boloRequests.map((bolo) => (
                    <div key={bolo.id} className="rounded-2xl border bg-muted/30 p-3 text-sm">
                      <p className="font-medium text-foreground">
                        {bolo.yearMin ?? bolo.yearMax
                          ? `${bolo.yearMin ?? ""} – ${bolo.yearMax ?? ""}`
                          : "Any year"}{" "}
                        {bolo.make} {bolo.model}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Budget: KES {bolo.priceMin?.toLocaleString() ?? "—"} – {bolo.priceMax?.toLocaleString() ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {new Date(bolo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favourites */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Recent Favourites</CardTitle>
            </CardHeader>
            <CardContent>
              {buyer.favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favourited cars.</p>
              ) : (
                <div className="space-y-2">
                  {buyer.favorites.map((fav) => (
                    <div key={fav.id} className="flex items-center justify-between rounded-2xl border bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground">
                        {fav.car.year} {fav.car.make} {fav.car.model}
                      </p>
                      <Link
                        href={`/cars/${fav.car.slug}`}
                        className="text-xs text-primary hover:underline"
                        target="_blank"
                      >
                        View listing
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
