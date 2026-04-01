"use client"

import { Heart } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  carId: string
  initialIsFavorited?: boolean
  requiresAuth?: boolean
}

export function FavoriteButton({ carId, initialIsFavorited = false, requiresAuth = false }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    if (requiresAuth) {
      // Redirect to login for non-authenticated users or non-buyers
      router.push("/auth/login?redirect=/cars")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ carId })
      })

      if (!response.ok) {
        throw new Error("Failed to toggle favorite")
      }

      const data = await response.json()
      setIsFavorited(data.isFavorited)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      alert("Failed to update favorite. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-4xl border px-4 py-3 text-sm font-medium transition-colors",
        isFavorited
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
          : "border-border bg-background text-foreground hover:bg-accent",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-all",
          isFavorited && "fill-current"
        )}
      />
      {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
    </button>
  )
}
