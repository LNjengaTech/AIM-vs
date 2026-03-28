"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function ReviewForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      content: formData.get("content")?.toString(),
      rating: rating,
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to submit review")

      // Could show success message here or redirect
      // For now redirect back to dashboard or show success state
      alert("Review submitted successfully! It will be visible after moderation.")
      router.push("/buyer") 
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-lg mx-auto bg-card p-6 rounded-lg border shadow-sm">
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-yellow-400 transition-transform active:scale-95"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star 
                className={cn(
                  "h-8 w-8", 
                  (hoveredRating ? star <= hoveredRating : star <= rating) ? "fill-current" : "fill-transparent text-muted-foreground/30"
                )} 
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
           {rating === 5 ? "Excellent" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Poor" : "Terrible"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Your Feedback</Label>
        <Textarea 
          id="content" 
          name="content" 
          placeholder="Share your experience with AIM-Mombasa..." 
          className="min-h-[120px]"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Review
      </Button>
    </form>
  )
}
