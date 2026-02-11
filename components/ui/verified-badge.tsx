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
        //fill-current sets the seal color
        //className={cn("fill-current", styles[variant])}
        //stroke matches the background to create a "cutout" effect for the check
        //"stroke-white" to match theme's background hex
        className={cn("fill-current", styles[variant], "stroke-white dark:stroke-slate-950")} 
        strokeWidth={2}
      />
    </div>
  )
}

