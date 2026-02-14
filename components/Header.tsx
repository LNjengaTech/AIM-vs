import { auth } from "@/lib/auth"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export async function Header() {
    const session = await auth()

    return (
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold bg-linear-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    AIM-Mombasa
                </Link>

                <nav className="flex items-center gap-4">
                    <ThemeToggle/>
                    {session?.user ? (
                        <>
                            <span className="text-sm text-muted-foreground hidden sm:inline font-bold">
                                {session.user.email.split('@gmail.com')}
                            </span>
                            <Link href={session.user.role === "DEALER" ? "/dashboard" : session.user.role === "BUYER" ? "/buyer" : "/admin/verifications"} className="inline-flex gap-2 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                            >
                                {session.user.role === "DEALER" ? "Dashboard" : session.user.role === "BUYER" ? "Profile" : "Admin"}
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                            </Link>
                            <form action={async () => {
                                "use server"
                                const { signOut } = await import("@/lib/auth")
                                await signOut()
                            }}>
                                <button className="rounded-lg bg-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                                    Log Out
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
                </nav>
            </div>
        </header>
    )

}