import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin/admin-nav"
import Link from "next/link"
import { LogOut, LayoutDashboard, Search } from "lucide-react"
import { signOutAction } from "@/app/actions/auth"
import { MobileAdminSidebarToggle } from "@/components/admin/mobile-admin-sidebar-toggle"
import { AdminNotifications } from "@/components/admin/admin-notifications"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span>AIM Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AdminNav />
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
          <form action={signOutAction} className="mt-2">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Sidebar with Toggle */}
      <MobileAdminSidebarToggle session={session} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Workspace Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="flex items-center gap-4">
             <Link href="/" className="font-bold md:hidden">AIM Admin</Link>
             <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <LayoutDashboard className="h-4 w-4" />
                <span>/</span>
                <span className="font-medium text-foreground">Management Console</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Global Admin Search Placeholder */}
             <div className="hidden sm:flex relative items-center">
                <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="search" 
                  placeholder="Search globally..." 
                  className="h-9 w-40 lg:w-64 rounded-md border border-input bg-background pl-9 pr-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
             </div>

             <AdminNotifications />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
