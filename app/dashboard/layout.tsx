import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import Link from "next/link"
import { LogOut } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "DEALER") {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span>AIM-Mombasa</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DashboardNav />
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{session.user.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {session.user.email}
              </span>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              const { signOut } = await import("@/lib/auth")
              await signOut()
            }}
            className="mt-2"
          >
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/*Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/*mobile heade*/}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
          <Link href="/" className="font-bold">AIM-Mombasa</Link>
          {/* mobile menu toggle here*/}
          <span className="text-sm font-medium">Dashboard</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 AIM-Mombasa | Technical University of Mombasa (TUM)</p>
        </footer>
      </div>
    </div>
  )
}
