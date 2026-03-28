import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReviewForm } from "@/components/buyer/review-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function NewReviewPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
         <Link href="/buyer" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
         </Link>
         <h1 className="text-3xl font-bold tracking-tight text-center">Write a Review</h1>
         <p className="text-muted-foreground mt-1 text-center">
           We value your feedback. Tell us about your experience.
         </p>
      </div>

      <ReviewForm />
    </div>
  )
}
