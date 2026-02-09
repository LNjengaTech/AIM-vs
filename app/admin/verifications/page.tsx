// app/admin/verifications/page.tsx
// Admin page for dealer verification (admin only)

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface DealerToVerify {
  id: string
  businessName: string
  businessPhone: string
  businessAddress: string
  location: string
  permitNumber: string | null
  permitImageUrl: string | null
  isPioneer: boolean
  user: {
    name: string | null
    email: string
  }
  createdAt: string
}

export default function AdminVerificationsPage() {
  const router = useRouter()
  const [dealers, setDealers] = useState<DealerToVerify[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPendingDealers()
  }, [])

  const fetchPendingDealers = async () => {
    try {
      //In a real implementation, this would be a separate API route
      //but for now, this is a placeholder
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching dealers:", error)
      setIsLoading(false)
    }
  }

  const handleVerify = async (dealerId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch("/api/admin/verify-dealer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dealerId, action }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify dealer")
      }

      //refresh list
      fetchPendingDealers()
    } catch (error) {
      console.error("Verification error:", error)
      alert("Failed to verify dealer")
    }
  }

  const filteredDealers = dealers.filter(
    (dealer) =>
      dealer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">Admin - Dealer Verifications</h1>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            Back to Home
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by business name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-lg border border-input bg-background px-4 py-2 text-sm"
          />
        </div>

        {/*Dealers List */}
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : filteredDealers.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {dealers.length === 0
                ? "No pending dealer verifications"
                : "No dealers match your search"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDealers.map((dealer) => (
              <div key={dealer.id} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {dealer.businessName}
                      </h3>
                      {dealer.isPioneer && (
                        <Badge variant="success">⭐ Pioneer</Badge>
                      )}
                    </div>

                    <dl className="mt-4 grid gap-2 text-sm">
                      <div className="flex gap-2">
                        <dt className="font-medium text-muted-foreground min-w-32">Owner:</dt>
                        <dd className="text-foreground">{dealer.user.name}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="font-medium text-muted-foreground min-w-32">Email:</dt>
                        <dd className="text-foreground">{dealer.user.email}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="font-medium text-muted-foreground min-w-32">Phone:</dt>
                        <dd className="text-foreground">{dealer.businessPhone}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="font-medium text-muted-foreground min-w-32">Address:</dt>
                        <dd className="text-foreground">{dealer.businessAddress}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="font-medium text-muted-foreground min-w-32">Location:</dt>
                        <dd className="text-foreground">{dealer.location}</dd>
                      </div>
                      {dealer.permitNumber && (
                        <div className="flex gap-2">
                          <dt className="font-medium text-muted-foreground min-w-32">Permit #:</dt>
                          <dd className="text-foreground">{dealer.permitNumber}</dd>
                        </div>
                      )}
                      {dealer.permitImageUrl && (
                        <div className="flex gap-2">
                          <dt className="font-medium text-muted-foreground min-w-32">Permit Doc:</dt>
                          <dd>
                            <a
                              href={dealer.permitImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Document →
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleVerify(dealer.id, "approve")}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(dealer.id, "reject")}
                      className="rounded-lg border border-destructive bg-background px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/*Placeholder Message */}
        <div className="mt-8 rounded-lg bg-blue-500/10 p-4 text-sm text-blue-600 dark:text-blue-400">
          <p className="font-medium">Development Note:</p>
          <p className="mt-1">
            This page requires an admin account. To create an admin user, you'll need to manually update a user's role in the database to "ADMIN".
          </p>
        </div>
      </main>
    </div>
  )
}
