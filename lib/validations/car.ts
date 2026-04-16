import { z } from "zod"

export const carSchema = z.object({
    // Step 1: Basic Info
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.preprocess((val) => (val === "" || val === null ? undefined : Number(val)), z.number().min(1900).max(new Date().getFullYear() + 1)),
    price: z.preprocess((val) => (val === "" || val === null ? undefined : Number(val)), z.number().min(1, "Price is required")),
    mileage: z.preprocess((val) => (val === "" || val === null ? undefined : Number(val)), z.number().min(0, "Mileage must be non-negative")),
    condition: z.string().min(1, "Condition is required"),
    description: z.string().optional(),

    // Step 2: Specs
    bodyType: z.string().min(1, "Body type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    color: z.string().min(1, "Color is required"),
    engineCapacity: z.string().optional(),
    features: z.array(z.string()),
    images: z.array(z.string()),

    // Internal
    isFeatured: z.boolean(),
    negotiable: z.boolean(),
    has360View: z.boolean().default(false),
})

export type CarFormValues = z.infer<typeof carSchema>
