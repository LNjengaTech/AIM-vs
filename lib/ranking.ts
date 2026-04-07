// app-src/lib/ranking.ts
// Implements the weighted ranking algorithm for car search results.

import { prisma } from "@/lib/prisma"
import { CarFilters, RankedCar } from "@/types/cars"
import { Prisma } from "@prisma/client"

export interface CalculationMetrics {
  views: number
  favorites: number
}

/**
 * Calculates the score for a single car based on 5 factors.
 * - Dealer verification status: 30%
 * - Listing completeness score: 25%
 * - Engagement (views/favorites): 20%
 * - Recency: 15%
 * - Price accuracy (vs market avg): 10%
 */
export function calculateCarScore(
  car: {
    price: number
    completenessScore: number
    createdAt: Date
    isFeatured: boolean
    dealer: { isVerified: boolean; isPioneer: boolean }
  },
  metrics: CalculationMetrics,
  averagePrice: number | null
): number {
  // 1. Dealer Score (30%)
  // isVerified=1.0, isPioneer=0.8, neither=0.3
  let dealerVal = 0.3
  if (car.dealer.isVerified) dealerVal = 1.0
  else if (car.dealer.isPioneer) dealerVal = 0.8
  const dealerScore = dealerVal * 0.30

  // 2. Completeness Score (25%)
  // already 0-100, normalize to 0-1
  const completenessScore = (car.completenessScore / 100) * 0.25

  // 3. Engagement Score (20%)
  // (views + favorites*2) capped at 100, /100
  let rawEngagement = metrics.views + (metrics.favorites * 2)
  if (rawEngagement > 100) rawEngagement = 100
  const engagementScore = (rawEngagement / 100) * 0.20

  // 4. Recency Score (15%)
  // < 3 days=1.0, <7=0.8, <30=0.5, older=0.2
  const daysOld = (new Date().getTime() - car.createdAt.getTime()) / (1000 * 3600 * 24)
  let recencyVal = 0.2
  if (daysOld < 3) recencyVal = 1.0
  else if (daysOld < 7) recencyVal = 0.8
  else if (daysOld < 30) recencyVal = 0.5
  const recencyScore = recencyVal * 0.15

  // 5. Price Accuracy Score (10%)
  // compare car price vs avg price for same make/model
  // within ±20% of avg = 1.0, ±40% = 0.6, outside = 0.3
  let priceVal = 0.3
  if (averagePrice && averagePrice > 0) {
    const diffPercent = Math.abs(car.price - averagePrice) / averagePrice
    if (diffPercent <= 0.20) priceVal = 1.0
    else if (diffPercent <= 0.40) priceVal = 0.6
  } else {
    // If no average price is available to compare, assume a neutral score to not penalize heavily
    priceVal = 0.6 
  }
  const priceScore = priceVal * 0.10

  // Calculate total
  let totalScore = dealerScore + completenessScore + engagementScore + recencyScore + priceScore

  // Featured bonus (+0.15)
  if (car.isFeatured) {
    totalScore += 0.15
  }

  // Cap at 1.0
  return Math.min(totalScore, 1.0)
}

/**
 * Fetches and ranks cars based on provided filters.
 */
export async function getRankedCars(filters: CarFilters): Promise<{ cars: RankedCar[], total: number, page: number, totalPages: number }> {
  const {
    make, model, yearMin, yearMax, priceMin, priceMax,
    transmission, fuelType, bodyType, condition, search,
    sortBy = "ranked", page = 1, limit = 12
  } = filters

  const where: Prisma.CarWhereInput = {
    status: "AVAILABLE",
    OR: [
      { isVerified: true },
      { dealer: { isVerified: true } }
    ]
  }

  // Build basic where clause based on filters
  if (make) {
      where.make = { contains: make, mode: "insensitive" }
  }
  if (model) {
      where.model = { contains: model, mode: "insensitive" }
  }
  if (search) {
      where.OR = [
          ...(where.OR as any[] || []),
          { make: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
      ]
  }
  if (priceMin || priceMax) {
    where.price = {}
    if (priceMin) where.price.gte = priceMin
    if (priceMax) where.price.lte = priceMax
  }
  if (yearMin || yearMax) {
    where.year = {}
    if (yearMin) where.year.gte = yearMin
    if (yearMax) where.year.lte = yearMax
  }
  if (transmission) where.transmission = { equals: transmission, mode: "insensitive" }
  if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" }
  if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" }
  if (condition) where.condition = { equals: condition, mode: "insensitive" }

  const skip = (page - 1) * limit

  // If sort is NOT ranked, we can use prisma's native orderby and limit
  if (sortBy !== "ranked") {
    let orderBy: Prisma.CarOrderByWithRelationInput = { createdAt: "desc" }
    if (sortBy === "price_asc") orderBy = { price: "asc" }
    else if (sortBy === "price_desc") orderBy = { price: "desc" }
    else if (sortBy === "newest") orderBy = { createdAt: "desc" }
    else if (sortBy === "oldest") orderBy = { createdAt: "asc" }
    else if (sortBy === "mileage_asc") orderBy = { mileage: "asc" }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { dealer: true }
      }),
      prisma.car.count({ where })
    ])

    return {
      cars: cars.map(c => ({ ...c, totalScore: 0 })) as RankedCar[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Ranked Sort Logic
  // We need to fetch ALL matching cars (or a reasonably large number like 1000) to rank them, 
  // because the top ranked car could theoretically be the oldest one.
  // For production with massive datasets, this logic would ideally be implemented 
  // via a materialized view or custom SQL query for performance. 
  // We will fetch all that match the filters.
  
  const [allCars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: {
        dealer: true,
        engagements: {
            select: { type: true }
        }
      }
    }),
    prisma.car.count({ where })
  ])

  // Calculate average prices for each make/model present in results
  // For better performance, we could group by make/model beforehand
  const priceAverages: Record<string, number> = {}
  
  // To avoid executing too many queries, let's group cars in memory
  const carsByMakeModel: Record<string, number[]> = {}
  allCars.forEach(car => {
      const key = `${car.make.toLowerCase()}_${car.model.toLowerCase()}`
      if (!carsByMakeModel[key]) carsByMakeModel[key] = []
      carsByMakeModel[key].push(Number(car.price))
  })
  
  Object.entries(carsByMakeModel).forEach(([key, prices]) => {
      const sum = prices.reduce((a, b) => a + b, 0)
      priceAverages[key] = prices.length > 0 ? sum / prices.length : 0
  })

  const rankedCars: RankedCar[] = allCars.map(car => {
    let views = 0
    let favorites = 0
    car.engagements.forEach(e => {
        if (e.type === "VIEW") views++
        else if (e.type === "FAVORITE") favorites++
    })

    const key = `${car.make.toLowerCase()}_${car.model.toLowerCase()}`
    const avgPrice = priceAverages[key] || null

    const totalScore = calculateCarScore(
      {
        price: Number(car.price),
        completenessScore: car.completenessScore,
        createdAt: car.createdAt,
        isFeatured: car.isFeatured,
        dealer: {
            isVerified: car.dealer.isVerified,
            isPioneer: car.dealer.isPioneer
        }
      },
      { views, favorites },
      avgPrice
    )

    // Remove engagements from returned object to match type and keep payload small
    const { engagements, ...carWithoutEngagements } = car

    return {
      ...carWithoutEngagements,
      totalScore
    } as RankedCar
  })

  // Sort descending by score
  rankedCars.sort((a, b) => b.totalScore - a.totalScore)

  // Apply pagination
  const paginatedCars = rankedCars.slice(skip, skip + limit)

  return {
    cars: paginatedCars,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}
