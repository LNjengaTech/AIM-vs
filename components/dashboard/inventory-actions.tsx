"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, MoreHorizontal, Trash, CheckCircle, XCircle } from "lucide-react"

interface InventoryActionsProps {
  carId: string
  currentStatus: string
}

export function InventoryActions({ carId, currentStatus }: InventoryActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const toggleStatus = async () => {
    setIsLoading(true)
    const newStatus = currentStatus === "AVAILABLE" ? "SOLD" : "AVAILABLE"
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) throw new Error("Failed to update status")
      router.refresh()
    } catch (error) {
       console.error(error)
       alert("Error updating status")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCar = async () => {
    if (!confirm("Are you sure you want to delete this listing? in Phase 1 we don't have soft delete yet, so it's permanent.")) return
    
    setIsLoading(true)
    try {
        const res = await fetch(`/api/cars/${carId}`, {
            method: "DELETE",
        })
        
        if (!res.ok) throw new Error("Failed to delete")
        router.refresh()
    } catch (error) {
        console.error(error)
        alert("Error deleting car")
    } finally {
        setIsLoading(false)
    }
  }

  // Simple UI for MVP: Two buttons
  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleStatus} 
        disabled={isLoading}
        className={currentStatus === "AVAILABLE" ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
      >
        {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            currentStatus === "AVAILABLE" ? <span className="text-xs">Mark Sold</span> : <span className="text-xs">Mark Available</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={deleteCar}
        disabled={isLoading}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  )
}
