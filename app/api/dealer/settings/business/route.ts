// app/api/dealer/settings/business/route.ts
// PATCH — update dealerProfile fields
// Auth: DEALER session required

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, phoneNumber, location, description } = body

    if (!businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 })
    }
    
    if (description && description.length > 500) {
      return NextResponse.json({ error: "Description must be 500 characters or less" }, { status: 400 })
    }

    await prisma.dealerProfile.update({
      where: { userId: session.user.id },
      data: { businessName, businessPhone: phoneNumber, location, description },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Dealer Business Update Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
