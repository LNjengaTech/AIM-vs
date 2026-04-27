/**
 * components/reviews/reviews-section.tsx
 * Server component that fetches and displays published buyer reviews on public pages.
 * Rendered in a responsive card grid — 3 cols desktop, 2 tablet, 1 mobile.
 */

import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { Star } from "lucide-react"

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "Today"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export async function ReviewsSection() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true, isRemoved: false },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      buyer: {
        include: {
          user: { select: { name: true, image: true } }
        }
      }
    }
  })

  if (reviews.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          What Our Users Say
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Real experiences from buyers and dealers using AIM-Mombasa
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => {
          const name = review.buyer.user.name ?? "AIM User"
          const initial = name[0].toUpperCase()
          const imageUrl = review.buyer.user.image
          const rating = review.rating ?? 0

          return (
            <div
              key={review.id}
              className="rounded-4xl bg-card p-5 shadow-xl flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Header: avatar + name */}
              <div className="flex items-center gap-3">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                    {initial}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(new Date(review.createdAt))}
                  </p>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Review content */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 italic">
                &ldquo;{review.content}&rdquo;
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
