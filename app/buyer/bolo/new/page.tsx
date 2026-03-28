import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BOLOForm } from "@/components/buyer/bolo-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function NewBOLOPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
         <Link href="/buyer/bolo" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Requests
         </Link>
         <h1 className="text-3xl font-bold tracking-tight">Create BOLO Request</h1>
         <p className="text-muted-foreground mt-1">
           Fill out the details of the car you are looking for.
         </p>
      </div>

      <BOLOForm />
    </div>
  )
}
