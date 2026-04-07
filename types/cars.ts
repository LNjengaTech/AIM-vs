// app-src/types/cars.ts
// Contains TypeScript interfaces and types for car filtering and ranking.

import { Car, DealerProfile } from "@prisma/client"

export type CarSortOption = "ranked" | "price_asc" | "price_desc" | "newest" | "oldest" | "mileage_asc"

export interface CarFilters {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  transmission?: string
  fuelType?: string
  bodyType?: string
  condition?: string
  search?: string
  sortBy?: CarSortOption
  page?: number
  limit?: number
}

// A car with its dealer relation and the computed ranking score.
export interface RankedCar extends Car {
  dealer: DealerProfile
  totalScore: number
}
