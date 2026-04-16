// app/dashboard/inventory/[id]/edit/loading.tsx
// Suspense fallback for the edit car page while data fetches

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading car details...</p>
    </div>
  )
}
