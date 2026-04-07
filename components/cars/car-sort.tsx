"use client"
import { useRouter, useSearchParams } from "next/navigation"

export function CarSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("sort") || "ranked"

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", e.target.value)
    router.push(`/cars?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Sort:</span>
      <select value={current} onChange={onChange} className="h-9 rounded-3xl border bg-background px-2 text-sm">
        <option value="ranked">Best Match</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price_asc">Price: Low-High</option>
        <option value="price_desc">Price: High-Low</option>
        <option value="mileage_asc">Mileage: Low-High</option>
      </select>
    </div>
  )
}
