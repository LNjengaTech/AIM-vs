//lib/auth.config.ts
//NextAuth configuration for edge compatibility

import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/auth/login",
    },
    session: { strategy: "jwt" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAuth = nextUrl.pathname.startsWith("/auth")
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            const isOnBuyer = nextUrl.pathname.startsWith("/buyer")
            const isOnAdmin = nextUrl.pathname.startsWith("/admin")

            if (isOnAuth) {
                if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
                return true
            }

            if (isOnDashboard || isOnBuyer || isOnAdmin) {
                if (!isLoggedIn) return false
                return true
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id as string
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as "BUYER" | "DEALER" | "ADMIN"
                session.user.id = token.id as string
            }
            return session
        },
    },
    providers: [], //add providers with bcrypt in main config
} satisfies NextAuthConfig
