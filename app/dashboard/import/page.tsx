/**
 * app/dashboard/import/page.tsx
 * Server component for the Bulk Import page.
 * Checks for dealer authorization and renders the import client.
 */

import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ImportClient } from "@/components/dashboard/import-client"

export const metadata: Metadata = {
  title: "Bulk Import | AIM-Mombasa",
  description: "Import your car inventory in bulk using CSV files.",
}

export default async function ImportPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "DEALER") {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Import</h1>
        <p className="text-muted-foreground">
          Upload your inventory spreadsheet to add multiple cars at once.
        </p>
      </div>
      <div className="grid gap-8">
        <ImportClient />
      </div>
    </div>
  )
}
