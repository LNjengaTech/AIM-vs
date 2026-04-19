/**
 * app/api/cars/[slug]/route.ts
 * API route for individual car listing management (Update status, Delete, Edit).
 * Identified by unique slug. Ownership verified via dealerProfile lookup.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateCompletenessScore } from "@/lib/utils"
import { generateUniqueCarSlug } from "@/lib/utils/slug"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    // Resolve dealer profile from session (prevents stale session issues)
    const dealer = await prisma.dealerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })
    if (!dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    // Find car by slug
    const car = await prisma.car.findUnique({
      where: { slug },
      select: { id: true, dealerId: true }
    })
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 })
    }
    if (car.dealerId !== dealer.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.car.delete({ where: { id: car.id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[CAR_DELETE]", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const body: unknown = await req.json()

    // Resolve dealer profile from session
    const dealer = await prisma.dealerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })
    if (!dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    // Find car by slug
    const car = await prisma.car.findUnique({
      where: { slug },
      select: { id: true, dealerId: true, make: true, model: true, year: true }
    })
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 })
    }
    if (car.dealerId !== dealer.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // --- Status-only update (from inventory list: Mark Sold / Mark Available) ---
    // Accepts both { status: "SOLD" | "AVAILABLE" } and { action: "markSold" | "markAvailable" }
    let newStatus: "SOLD" | "AVAILABLE" | undefined

    if ("status" in body && (body.status === "SOLD" || body.status === "AVAILABLE")) {
      newStatus = body.status as "SOLD" | "AVAILABLE"
    } else if ("action" in body) {
      if (body.action === "markSold") newStatus = "SOLD"
      if (body.action === "markAvailable") newStatus = "AVAILABLE"
    }

    if (newStatus) {
      const updated = await prisma.car.update({
        where: { id: car.id },
        data: {
          status: newStatus,
          soldAt: newStatus === "SOLD" ? new Date() : null,
        },
        select: { id: true, status: true, slug: true }
      })
      return NextResponse.json(updated)
    }

    // --- Full edit update (from Edit Car form) ---
    const {
      make,
      model,
      year,
      price,
      mileage,
      condition,
      description,
      bodyType,
      transmission,
      fuelType,
      color,
      engineCapacity,
      features,
      images,
      isFeatured,
      negotiable,
    } = body as Record<string, unknown>

    // Calculate completeness score
    const imageArr = Array.isArray(images) ? images : []
    const has360View = imageArr.length >= 24
    const completenessScore = calculateCompletenessScore({
      images: imageArr,
      description: typeof description === "string" ? description : "",
      has360View,
      features: Array.isArray(features) ? features : [],
    })

    // Regenerate slug only if make/model/year changed
    let newSlug = slug
    if (
      (make && make !== car.make) ||
      (model && model !== car.model) ||
      (year && year !== car.year)
    ) {
      newSlug = await generateUniqueCarSlug(
        typeof make === "string" ? make : car.make,
        typeof model === "string" ? model : car.model,
        typeof year === "number" ? year : car.year,
        prisma
      )
    }

    const updatedCar = await prisma.car.update({
      where: { id: car.id },
      data: {
        make: typeof make === "string" ? make : undefined,
        model: typeof model === "string" ? model : undefined,
        year: typeof year === "number" ? year : undefined,
        price: typeof price === "number" ? price : undefined,
        mileage: typeof mileage === "number" ? mileage : undefined,
        condition: typeof condition === "string" ? condition : undefined,
        description: typeof description === "string" ? description : undefined,
        bodyType: typeof bodyType === "string" ? bodyType : undefined,
        transmission: typeof transmission === "string" ? transmission : undefined,
        fuelType: typeof fuelType === "string" ? fuelType : undefined,
        color: typeof color === "string" ? color : undefined,
        engineCapacity: typeof engineCapacity === "string" ? engineCapacity : undefined,
        features: Array.isArray(features) ? features : undefined,
        images: imageArr.length > 0 ? imageArr : undefined,
        isFeatured: typeof isFeatured === "boolean" ? isFeatured : undefined,
        negotiable: typeof negotiable === "boolean" ? negotiable : undefined,
        has360View,
        completenessScore,
        slug: newSlug,
      },
    })

    return NextResponse.json(updatedCar)
  } catch (error: unknown) {
    console.error("[CAR_PATCH]", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 })
  }
}
