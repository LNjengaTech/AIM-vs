"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, Clock, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

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

interface CarToVerify {
    id: string
    make: string
    model: string
    year: number
    price: number
    images: string[]
    dealer: {
        businessName: string
        location: string
    }
    createdAt: string
}

export default function AdminVerificationsPage() {
    const [dealers, setDealers] = useState<DealerToVerify[]>([])
    const [cars, setCars] = useState<CarToVerify[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isProcessing, setIsProcessing] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("dealers")

    useEffect(() => {
        fetchAllPending()
    }, [])

    const fetchAllPending = async () => {
        setIsLoading(true)
        try {
            const [dealersRes, carsRes] = await Promise.all([
                fetch("/api/admin/verify-dealer"),
                fetch("/api/admin/verify-car")
            ])

            if (dealersRes.ok) setDealers(await dealersRes.json())
            if (carsRes.ok) setCars(await carsRes.json())
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyDealer = async (dealerId: string, action: "approve" | "reject") => {
        setIsProcessing(dealerId)
        try {
            const response = await fetch("/api/admin/verify-dealer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dealerId, action }),
            })

            if (!response.ok) throw new Error("Failed to verify dealer")
            setDealers(dealers.filter(d => d.id !== dealerId))
        } catch (error) {
            console.error("Verification error:", error)
            alert("Failed to process verification")
        } finally {
            setIsProcessing(null)
        }
    }

    const handleVerifyCar = async (carId: string, action: "approve" | "reject") => {
        setIsProcessing(carId)
        try {
            const response = await fetch("/api/admin/verify-car", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ carId, action }),
            })

            if (!response.ok) throw new Error("Failed to verify car")
            setCars(cars.filter(c => c.id !== carId))
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

    const filteredCars = cars.filter(
        (car) =>
            car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.dealer.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Verifications</h1>
                    <p className="text-muted-foreground mt-1">
                        Review pending registrations and listings from unverified dealers
                    </p>
                </div>
            </div>

            <Tabs defaultValue="dealers" onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <TabsList className="bg-muted px-2 h-12 rounded-full">
                        <TabsTrigger value="dealers" className="px-2 transition-all data-[state=active]:bg-background data-[state=active]:text-primary-foreground">
                            Dealers ({dealers.length})
                        </TabsTrigger>
                        <TabsTrigger value="cars" className="px-2 transition-all data-[state=active]:bg-background data-[state=active]:text-primary-foreground">
                            Car Listings ({cars.length})
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={activeTab === "dealers" ? "Search dealers..." : "Search cars or dealers..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 rounded-full border-muted-foreground/20"
                        />
                    </div>
                </div>

                <TabsContent value="dealers" className="space-y-6">
                    {isLoading ? (
                        <div className="grid gap-6">
                            {[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-4xl" />)}
                        </div>
                    ) : filteredDealers.length === 0 ? (
                        <EmptyState message={searchTerm ? "No dealers found matching your search." : "No pending dealer verifications."} />
                    ) : (
                        <div className="grid gap-6">
                            {filteredDealers.map((dealer) => (
                                <DealerCard
                                    key={dealer.id}
                                    dealer={dealer}
                                    onVerify={handleVerifyDealer}
                                    isProcessing={isProcessing === dealer.id}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="cars" className="space-y-6">
                    {isLoading ? (
                        <div className="grid gap-6">
                            {[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-4xl" />)}
                        </div>
                    ) : filteredCars.length === 0 ? (
                        <EmptyState message={searchTerm ? "No listings found matching your search." : "No pending car verifications."} />
                    ) : (
                        <div className="grid gap-6">
                            {filteredCars.map((car) => (
                                <CarVerifyCard
                                    key={car.id}
                                    car={car}
                                    onVerify={handleVerifyCar}
                                    isProcessing={isProcessing === car.id}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>All caught up!</CardTitle>
                <CardDescription className="mt-2 text-base">{message}</CardDescription>
            </CardContent>
        </Card>
    )
}

function DealerCard({ dealer, onVerify, isProcessing }: {
    dealer: DealerToVerify,
    onVerify: (id: string, action: "approve" | "reject") => void,
    isProcessing: boolean
}) {
    return (
        <Card className="overflow-hidden transition-all hover:shadow-md border-muted-foreground/10 rounded-4xl">
            <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold">{dealer.businessName}</h3>
                        <div className="flex gap-2">
                            {dealer.isPioneer && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">Pioneer</Badge>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1 font-medium bg-muted/50">
                                <Clock className="h-3 w-3" />
                                Pending
                            </Badge>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Owner</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{dealer.user.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground break-all">{dealer.user.email}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</p>
                            <p className="text-sm font-semibold">{dealer.location}</p>
                            <p className="text-xs text-muted-foreground">{dealer.businessPhone}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Business Permit</p>
                            <p className="text-sm font-semibold">{dealer.permitNumber || "Not provided"}</p>
                            {dealer.permitImageUrl && (
                                <a href={dealer.permitImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1">
                                    View Document <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <CardFooter className="lg:border-l bg-muted/20 lg:w-48 p-6 flex flex-row lg:flex-col gap-3 justify-center">
                    <Button
                        onClick={() => onVerify(dealer.id, "approve")}
                        className="flex-1 lg:w-full bg-primary hover:bg-primary/90 font-bold"
                        disabled={isProcessing}
                    >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                    </Button>
                    <Button
                        onClick={() => onVerify(dealer.id, "reject")}
                        variant="outline"
                        className="flex-1 lg:w-full border-destructive text-destructive hover:bg-destructive/5 font-bold"
                        disabled={isProcessing}
                    >
                        Reject
                    </Button>
                </CardFooter>
            </div>
        </Card>
    )
}

function CarVerifyCard({ car, onVerify, isProcessing }: {
    car: CarToVerify,
    onVerify: (id: string, action: "approve" | "reject") => void,
    isProcessing: boolean
}) {
    return (
        <Card className="overflow-hidden transition-all hover:shadow-md border-muted-foreground/10 rounded-4xl">
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-48 h-48 lg:h-auto relative bg-muted">
                    {car.images[0] ? (
                        <Image
                            src={car.images[0]}
                            alt={car.model}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 192px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold uppercase tracking-tight">{car.year} {car.make} {car.model}</h3>
                        <Badge variant="outline" className="flex items-center gap-1 font-medium bg-muted/50 w-fit">
                            <Clock className="h-3 w-3" />
                            New Listing
                        </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</p>
                            <p className="text-lg font-black text-primary">KES {car.price.toLocaleString()}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dealer</p>
                            <p className="text-sm font-semibold">{car.dealer.businessName}</p>
                            <p className="text-xs text-muted-foreground">{car.dealer.location}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Submitted</p>
                            <p className="text-sm font-semibold">{new Date(car.createdAt).toLocaleDateString()}</p>
                            <Link href={`/cars/${car.id}`} target="_blank" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1">
                                Preview Listing <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                <CardFooter className="lg:border-l bg-muted/20 lg:w-48 p-6 flex flex-row lg:flex-col gap-3 justify-center">
                    <Button
                        onClick={() => onVerify(car.id, "approve")}
                        className="flex-1 lg:w-full bg-primary hover:bg-primary/90 font-bold"
                        disabled={isProcessing}
                    >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                    </Button>
                    <Button
                        onClick={() => onVerify(car.id, "reject")}
                        variant="outline"
                        className="flex-1 lg:w-full border-destructive text-destructive hover:bg-destructive/5 font-bold"
                        disabled={isProcessing}
                    >
                        Reject
                    </Button>
                </CardFooter>
            </div>
        </Card>
    )
}
