/**
 * components/dashboard/add-car-form.tsx
 * Multi-step form for dealers to add new car listings.
 * Includes validation, image upload, and progress tracking.
 */

"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { carSchema, type CarFormValues } from "@/lib/validations/car"
import { FormInput } from "@/components/auth/form-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/dashboard/image-upload"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Step {
    id: number
    name: string
    fields: (keyof CarFormValues)[]
}

const steps: Step[] = [
    { id: 0, name: "Details", fields: ["make", "model", "year", "price", "mileage", "condition"] },
    { id: 1, name: "Specs", fields: ["bodyType", "transmission", "fuelType", "color", "engineCapacity", "description"] },
    { id: 2, name: "Media", fields: ["images", "negotiable"] },
]

export function AddCarForm() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<CarFormValues>({
        resolver: zodResolver(carSchema) as any,
        defaultValues: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            price: 0,
            mileage: 0,
            condition: "used",
            features: [],
            images: [],
            negotiable: true,
            isFeatured: false,
            description: "",
            engineCapacity: "",
            color: "",
            bodyType: "",
            transmission: "",
            fuelType: ""
        },
        mode: "onChange",
    })

    const { register, trigger, handleSubmit, formState: { errors } } = form

    const nextStep = async () => {
        const currentFields = steps[currentStep].fields
        const isValid = await trigger(currentFields)
        if (isValid) {
            setCurrentStep((prev) => prev + 1)
            setError(null)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const onSubmit = async (data: CarFormValues) => {
        // Only submit on the final step
        if (currentStep !== steps.length - 1) {
            return;
        }

        setIsSubmitting(true)
        setError(null)
        try {
            const response = await fetch("/api/cars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || "Failed to create listing")
            }

            // Success
            router.refresh()
            router.push("/dashboard/inventory")
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong. Please try again."
            console.error("[ADD_CAR_ERROR]", message)
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between px-4">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > index
                    const isCurrent = currentStep === index
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                    isCurrent ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span>{index + 1}</span>}
                            </div>
                            <span className={cn(
                                "text-xs font-medium",
                                isCurrent ? "text-foreground" : "text-muted-foreground"
                            )}>{step.name}</span>
                        </div>
                    )
                })}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-4xl border bg-card p-6 shadow-sm">

                {/* Step 1: Basic Details */}
                {currentStep === 0 && (
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormInput
                            label="Make (Brand)"
                            placeholder="e.g. Toyota, Mazda"
                            error={errors.make?.message}
                            required
                            {...register("make")}
                        />
                        <FormInput
                            label="Model"
                            placeholder="e.g. Harrier, Demio"
                            error={errors.model?.message}
                            required
                            {...register("model")}
                        />
                        <FormInput
                            label="Year"
                            type="number"
                            placeholder="YYYY"
                            error={errors.year?.message}
                            required
                            {...register("year", { valueAsNumber: true })}
                        />
                        <FormInput
                            label="Price (KES)"
                            type="number"
                            placeholder="0"
                            error={errors.price?.message}
                            required
                            {...register("price", { valueAsNumber: true })}
                        />
                        <FormInput
                            label="Mileage (km)"
                            type="number"
                            placeholder="0"
                            error={errors.mileage?.message}
                            required
                            {...register("mileage", { valueAsNumber: true })}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Condition</label>
                            <select
                                {...register("condition")}
                                className="flex h-11 w-full rounded-4xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="used">Used / Second Hand</option>
                                <option value="new">Brand New</option>
                                <option value="foreign">Foreign Used / Import</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 2: Specs */}
                {currentStep === 1 && (
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Body Type</label>
                            <select
                                {...register("bodyType")}
                                className="flex h-11 w-full rounded-4xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Select Body Type</option>
                                <option value="suv">SUV</option>
                                <option value="sedan">Sedan</option>
                                <option value="hatchback">Hatchback</option>
                                <option value="station_wagon">Station Wagon</option>
                                <option value="pickup">Pickup / Truck</option>
                                <option value="van">Van / Bus</option>
                            </select>
                            {errors.bodyType && <p className="text-sm text-destructive">{errors.bodyType.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Transmission</label>
                            <select
                                {...register("transmission")}
                                className="flex h-11 w-full rounded-4xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Select Transmission</option>
                                <option value="automatic">Automatic</option>
                                <option value="manual">Manual</option>
                                <option value="cvt">CVT</option>
                            </select>
                            {errors.transmission && <p className="text-sm text-destructive">{errors.transmission.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fuel Type</label>
                            <select
                                {...register("fuelType")}
                                className="flex h-11 w-full rounded-4xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Select Fuel</option>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="electric">Electric</option>
                            </select>
                            {errors.fuelType && <p className="text-sm text-destructive">{errors.fuelType.message}</p>}
                        </div>

                        <FormInput
                            label="Color"
                            placeholder="e.g. Pearl White"
                            error={errors.color?.message}
                            required
                            {...register("color")}
                        />
                        <FormInput
                            label="Engine Capacity"
                            placeholder="e.g. 1500cc"
                            {...register("engineCapacity")}
                        />
                        
                        {/* Features Input */}
                        <div className="col-span-2 space-y-4">
                            <label className="text-sm font-medium">Features</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.watch("features")?.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                                        <span>{feature}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const current = form.getValues("features");
                                                form.setValue("features", current.filter((_, i) => i !== index));
                                            }}
                                            className="hover:text-destructive transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    id="new-feature"
                                    placeholder="Add a feature (e.g. Sunroof, Leather Seats)..."
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const input = e.currentTarget;
                                            const val = input.value.trim();
                                            if (val) {
                                                const current = form.getValues("features") || [];
                                                if (!current.includes(val)) {
                                                    form.setValue("features", [...current, val]);
                                                }
                                                input.value = "";
                                            }
                                        }
                                    }}
                                    className="rounded-4xl"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => {
                                        const input = document.getElementById("new-feature") as HTMLInputElement;
                                        const val = input.value.trim();
                                        if (val) {
                                            const current = form.getValues("features") || [];
                                            if (!current.includes(val)) {
                                                form.setValue("features", [...current, val]);
                                            }
                                            input.value = "";
                                        }
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <p className="text-[10px] text-muted-foreground w-full">Quick Add:</p>
                                {["Sunroof", "Leather Seats", "Android Auto", "Apple CarPlay", "Rear Camera", "Turbo", "Hybrid"].map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => {
                                            const current = form.getValues("features") || [];
                                            if (!current.includes(f)) {
                                                form.setValue("features", [...current, f]);
                                            }
                                        }}
                                        className="text-[10px] bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
                                    >
                                        + {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <textarea
                                {...register("description")}
                                className="flex min-h-25 w-full rounded-4xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Describe the car's condition, history, or key selling points..."
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Media */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Upload Photos</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload high-quality photos of the car. Add at least 5 photos for a better completeness score.
                            </p>

                            <Controller
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <ImageUpload
                                        value={field.value}
                                        onChange={(urls) => field.onChange(urls)}
                                        onRemove={(url) => field.onChange(field.value.filter((current) => current !== url))}
                                    />
                                )}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-4">
                            <input
                                type="checkbox"
                                id="negotiable"
                                {...register("negotiable")}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="negotiable" className="text-sm font-medium">Price is Negotiable</label>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                        <Badge variant="destructive" className="w-full py-3 px-4 rounded-xl flex items-center gap-3">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-bold">{error}</span>
                        </Badge>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0 || isSubmitting}
                        className="rounded-4xl px-8"
                    >
                        Back
                    </Button>

                    {currentStep < steps.length - 1 ? (
                        <Button type="button" key="next-button" onClick={nextStep} className="rounded-4xl px-8">
                            Next Step
                        </Button>
                    ) : (
                        <Button type="submit" key="submit-button" disabled={isSubmitting} className="rounded-4xl px-8 min-w-35">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : "Publish Listing"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
