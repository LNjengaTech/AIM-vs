// /home/lonnex/Desktop/PROJECTS/aim-mombasa/aim-mombasa-ag/app-src/lib/bolo-matcher.ts
// Core engine for matching new cars against active BOLO requests

import { prisma } from "@/lib/prisma"

export interface MatchResult {
  boloRequestId: string
  carId: string
  matchScore: number
}

export async function matchCarAgainstBOLOs(carId: string): Promise<MatchResult[]> {
  try {
    // a) Fetch the newly listed car with all fields
    const car = await prisma.car.findUnique({
      where: { id: carId }
    })

    if (!car) {
      console.error(`[BOLO_MATCHER] Car not found: ${carId}`)
      return []
    }

    // b) Fetch all active BOLORequests with their buyer
    const activeBolos = await prisma.bOLORequest.findMany({
      where: { isActive: true },
      include: { buyer: { include: { user: true } } }
    })

    const matches: MatchResult[] = []

    for (const bolo of activeBolos) {
      let matchScore = 0

      // c) Calculate matchScore (0–100)
      if (bolo.make && car.make.toLowerCase() === bolo.make.toLowerCase()) {
        matchScore += 25
      }

      if (bolo.model && car.model.toLowerCase() === bolo.model.toLowerCase()) {
        matchScore += 20
      }

      if (bolo.yearMin || bolo.yearMax) {
        const min = bolo.yearMin ?? 0
        const max = bolo.yearMax ?? 9999
        if (car.year >= min && car.year <= max) {
          matchScore += 15
        }
      }

      if (bolo.priceMin || bolo.priceMax) {
        const min = bolo.priceMin ? Number(bolo.priceMin) : 0
        const max = bolo.priceMax ? Number(bolo.priceMax) : Infinity
        if (Number(car.price) >= min && Number(car.price) <= max) {
          matchScore += 15
        }
      }

      if (bolo.color && car.color.toLowerCase() === bolo.color.toLowerCase()) {
        matchScore += 10
      }

      if (bolo.transmission && car.transmission.toLowerCase() === bolo.transmission.toLowerCase()) {
        matchScore += 5
      }

      if (bolo.fuelType && car.fuelType.toLowerCase() === bolo.fuelType.toLowerCase()) {
        matchScore += 5
      }

      if (bolo.maxMileage && car.mileage <= bolo.maxMileage) {
        matchScore += 5
      }

      // d) Only BOLOs with matchScore >= 50 are considered a match
      if (matchScore >= 50) {
        // e) Upsert BOLOMatch record
        const existingMatch = await prisma.bOLOMatch.findUnique({
          where: {
            boloRequestId_carId: {
              boloRequestId: bolo.id,
              carId: car.id
            }
          }
        })

        if (!existingMatch) {
          await prisma.bOLOMatch.create({
            data: {
              boloRequestId: bolo.id,
              carId: car.id,
              matchScore: matchScore
            }
          })

          // Create Notification
          // Since the Notification schema does not have a user relation, 
          // we just create a general notification with no role.
          // Note: In a complete system, we'd relate it to the buyer via metadata or a direct relation.
          await prisma.notification.create({
            data: {
              type: "BOLO_MATCH",
              title: "BOLO Match Found!",
              message: `A ${car.year} ${car.make} ${car.model} matching your alert is now available.`,
              link: `/cars/${car.slug}`
            }
          })

          matches.push({ boloRequestId: bolo.id, carId: car.id, matchScore })
        }
      }
    }

    return matches
  } catch (error: unknown) {
    console.error("[BOLO_MATCHER_ERROR]", error instanceof Error ? error.message : "Unknown error")
    return []
  }
}
