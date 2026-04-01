//app/auth/signup/buyer/page.tsx
//Buyer signup page with registration form

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { FormInput } from "@/components/auth/form-input"

export default function BuyerSignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    //client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    //make POST request to /api/auth/signup/buyer with the form data from the form fields
    try {
      const response = await fetch("/api/auth/signup/buyer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          location: formData.location || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create account")
        setIsLoading(false)
        return
      }

      //if successful, auto-log in the user using NextAuth's signIn() with credentials
      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      //Redirect to marketplace
      router.push("/")
      router.refresh()   //Call router.refresh() to update server components
    } catch (err) {
      console.error("Signup error:", err)
      setError("An error occurred during signup")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/*Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create Buyer Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start browsing verified cars in Mombasa
          </p>
        </div>

        {/*Signup Form */}
        <div className="rounded-4xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <FormInput
              label="Phone Number"
              type="tel"
              placeholder="+254 700 000 000 (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isLoading}
            />

            <FormInput
              label="Location"
              type="text"
              placeholder="e.g., Nyali, Mombasa (optional)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={isLoading}
            />

            {error && (
              <div className="rounded-4xl bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-4xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Buyer Account"}
            </button>
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
            className="block rounded-4xl border border-border bg-background px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
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
