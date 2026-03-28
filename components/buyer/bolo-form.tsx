"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export function BOLOForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      make: formData.get("make")?.toString() || undefined,
      model: formData.get("model")?.toString() || undefined,
      priceMin: formData.get("priceMin") ? Number(formData.get("priceMin")) : undefined,
      priceMax: formData.get("priceMax") ? Number(formData.get("priceMax")) : undefined,
      yearMin: formData.get("yearMin") ? Number(formData.get("yearMin")) : undefined,
      yearMax: formData.get("yearMax") ? Number(formData.get("yearMax")) : undefined,
      transmission: formData.get("transmission")?.toString() || undefined,
      fuelType: formData.get("fuelType")?.toString() || undefined,
      description: formData.get("description")?.toString() || undefined,
    }

    try {
      const response = await fetch("/api/bolo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create BOLO request")

      router.push("/buyer/bolo")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-card p-6 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" placeholder="e.g. Toyota" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" placeholder="e.g. Axio" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceMin">Min Price (KES)</Label>
          <Input id="priceMin" name="priceMin" type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceMax">Max Price (KES)</Label>
          <Input id="priceMax" name="priceMax" type="number" placeholder="1500000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearMin">Min Year</Label>
          <Input id="yearMin" name="yearMin" type="number" placeholder="2015" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearMax">Max Year</Label>
          <Input id="yearMax" name="yearMax" type="number" placeholder="2024" />
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Select name="transmission">
                <SelectTrigger>
                    <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel Type</Label>
            <Select name="fuelType">
                <SelectTrigger>
                    <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Additional Details</Label>
        <Textarea 
            id="description" 
            name="description" 
            placeholder="e.g. Prefer white color, sunroof is a plus..." 
            className="min-h-[100px]"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create BOLO Request
      </Button>
    </form>
  )
}
