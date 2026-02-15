//app/error.tsx
//global error boundary - Catches render errors when something crashes

"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    //log the error to error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-destructive"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Something went wrong!</h2>
        <p className="mb-6 text-muted-foreground">
          We encountered an unexpected error. Please try again.
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-muted-foreground">Error ID: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
