/**
 * lib/utils.ts
 * Utility functions for class name merging and other helpers used in the project
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * merging class names using clsx and tailwind-merge
 * param: inputs - Class names to merge
 * returns: Merged class string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formatting currency in KES
 * param: amount - Amount to format
 * returns: Formatted currency string
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(amount)
}

/**
 * determining completeness score for a car listing 
 * - ill later use this in ranking algorithm
 * param: car - Partial car object
 * returns: Completeness score (0-100)
 */
export function calculateCompletenessScore(car: {
    images?: string[]
    description?: string
    has360View?: boolean
    features?: string[]
}): number {
    let score = 0

    //images - 40 points max
    if (car.images && car.images.length > 0) {
        score += Math.min(car.images.length * 8, 40)
    }

    //description - 20 points
    if (car.description && car.description.length > 50) {
        score += 20
    } else if (car.description && car.description.length > 0) {
        score += 10
    }

    //360 View - 25 points
    if (car.has360View) {
        score += 25
    }

    //features - 15 points
    if (car.features && car.features.length > 0) {
        score += Math.min(car.features.length * 3, 15)
    }

    return Math.min(score, 100)
}

/**
 *Format relative time (e.g., "2 hours ago")
 * param: date - Date to format
 * returns: Relative time string
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    }

    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds)
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? "s" : ""} ago`
        }
    }

    return "Just now"
}
