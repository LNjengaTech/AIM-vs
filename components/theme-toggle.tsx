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
            <button className="rounded-4xl border border-border p-2 opacity-0">
                <Sun className="h-5 w-5" />
            </button>
        )
    }

    return (
    
    // <div onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-1 w-12 items-center rounded-full! bg-transparent dark:bg-transparent" aria-label="Toggle theme">
    //     <div className={`flex h-8 w-8 border border-muted-foreground! items-center justify-center rounded-full! bg-black ${theme === 'light' ? 'bg-white!' : 'translate-x-0!' }`}>
    //     {theme === 'dark' ? <Sun className="h-4 w-4 text-white! " /> : <Moon className="h-4 w-4 rounded-full text-black!" />}
    //     </div>
    // </div>

    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="bg-gray-300 relative flex h-10 w-18 md:w-15 items-center rounded-full!  border-2 transition-colors! duration-300!"aria-label="Toggle theme">
        <div className={`flex h-8 w-8 border transform! items-center justify-center rounded-full! transition-transform! duration-300! ease-in-out!  bg-black ${theme === 'light' ? 'translate-x-9 md:translate-x-6 bg-white!' : 'translate-x-0!' }`} >
        {theme === 'dark' ? <Sun className="h-4 w-4 text-white! " /> : <Moon className="h-4 w-4 rounded-full text-black" />}
        </div>
    </button>

    )
}