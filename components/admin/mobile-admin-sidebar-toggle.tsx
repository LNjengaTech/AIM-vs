"use client"

import { useState } from "react"
import { Menu, X, LogOut } from "lucide-react"
import Link from "next/link"
import { AdminNav } from "@/components/admin/admin-nav"
import { signOutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

interface MobileAdminSidebarToggleProps {
  session: {
    user: {
      name?: string | null
      email?: string | null
    }
  }
}

export function MobileAdminSidebarToggle({ session }: MobileAdminSidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button - Fixed top-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 rounded-lg bg-card border p-2 md:hidden shadow-md"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-card transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 font-bold text-lg"
            onClick={() => setIsOpen(false)}
          >
            <span>AIM Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AdminNav onNavigate={() => setIsOpen(false)} />
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

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
