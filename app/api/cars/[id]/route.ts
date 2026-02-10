import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { id },
            include: { dealer: true },
        })

        if (!car) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 })
        }

        if (car.dealer.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await prisma.car.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete car error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()

        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { id },
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
                where: { id },
                data: { status: body.status },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update car error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
