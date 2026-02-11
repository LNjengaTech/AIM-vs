"use client"
import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function ImageGallery({ images, title }: { images: string[], title: string }) {
  const [idx, setIdx] = useState(0)
  if (!images?.length) return <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">No Images</div>
  
  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
        <Image src={images[idx]} alt={title} fill className="object-contain" priority />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)} className={cn("relative aspect-video w-24 flex-none rounded border overflow-hidden", idx === i && "ring-2 ring-primary")}>
              <Image src={img} alt="thumb" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
