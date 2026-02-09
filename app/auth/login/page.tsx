//app/auth/login/page.tsx
//Login page with
//  email/password authentication,
//  client-side validation,
//  error handling with user-friendly messages,
//  links to buyer and dealer signup pages,
//  session creation with NextAuth

"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FormInput } from "@/components/auth/form-input"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      //redirect to home page
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/*header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your AIM-Mombasa account
          </p>
        </div>

        {/*Login Form */}
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={error && !formData.email ? "Email is required" : undefined}
              disabled={isLoading}
            />

            <FormInput
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={error && !formData.password ? "Password is required" : undefined}
              disabled={isLoading}
            />

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/*divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>

          {/*Signup Links */}
          <div className="grid gap-3">
            <Link
              href="/auth/signup/buyer"
              className="rounded-lg border border-border bg-background px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sign up as Buyer
            </Link>
            <Link
              href="/auth/signup/dealer"
              className="rounded-lg border border-border bg-background px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sign up as Dealer
            </Link>
          </div>
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
