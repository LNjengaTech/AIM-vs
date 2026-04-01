"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Trash, Eye, Edit, MoreVertical } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InventoryActionsProps {
  carId: string
  carSlug: string
  currentStatus: string
}

export function InventoryActions({ carId, carSlug, currentStatus }: InventoryActionsProps) {
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center justify-center rounded-3xl text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/cars/${carSlug}`} className="flex items-center cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Listing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/inventory/${carId}/edit`} className="flex items-center cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Car
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button variant="ghost" onClick={deleteCar} disabled={isLoading} className="flex items-center cursor-pointer w-full bg-destructive/10 text-destructive" >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DropdownMenuItem>
          
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
