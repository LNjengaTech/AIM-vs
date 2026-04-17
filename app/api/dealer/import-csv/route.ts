/**
 * app/api/dealer/import-csv/route.ts
 * API route for bulk importing car listings from CSV data.
 * Validates data per row and batch inserts into the database.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { carSchema } from "@/lib/validations/car"
import { generateUniqueCarSlug } from "@/lib/utils/slug"
import { calculateCompletenessScore } from "@/lib/utils"

interface ImportRow {
  make: string
  model: string
  year: number
  color: string
  bodyType: string
  transmission: string
  fuelType: string
  mileage: number
  engineCapacity?: string
  price: number
  negotiable: boolean
  condition: string
  description?: string
  features: string[]
}

interface ImportRequest {
  rows: ImportRow[]
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    // Authorization check
    if (!session?.user || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ImportRequest = await req.json()
    const { rows } = body

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Enforce max 50 rows
    if (rows.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 rows allowed per import batch." },
        { status: 400 }
      )
    }

    // Get dealer profile
    const dealerProfile = await prisma.dealerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!dealerProfile) {
      return NextResponse.json(
        { error: "Dealer profile not found" },
        { status: 404 }
      )
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; message: string }>,
    }

    const validRowsToInsert = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // Prepare data for carSchema validation
      // Bulk import specific defaults
      const validationData = {
        ...row,
        images: [],
        isFeatured: false,
        has360View: false,
      }

      const validation = carSchema.safeParse(validationData)

      if (!validation.success) {
        results.skipped++
        const errorMessages = validation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ")
        results.errors.push({
          row: i + 1,
          message: errorMessages,
        })
        continue
      }

      const data = validation.data
      
      // Generate slug and completeness score
      const slug = await generateUniqueCarSlug(data.make, data.model, data.year, prisma)
      const completenessScore = calculateCompletenessScore({
        images: [],
        description: data.description,
        features: data.features,
      })

      validRowsToInsert.push({
        ...data,
        dealerId: dealerProfile.id,
        slug,
        completenessScore,
        status: "AVAILABLE" as const,
        isVerified: false,
      })
    }

    // Batch insert using transaction
    if (validRowsToInsert.length > 0) {
      await prisma.$transaction(
        validRowsToInsert.map((carData) =>
          prisma.car.create({
            data: {
              ...carData,
              price: carData.price, // Prisma handles Decimal conversion for number
            },
          })
        )
      )
      results.imported = validRowsToInsert.length
    }

    console.log(`[CSV_IMPORT] Dealer: ${dealerProfile.id}, Imported: ${results.imported}, Skipped: ${results.skipped}`)

    return NextResponse.json(results)
  } catch (error: unknown) {
    console.error("[CSV_IMPORT_ERROR]", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
