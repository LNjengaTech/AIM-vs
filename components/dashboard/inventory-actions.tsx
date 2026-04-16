"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Trash, Eye, Edit, MoreVertical } from "lucide-react"
import { toast } from "sonner"
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      toast.error("Error updating status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCar = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Listing deleted successfully")
      setShowDeleteConfirm(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error deleting car. Please try again.")
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
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} disabled={isLoading} className="flex items-center cursor-pointer w-full bg-destructive/10 text-destructive" >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DropdownMenuItem>
          
        </DropdownMenuContent>
      </DropdownMenu>

      {showDeleteConfirm && (
        <div className="absolute top-10 right-0 bg-background border shadow-lg rounded-xl p-3 z-50 w-64 animate-in fade-in zoom-in-95">
          <p className="text-sm font-bold mb-2">Delete this listing permanently?</p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" className="flex-1" onClick={deleteCar} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
