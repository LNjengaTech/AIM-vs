import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const cars = await prisma.car.findMany({
      where: {
        isVerified: true,
        status: "AVAILABLE"
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        price: true,
        slug: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(cars)
  } catch (error) {
    console.error("[ADMIN_CARS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
