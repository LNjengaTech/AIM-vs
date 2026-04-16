// app/dashboard/inventory/[id]/edit/error.tsx
// Error boundary for the edit car page

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Edit Car Error:", error)
  }, [error])

  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Something went wrong!</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We couldn't load the car details. Please try again or return to your inventory.
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Link href="/dashboard/inventory">
          <Button variant="outline">Back to Inventory</Button>
        </Link>
      </div>
    </div>
  )
}
