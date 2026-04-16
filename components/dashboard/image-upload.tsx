// components/dashboard/image-upload.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { uploadToCloudinary } from "@/lib/cloudinary" // Import your helper!

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  onRemove: (value: string) => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      // Create an array of upload promises
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file))
      
      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises)
      
      // Update form state with new URLs added to existing ones
      onChange([...value, ...uploadedUrls])
      
    } catch (error: unknown) {
      console.error("Upload error:", error)
      const message = error instanceof Error ? error.message : "Upload failed. Please try again."
      toast.error(message)
    } finally {
      setIsUploading(false)
      // Reset input value so the same file can be selected again if needed
      e.target.value = ""
    }
  }



  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {value.map((url) => (
          <div key={url} className="relative h-50 w-50 overflow-hidden rounded-3xl border">
            <div className="absolute right-2 top-2 z-10">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Car Image"
              src={url}
              sizes="200px" // Optimization hint
            />
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-4xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
           <div className="text-gray-600 dark:text-gray-400">
             {isUploading ? (
               <Loader2 className="h-10 w-10 animate-spin" />
             ) : (
                <ImagePlus className="h-10 w-10" />
             )}
           </div>
           <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isUploading ? "Uploading..." : "Click to Upload Images"}
           </div>
           <input 
             type="file" 
             multiple 
             accept="image/*" 
             className="hidden" 
             onChange={onUpload}
             disabled={isUploading}
           />
        </label>
      </div>
    </div>
  )
}
