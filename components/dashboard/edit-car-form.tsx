// components/dashboard/edit-car-form.tsx
// Single-page form to edit an existing car listing.
// Pre-populated with existing car data.

"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Car } from "@prisma/client"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/dashboard/image-upload"

import { carSchema, type CarFormValues } from "@/lib/validations/car"

interface EditCarFormProps {
  car: Omit<Car, "price" | "createdAt" | "updatedAt" | "soldAt"> & {
    price: number
    createdAt: string
    updatedAt: string
    soldAt: string | null
  }
}

export function EditCarForm({ car }: EditCarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with existing car data
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema) as any,
    defaultValues: {
      make: car.make,
      model: car.model,
      year: car.year,
      price: Number(car.price),
      mileage: car.mileage || 0,
      condition: car.condition,
      description: car.description || "",
      bodyType: car.bodyType || "",
      transmission: car.transmission || "",
      fuelType: car.fuelType || "",
      color: car.color || "",
      engineCapacity: car.engineCapacity || "",
      features: car.features || [],
      images: car.images || [],
      isFeatured: car.isFeatured,
      negotiable: car.negotiable,
      has360View: car.has360View,
    },
  })

  // Watch images to update has360View
  const images = form.watch("images")

  // Sync has360View reactively when images change
  useEffect(() => {
    const currentHas360View = (images?.length || 0) >= 24
    if (currentHas360View !== form.getValues("has360View")) {
      form.setValue("has360View", currentHas360View, { shouldValidate: true })
    }
  }, [images, form])

  async function onSubmit(data: CarFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/cars/${car.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update car")
      }

      await response.json()
      
      toast.success("Listing updated successfully!")
      router.push("/dashboard/inventory")
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      const message = error instanceof Error ? error.message : "Something went wrong"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Images Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vehicle Images</h2>
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photos</FormLabel>
                <FormDescription>
                    Upload clear photos of the car.
                    {images.length < 24 && (
                        <span className="text-amber-600 block mt-1">
                            Upload at least 24 images to automatically enable the 360° interactive view! ({images.length}/24)
                        </span>
                    )}
                    {images.length >= 24 && (
                        <span className="text-green-600 block mt-1 font-medium">
                            360° view is enabled! You have {images.length} images.
                        </span>
                    )}
                </FormDescription>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(urls) => field.onChange(urls)}
                    onRemove={(url) => field.onChange(field.value.filter((val) => val !== url))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Details</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Harrier" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Locally Used">Locally Used</SelectItem>
                            <SelectItem value="Foreign Used">Foreign Used</SelectItem>
                            <SelectItem value="Brand New">Brand New</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price (KES)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mileage (km)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            {/* Specifications Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Specifications</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="bodyType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Body Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="SUV">SUV</SelectItem>
                                <SelectItem value="Saloon">Saloon</SelectItem>
                                <SelectItem value="Hatchback">Hatchback</SelectItem>
                                <SelectItem value="Station Wagon">Station Wagon</SelectItem>
                                <SelectItem value="Pickup">Pickup</SelectItem>
                                <SelectItem value="Van">Van</SelectItem>
                                <SelectItem value="Truck">Truck</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="transmission"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Transmission</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select trans" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Automatic">Automatic</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                                <SelectItem value="CVT">CVT</SelectItem>
                                <SelectItem value="Semi-Auto">Semi-Auto</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fuelType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Fuel Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select fuel" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Pearl White" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="engineCapacity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Engine Capacity (CC)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. 2000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Description</h2>
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Textarea 
                            placeholder="Add any additional details, history, or selling points about the vehicle..." 
                            className="min-h-[150px]"
                            {...field} 
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        {/* Options Section */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-2xl bg-muted/20">
                <FormField
                    control={form.control}
                    name="negotiable"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Price Negotiable</FormLabel>
                            <FormDescription>
                            Allow buyers to negotiate the price
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Feature Listing</FormLabel>
                            <FormDescription>
                            Highlight this car on your profile
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
