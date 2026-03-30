"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    //avoiding hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="rounded-lg border border-border p-2 opacity-0">
                <Sun className="h-5 w-5" />
            </button>
        )
    }

    return (
    

    <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
        className="relative flex h-1 w-12 items-center rounded-full! bg-transparent dark:bg-transparent border-2 border-blue-500!  transition-colors! duration-300!"
        aria-label="Toggle theme"
        >
        <div
        className={`flex h-6 w-6 transform! items-center justify-center rounded-full! transition-transform! duration-300! ease-in-out!  bg-blue-500
            ${theme === 'light' ? 'translate-x-6!' : 'translate-x-0!'
            }`}
        >
        {theme === 'dark' ? <Sun className="h-4 w-4 text-white! " /> : <Moon className="h-4 w-4 rounded-full" />}
        </div>
    </button>
    )
}