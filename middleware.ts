//middleware.ts
//Edge middleware for route protection based on authentication status and user roles
// Authentication checks: Redirect unauthenticated users to login
// Role-based access control(/dashboard - dealers only, /buyer - buyers only, /admin/* - admins only)
// Edge-compatible for optimal performance

import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    const isOnAuth = nextUrl.pathname.startsWith("/auth")
    const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
    const isOnBuyer = nextUrl.pathname.startsWith("/buyer")
    const isOnAdmin = nextUrl.pathname.startsWith("/admin")

    //redirect logged-in users away from auth pages
    if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl))
    }

    //protect dashboard -dealers only
    if (isOnDashboard) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/auth/login", nextUrl))
        }
        if (req.auth?.user?.role !== "DEALER") {
            return Response.redirect(new URL("/", nextUrl))
        }
    }

    //protect buyer routes
    if (isOnBuyer) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/auth/login", nextUrl))
        }
        if (req.auth?.user?.role !== "BUYER") {
            return Response.redirect(new URL("/", nextUrl))
        }
    }

    //protect admin routes
    if (isOnAdmin) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/auth/login", nextUrl))
        }
        if (req.auth?.user?.role !== "ADMIN") {
            return Response.redirect(new URL("/", nextUrl))
        }
    }

    return undefined
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
