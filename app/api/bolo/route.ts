/**
 * app/api/bolo/route.ts
 * API route for BOLO (Be On Look Out) request management.
 * Allows buyers to submit and retrieve their matchmaking requests.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const boloSchema = z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    yearMin: z.number().optional(),
    yearMax: z.number().optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    transmission: z.string().optional(),
    fuelType: z.string().optional(),
    description: z.string().optional(),
})

export async function GET(_req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        // Ensure buyer profile exists
        const buyer = await prisma.buyerProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!buyer) return new NextResponse("Buyer profile not found", { status: 404 })

        const bolos = await prisma.bOLORequest.findMany({
            where: { buyerId: buyer.id },
            orderBy: { createdAt: 'desc' },
            include: {
                matches: {
                    include: {
                        car: {
                            include: { dealer: true }
                        } // Include matched car details
                    }
                }
            }
        })

        return NextResponse.json(bolos)
    } catch (error: unknown) {
        console.error("[BOLO_GET]", error instanceof Error ? error.message : "Unknown error")
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const buyer = await prisma.buyerProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!buyer) return new NextResponse("Buyer profile not found", { status: 404 })

        const body = await req.json()
        const validatedData = boloSchema.parse(body)

        const bolo = await prisma.bOLORequest.create({
            data: {
                buyerId: buyer.id,
                ...validatedData,
                // Ensure numbers are stored correctly if passed as strings? Zod handles types.
                // Prisma expects Decimal for price. We need to handle that.
                priceMin: validatedData.priceMin ? validatedData.priceMin : undefined,
                priceMax: validatedData.priceMax ? validatedData.priceMax : undefined,
                isActive: true
            }
        })

        // Trigger match finding logic (async or simplistic for now)
        // For MVP, we might just store it. Matching logic is complex.

        return NextResponse.json(bolo)
    } catch (error: unknown) {
        console.error("[BOLO_POST]", error instanceof Error ? error.message : "Unknown error")
        return new NextResponse("Internal Error", { status: 500 })
    }
}
