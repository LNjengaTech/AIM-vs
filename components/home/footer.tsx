// components/home/footer.tsx
// Site-wide footer for public pages (homepage, about, contact, privacy).
// Not used inside dashboard or admin layouts — those have their own footers.

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Column 1 — Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
              AIM-Mombasa
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Verified cars. Real-time inventory. Mombasa's modern car marketplace.
            </p>
          </div>

          {/* Column 2 — Marketplace */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Marketplace</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/cars" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/buyer/bolo" className="text-muted-foreground hover:text-primary transition-colors">
                  BOLO Alerts
                </Link>
              </li>
              <li>
                <Link href="/cars?filter=verified" className="text-muted-foreground hover:text-primary transition-colors">
                  Verified Dealers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — For Dealers */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">For Dealers</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/auth/signup/dealer" className="text-muted-foreground hover:text-primary transition-colors">
                  Dealer Signup
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Dealer Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dealer Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © 2026 AIM-Mombasa. A TUM Research Project by Lonnex Njenga.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Toggle Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
