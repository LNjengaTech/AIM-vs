import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-64 flex-none space-y-4">
            <Skeleton className="h-[400px] w-full rounded-4xl" />
        </div>

        {/* Grid Skeleton */}
        <main className="flex-1">
            <div className="mb-6 space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-32" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[80%]" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
      </div>
    </div>
  )
}
