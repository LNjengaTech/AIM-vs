"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteBolo(boloId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  // Ensure the user owns this BOLO before deleting
  await prisma.bOLORequest.delete({
    where: { 
        id: boloId,
        buyer: { userId: session.user.id } 
    },
  })

  revalidatePath("/buyer/bolo") // Refresh the page data
}
