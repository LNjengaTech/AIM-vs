//app/auth/signup/dealer/page.tsx
//Dealer signup page with multi-step business registration

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { FormInput } from "@/components/auth/form-input"
import { uploadToCloudinary } from "@/lib/cloudinary"

export default function DealerSignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    //personal info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    //business info
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    location: "",
    permitNumber: "",
    permitImageUrl: "",
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      const imageUrl = await uploadToCloudinary(file)
      setFormData({ ...formData, permitImageUrl: imageUrl })
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload permit document")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    //Step 1 validation
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }
      setError("")
      setStep(2)
      return
    }

    //Step 2 - final submission
    setIsLoading(true)
    setError("")
    
    
    try {
      const response = await fetch("/api/auth/signup/dealer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessPhone: formData.businessPhone,
          businessAddress: formData.businessAddress,
          location: formData.location,
          permitNumber: formData.permitNumber || undefined,
          permitImageUrl: formData.permitImageUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create account")
        setIsLoading(false)
        return
      }

      //auto-login after successful signup
      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Signup error:", err)
      setError("An error occurred during signup")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/*Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create Dealer Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join AIM-Mombasa and list your verified inventory
          </p>
        </div>

        {/*Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
        </div>

        {/*Signup Form */}
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                
                <FormInput
                  label="Full Name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />

                <FormInput
                  label="Email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />

                <FormInput
                  label="Password"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />

                <FormInput
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                />
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Business Information</h2>
                
                <FormInput
                  label="Business Name"
                  type="text"
                  required
                  placeholder="Your Showroom Name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  disabled={isLoading}
                />

                <FormInput
                  label="Business Phone"
                  type="tel"
                  required
                  placeholder="+254 700 000 000"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  disabled={isLoading}
                />

                <FormInput
                  label="Business Address"
                  type="text"
                  required
                  placeholder="Full street address"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  disabled={isLoading}
                />

                <FormInput
                  label="Location / Area"
                  type="text"
                  required
                  placeholder="e.g., Ganjoni, Nyali, Shimanzi"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={isLoading}
                />

                <FormInput
                  label="Business Permit Number"
                  type="text"
                  placeholder="Optional"
                  value={formData.permitNumber}
                  onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                  disabled={isLoading}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Business Permit Document (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={isLoading || isUploading}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  />
                  {isUploading && (
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  )}
                  {formData.permitImageUrl && (
                    <p className="text-sm text-green-600">✓ Document uploaded</p>
                  )}
                </div>

                <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-600 dark:text-blue-400">
                  <p className="font-medium">Note:</p>
                  <p className="mt-1">Your account will be pending verification by an admin. You'll be notified once approved.</p>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 font-medium transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : step === 1 ? "Continue" : "Create Dealer Account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href="/auth/login"
            className="block rounded-lg border border-border bg-background px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign In
          </Link>
        </div>

        {/* Back to Home */}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
