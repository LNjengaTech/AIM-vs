// app/api/dealer/settings/account/route.ts
// DELETE — delete dealer account and all associated data
// Auth: DEALER session required

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Cascade: Prisma onDelete: Cascade handles Car, DealerProfile, Engagement etc.
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Dealer Account Deletion Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
