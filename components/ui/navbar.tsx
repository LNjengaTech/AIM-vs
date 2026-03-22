"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { signOutAction } from "@/app/actions/auth"

interface NavItem {
  title: string
  href: string
}

const navItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Listings", href: "/cars" },
  { title: "BOLO", href: "/bolo" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
]

interface NavbarProps {
  user?: {
    email?: string | null
    role?: string
  } | null
  className?: string
}

export function Navbar({ user, className }: NavbarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getRoleLink = () => {
    if (!user) return null
    switch (user.role) {
      case "DEALER":
        return { href: "/dashboard", label: "Dashboard" }
      case "BUYER":
        return { href: "/buyer", label: "Profile" }
      case "ADMIN":
        return { href: "/admin", label: "Admin" }
      default:
        return null
    }
  }

  const roleLink = getRoleLink()

  return (
    <header className={cn("border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50", className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-foreground">
          AIM-Mombasa
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden lg:inline">
                {user.email}
              </span>
              {roleLink && (
                <Link
                  href={roleLink.href}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {roleLink.label}
                </Link>
              )}
              <form action={signOutAction}>
                <button className="rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                Login
              </Link>
              <Link
                href="/auth/signup/buyer"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden rounded-lg p-2 hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-card md:hidden">
          <nav className="container mx-auto flex flex-col space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}

            {/* Mobile Auth Section */}
            <div className="border-t pt-4 mt-4 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                  {roleLink && (
                    <Link
                      href={roleLink.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex w-full rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      {roleLink.label}
                    </Link>
                  )}
                  <form action={signOutAction}>
                    <button className="flex w-full rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup/buyer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
