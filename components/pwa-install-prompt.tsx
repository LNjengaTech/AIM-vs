// components/pwa-install-prompt.tsx
// Client component to show PWA install prompt on mobile

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

/**
 * Interface for the BeforeInstallPromptEvent which is not yet standard in TS
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed it
    const isDismissed = localStorage.getItem("pwa_dismissed")
    if (isDismissed) return

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Only show on mobile (width < 768px)
      if (window.innerWidth < 768) {
        setShowPrompt(true)
      }
    }

    // Listen for the install prompt
    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    // Show the browser's install prompt
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      console.log("User accepted the PWA install")
    } else {
      console.log("User dismissed the PWA install")
    }
    
    // Clear the prompt and hide UI
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    // Persistently dismiss for this device
    localStorage.setItem("pwa_dismissed", "true")
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-3 rounded-xl border bg-background/95 p-4 shadow-2xl backdrop-blur-sm md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">Install AIM-Mombasa</h3>
        <p className="text-xs text-muted-foreground">
          Access your favorites offline and get a faster experience by installing our app.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleInstall}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Install
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          Not now
        </Button>
      </div>
    </div>
  )
}
