//app/loading.tsx
//global loading fallback(Suspense skeleton) displayed during data fetch/navigation

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-lg font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
