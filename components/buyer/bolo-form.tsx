"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2 } from "lucide-react"
import { z } from "zod"
import Link from "next/link"

const boloSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  priceMin: z.number().min(0, "Price must be positive").optional().or(z.nan().transform(() => undefined)),
  priceMax: z.number().min(0, "Price must be positive").optional().or(z.nan().transform(() => undefined)),
  yearMin: z.number().min(1900, "Invalid min year").max(new Date().getFullYear() + 1).optional().or(z.nan().transform(() => undefined)),
  yearMax: z.number().min(1900, "Invalid max year").max(new Date().getFullYear() + 1).optional().or(z.nan().transform(() => undefined)),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  description: z.string().optional(),
}).refine(data => {
  if (data.priceMin && data.priceMax && data.priceMin > data.priceMax) return false;
  return true;
}, { message: "Min price cannot be > max price", path: ["priceMax"] })
.refine(data => {
  if (data.yearMin && data.yearMax && data.yearMin > data.yearMax) return false;
  return true;
}, { message: "Min year cannot be > max year", path: ["yearMax"] })
.refine(data => {
  return data.make || data.model || data.priceMax || data.priceMin || data.yearMax || data.yearMin;
}, { message: "Please provide at least one search criteria (make, model, year, or price).", path: ["make"] });

type ValidationErrors = Partial<Record<keyof z.infer<typeof boloSchema>, string>>

export function BOLOForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const rawData = {
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

    const validation = boloSchema.safeParse(rawData)

    if (!validation.success) {
      const formattedErrors: ValidationErrors = {}
      validation.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof ValidationErrors
        if (path) formattedErrors[path] = issue.message
      })
      setErrors(formattedErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/bolo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      })

      if (!response.ok) throw new Error("Failed to create BOLO request")

      setIsSuccess(true)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl bg-card p-12 rounded-4xl border shadow-sm text-center flex flex-col items-center animate-in fade-in zoom-in-95">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Alert Set!</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          We&apos;ll notify you the moment a matching car is listed on the platform.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {
            setIsSuccess(false)
            setErrors({})
          }}>Create Another</Button>
          <Link href="/buyer/bolo">
            <Button>View My Requests</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-card p-6 rounded-4xl border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" placeholder="e.g. Toyota" />
          {errors.make && <p className="text-sm text-destructive">{errors.make}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" placeholder="e.g. Axio" />
          {errors.model && <p className="text-sm text-destructive">{errors.model}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceMin">Min Price (KES)</Label>
          <Input id="priceMin" name="priceMin" type="number" placeholder="0" />
          {errors.priceMin && <p className="text-sm text-destructive">{errors.priceMin}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceMax">Max Price (KES)</Label>
          <Input id="priceMax" name="priceMax" type="number" placeholder="1500000" />
          {errors.priceMax && <p className="text-sm text-destructive">{errors.priceMax}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearMin">Min Year</Label>
          <Input id="yearMin" name="yearMin" type="number" placeholder="2015" />
          {errors.yearMin && <p className="text-sm text-destructive">{errors.yearMin}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearMax">Max Year</Label>
          <Input id="yearMax" name="yearMax" type="number" placeholder="2024" />
          {errors.yearMax && <p className="text-sm text-destructive">{errors.yearMax}</p>}
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
            {errors.transmission && <p className="text-sm text-destructive">{errors.transmission}</p>}
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
            {errors.fuelType && <p className="text-sm text-destructive">{errors.fuelType}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Additional Details</Label>
        <Textarea 
            id="description" 
            name="description" 
            placeholder="e.g. Prefer white color, sunroof is a plus..." 
            className="min-h-25"
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create BOLO Request
      </Button>
    </form>
  )
}
