"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"

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
    const newUrls: string[] = []

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)
        
        // Use an unsigned upload preset (ensure this exists in your Cloudinary settings)
        // If not, you might need to create one named 'aim_mombasa_unsigned' or similar
        // Or route through a server API that signs the request.
        // For verify/prototype, we'll try 'ml_default' or assuming the user has one.
        // Ideally, we'd use a server route for security.
        formData.append("upload_preset", "aim_mombasa_permits") // Reusing the one from auth for now?
        // Or better, just ask user to make one.
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        )
        
        const data = await response.json()
        if (data.secure_url) {
          newUrls.push(data.secure_url)
        } else {
            console.error("Upload failed", data)
            alert("Upload failed: " + (data.error?.message || "Unknown error"))
        }
      }

      onChange([...value, ...newUrls])
    } catch (error) {
      console.error("Upload error", error)
      alert("Something went wrong with the upload.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {value.map((url) => (
          <div key={url} className="relative h-[200px] w-[200px] overflow-hidden rounded-md border">
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
        <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
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
