/**
 * app/admin/users/[id]/loading.tsx
 * Suspense fallback skeleton for the admin buyer profile page.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminUserProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back nav skeleton */}
      <div className="h-4 w-28 rounded bg-muted" />

      {/* Header skeleton */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-muted flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-3 w-56 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-24 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-0 shadow-xl">
          <CardHeader>
            <div className="h-5 w-36 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-16 rounded-2xl bg-muted" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
