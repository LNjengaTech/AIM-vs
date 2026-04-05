// lib/utils/slug.ts
// Utility functions for generating URL-friendly slugs from car details

import { PrismaClient } from "@prisma/client"

/**
 * Generate a URL-friendly slug from car details
 * Format: make-model-year[-suffix]
 * Example: toyota-corolla-2020-ckj3s9...
 */
export function generateCarSlug(make: string, model: string, year: number, suffix?: string): string {
    const cleanText = (text: string) => {
        return (text || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    }

    const makeSlug = cleanText(make)
    const modelSlug = cleanText(model)
    
    let base = `${makeSlug}-${modelSlug}-${year}`
    
    if (suffix) {
        base = `${base}-${suffix}`
    }

    return base
}

/**
 * Check if a slug already exists in the database
 * Returns true if exists, false otherwise
 */
export async function slugExists(slug: string, prisma: PrismaClient): Promise<boolean> {
    try {
        const existing = await prisma.car.findUnique({
            where: { slug },
            select: { id: true }
        })
        return !!existing
    } catch (error) {
        console.error("[SLUG_EXISTS_ERROR]", error instanceof Error ? error.message : "Unknown error")
        return false
    }
}

/**
 * Generate a unique slug, adding a unique suffix if necessary
 */
export async function generateUniqueCarSlug(
    make: string,
    model: string,
    year: number,
    prisma: PrismaClient
): Promise<string> {
    const initialSlug = generateCarSlug(make, model, year)

    // Check if the initial slug exists
    if (!(await slugExists(initialSlug, prisma))) {
        return initialSlug
    }

    // If it exists, append a short unique identifier
    // We'll use a portion of a timestamp or random string to keep it short
    const randomSuffix = Math.random().toString(36).substring(2, 7)
    let uniqueSlug = generateCarSlug(make, model, year, randomSuffix)

    // Extremely rare case: if even the suffixed slug exists, we keep trying
    while (await slugExists(uniqueSlug, prisma)) {
        const newSuffix = Math.random().toString(36).substring(2, 7)
        uniqueSlug = generateCarSlug(make, model, year, newSuffix)
    }

    return uniqueSlug
}
