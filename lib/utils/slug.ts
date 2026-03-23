// lib/utils/slug.ts
// Utility functions for generating URL-friendly slugs  from car details

/**
 * Generate a URL-friendly slug from car details
 * Format: make-model-year-randomid
 * Example: toyota-corolla-2020-x8z2p
 */
export function generateCarSlug(make: string, model: string, year: number): string {
    const cleanText = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    }

    const makeSlug = cleanText(make)
    const modelSlug = cleanText(model)

    // Add random suffix to ensure uniqueness
    const randomId = generateRandomId(5)

    return `${makeSlug}-${modelSlug}-${year}-${randomId}`
}

/**
 * Generate a random alphanumeric ID
 */
function generateRandomId(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Check if a slug already exists in the database
 * Returns true if exists, false otherwise
 */
export async function slugExists(slug: string, prisma: any): Promise<boolean> {
    const existing = await prisma.car.findUnique({
        where: { slug },
        select: { id: true }
    })
    return !!existing
}

/**
 * Generate a unique slug, adding numbers if necessary
 */
export async function generateUniqueCarSlug(
    make: string,
    model: string,
    year: number,
    prisma: any
): Promise<string> {
    let slug = generateCarSlug(make, model, year)

    // Keep trying with new random IDs if slug exists
    while (await slugExists(slug, prisma)) {
        slug = generateCarSlug(make, model, year)
    }

    return slug
}
