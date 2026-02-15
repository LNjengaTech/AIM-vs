// components/ui/verified-badge.tsx
import { cn } from "@/lib/utils"
import { BadgeCheck } from "lucide-react"

interface VerifiedBadgeProps {
  variant: "verified" | "pioneer"
  size?: number
  className?: string
}

export function VerifiedBadge({ variant, size = 20, className }: VerifiedBadgeProps) {
  const styles = {
    verified: "text-[#1DA1F2]", 
    pioneer: "text-[#eab308]"
  }

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <BadgeCheck 
        size={size} 
        className={cn("fill-current", styles[variant], "stroke-gray-100! dark:stroke-slate-950!")} 
        strokeWidth={2}
      />
    </div>
  )
}

