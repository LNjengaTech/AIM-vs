import { Skeleton } from "@/components/ui/skeleton"

export default function BOLOLoading() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-full max-w-sm" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="w-full">
        {/* Tabs Skeleton */}
        <div className="flex space-x-1 p-1 bg-muted rounded-lg w-max mb-4">
          <Skeleton className="h-8 w-36 rounded-md" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-4xl border bg-card p-4 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-64" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-40 mt-4" />
                </div>

                <div className="flex flex-col gap-3 min-w-36 pt-2">
                  <Skeleton className="h-5 w-24" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
