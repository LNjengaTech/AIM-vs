//lib/cloudinary.ts
//cloudinary helper functions for image upload and transformation

/**
 *upload image to Cloudinary
 * @param file - File to upload
 * @returns Cloudinary URL
 */
export async function uploadToCloudinary(file: File): Promise<string> {

    //Create a new FormData object to structure the multipart/form-data request and add the file to the form data with the key "file"
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "aim_vs")

    //upload presets define Cloudinary upload settings(folder, transformations, etc.)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
        throw new Error("Cloudinary cloud name not configured")
    }

    //Make a POST request to Cloudinary's upload API endpoint using the cloud name
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    )

    if (!response.ok) {
        throw new Error("Failed to upload image to Cloudinary")
    }

    //parse the JSON response from Cloudinary and Return the HTTPS URL of the uploaded image
    const data = await response.json()
    return data.secure_url
}



/**
 *get optimized Cloudinary URL
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized URL
 */
export function getOptimizedCloudinaryUrl(
    url: string,
    options: {
        width?: number
        height?: number
        quality?: number
        format?: "auto" | "webp" | "jpg" | "png"
    } = {}
): string {
    const { width, height, quality = 80, format = "auto" } = options

    //only transform if it's a Cloudinary URL
    if (!url.includes("cloudinary.com")) {
        return url
    }

    const transformations: string[] = []

    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    transformations.push(`q_${quality}`)
    transformations.push(`f_${format}`)

    const parts = url.split("/upload/")
    if (parts.length === 2) {
        return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`
    }

    return url
}

/**
 * delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Success boolean
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        const response = await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ publicId }),
        })

        return response.ok
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error)
        return false
    }
}
