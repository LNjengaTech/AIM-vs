"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, XCircle, Clock, ExternalLink, User } from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DealerToVerify {
  id: string
  businessName: string
  businessPhone: string
  businessAddress: string
  location: string
  permitNumber: string | null
  permitImageUrl: string | null
  isPioneer: boolean
  createdAt: string
  user: {
    name: string | null
    email: string
    image: string | null
  }
}

export default function AdminVerificationsPage() {
  const [dealers, setDealers] = useState<DealerToVerify[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingDealers()
  }, [])

  const fetchPendingDealers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/verify-dealer")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setDealers(data)
    } catch (error) {
      console.error("Error fetching dealers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (dealerId: string, action: "approve" | "reject") => {
    setIsProcessing(dealerId)
    try {
      const response = await fetch("/api/admin/verify-dealer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId, action }),
      })

      if (!response.ok) throw new Error("Failed to verify dealer")

      // Optimistic update: remove from list
      setDealers(dealers.filter(d => d.id !== dealerId))
    } catch (error) {
      console.error("Verification error:", error)
      alert("Failed to process verification")
    } finally {
      setIsProcessing(null)
    }
  }

  const filteredDealers = dealers.filter(
    (dealer) =>
      dealer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dealer Verifications</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending dealer registrations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Clock className="h-4 w-4" />
          <span>{dealers.length} Pending requests</span>
        </div>
      </div>

      <div className="flex items-center max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dealers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-4xl" />
            </Card>
          ))}
        </div>
      ) : filteredDealers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
               <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>All caught up!</CardTitle>
            <CardDescription className="mt-2 text-base">
              {searchTerm ? "No dealers found matching your search." : "No pending verifications at the moment."}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredDealers.map((dealer) => (
            <Card key={dealer.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold">{dealer.businessName}</h3>
                    <div className="flex gap-2">
                       {dealer.isPioneer && (
                         <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pioneer</Badge>
                       )}
                       <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                       </Badge>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner Information</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{dealer.user.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground break-all">{dealer.user.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                       <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Detail</p>
                       <p className="text-sm font-medium">{dealer.businessPhone}</p>
                       <p className="text-xs text-muted-foreground">{dealer.location}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Permit</p>
                      <p className="text-sm font-medium">{dealer.permitNumber || "Not provided"}</p>
                      {dealer.permitImageUrl ? (
                        <a 
                          href={dealer.permitImageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          View Permit <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">No document uploaded</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Applied on {new Date(dealer.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{dealer.businessAddress}</span>
                  </div>
                </div>

                <CardFooter className="lg:border-l bg-muted/30 lg:w-48 p-6 flex flex-row lg:flex-col gap-3 justify-center">
                  <Button 
                    onClick={() => handleVerify(dealer.id, "approve")}
                    className="flex-1 lg:w-full bg-green-600 hover:bg-green-700"
                    disabled={isProcessing === dealer.id}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleVerify(dealer.id, "reject")}
                    variant="outline"
                    className="flex-1 lg:w-full border-destructive text-destructive hover:bg-destructive/10"
                    disabled={isProcessing === dealer.id}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
