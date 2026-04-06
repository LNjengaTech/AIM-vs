/**
 * app/api/cars/[slug]/route.ts
 * API route for individual car listing management (Update status, Delete).
 * Identified by unique slug.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params

        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { slug },
            include: { dealer: true },
        })

        if (!car) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 })
        }

        if (car.dealer.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await prisma.car.delete({ where: { slug } })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error("[CAR_DELETE_ERROR]", error instanceof Error ? error.message : "Unknown error")
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params
        const body = await req.json()

        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { slug },
            include: { dealer: true },
        })

        if (!car) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 })
        }

        if (car.dealer.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Update (only allow specific fields for now, e.g. status)
        if (body.status) {
            await prisma.car.update({
                where: { slug },
                data: { status: body.status },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error("[CAR_PATCH_ERROR]", error instanceof Error ? error.message : "Unknown error")
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
