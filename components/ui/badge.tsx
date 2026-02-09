//components/ui/badge.tsx
// Badge component for status indicators (verified, pioneer, pending)

import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "destructive" | "secondary"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary hover:bg-primary/20",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
