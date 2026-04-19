"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  Star,
  Search,
  Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface Review {
  id: string
  buyerId: string
  content: string
  rating: number | null
  isPublished: boolean
  isRemoved: boolean
  createdAt: string
  buyer: {
    user: {
      name: string | null
      email: string
      image: string | null
    }
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "published" | "removed">("all")
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/reviews")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setReviews(data)
    } catch (error: unknown) {
      console.error("Error fetching reviews:", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (reviewId: string, action: "publish" | "remove" | "republish") => {
    setIsProcessing(reviewId)
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      })

      if (!response.ok) throw new Error("Failed to process action")

      // Update state locally
      setReviews(reviews.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            isPublished: action === "publish" || action === "republish",
            isRemoved: action === "remove"
          }
        }
        return r
      }))
    } catch (error: unknown) {
      console.error("Action error:", error instanceof Error ? error.message : "Unknown error")
      toast.error("Failed to process review action")
    } finally {
      setIsProcessing(null)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.buyer.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.buyer.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === "all") return matchesSearch
    if (filter === "pending") return matchesSearch && !review.isPublished && !review.isRemoved
    if (filter === "published") return matchesSearch && review.isPublished
    if (filter === "removed") return matchesSearch && review.isRemoved
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground mt-1">
            Moderate user feedback and suggestions
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
           {(["all", "pending", "published", "removed"] as const).map((f) => (
             <Button
               key={f}
               variant={filter === f ? "default" : "outline"}
               size="sm"
               onClick={() => setFilter(f)}
               className="capitalize"
             >
               {f}
             </Button>
           ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
             <Card key={i} className="animate-pulse">
               <div className="h-32 bg-muted rounded-4xl" />
             </Card>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
             <MessageSquare className="h-8 w-8 text-muted-foreground mb-4 opacity-20" />
             <CardTitle>No reviews found</CardTitle>
             <CardDescription className="mt-2">
               {searchTerm || filter !== "all" 
                 ? "No reviews match your filters." 
                 : "No reviews have been submitted yet."}
             </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className={cn(
              "overflow-hidden transition-all",
              review.isRemoved && "opacity-60 grayscale-[0.5]"
            )}>
              <div className="flex flex-col sm:flex-row">
                 <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                             {review.buyer.user.name?.[0] || "U"}
                          </div>
                          <div>
                             <p className="text-sm font-bold">{review.buyer.user.name || "Anonymous User"}</p>
                             <p className="text-xs text-muted-foreground">{review.buyer.user.email}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                          <div className="flex text-yellow-500">
                             {[1, 2, 3, 4, 5].map((s) => (
                               <Star 
                                 key={s} 
                                 className={cn("h-3 w-3", review.rating && s <= review.rating ? "fill-current" : "text-muted/30")} 
                               />
                             ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                             {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                       </div>
                    </div>

                    <div className="bg-muted/30 rounded-4xl p-4 mb-4 italic text-sm text-foreground">
                       "{review.content}"
                    </div>

                    <div className="flex items-center gap-2">
                       {review.isPublished ? (
                          <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100">
                             <CheckCircle className="h-3 w-3 mr-1" /> Published
                          </Badge>
                       ) : review.isRemoved ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                             <XCircle className="h-3 w-3 mr-1" /> Removed
                          </Badge>
                       ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                             <Clock className="h-3 w-3 mr-1" /> Pending Moderation
                          </Badge>
                       )}
                    </div>
                 </div>

                 <div className="flex sm:flex-col items-center justify-center p-6 bg-muted/20 border-t sm:border-t-0 sm:border-l gap-3">
                    {!review.isPublished ? (
                       <Button 
                         size="sm" 
                         className="flex-1 sm:w-full bg-green-600 hover:bg-green-700" 
                         onClick={() => handleAction(review.id, review.isRemoved ? "republish" : "publish")}
                         disabled={isProcessing === review.id}
                       >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {review.isRemoved ? "Republish" : "Publish"}
                       </Button>
                    ) : (
                       <Button
                         size="sm"
                         variant="outline"
                         className="flex-1 sm:w-full border-destructive text-destructive hover:bg-destructive/10"
                         onClick={() => handleAction(review.id, "remove")}
                         disabled={isProcessing === review.id}
                       >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                       </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:w-full"
                      asChild
                    >
                       <Link href={`/admin/users/${review.buyerId}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Profile
                       </Link>
                    </Button>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
