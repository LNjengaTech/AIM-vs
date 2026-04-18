import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { signOutAction } from "@/app/actions/auth"
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar-toggle"
import DynamicMessageIcon from "@/components/messaging/dynamic-message-icon"
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
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6 justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span>AIM-Mombasa</span>
          </Link>
          <DynamicMessageIcon userId={session.user.id} role="DEALER" />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <DashboardNav />
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-4xl px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{session.user.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {session.user.email}
              </span>
            </div>
          </div>
          <form action={signOutAction} className="mt-2">
            <button className="flex w-full items-center gap-3 rounded-4xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Sidebar with Toggle */}
      <MobileSidebarToggle session={session} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
          <Link href="/" className="font-bold">AIM-Mombasa</Link>
          <div className="flex items-center gap-4">
            <DynamicMessageIcon userId={session.user.id} role="DEALER" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
