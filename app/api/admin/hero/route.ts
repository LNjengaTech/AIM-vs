// app/api/admin/hero/route.ts
// API route for managing the landing page hero section (Admin only)

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HeroSectionData, HeroSpec } from "@/lib/types/hero"

/**
 * GET handler to fetch the active hero section configuration
 */
export async function GET() {
  try {
    const hero = await prisma.heroSection.findFirst({
      where: {
        isActive: true
      }
    })

    if (!hero) {
      // Return default values if none found in database
      const defaultHero: Partial<HeroSectionData> = {
        id: "default",
        headline: "Find Your Perfect Car – Verified, Available, and Matched Just for You!",
        subheadline: "No more wasted trips. Browse live inventory, set alerts, and connect with trusted dealers.",
        tagline: null,
        isActive: true,
        hasFeaturedCar: false,
        featuredCarId: null,
        backgroundImageUrl: null,
        foregroundImageUrl: null,
        specs: null,
        selectedColor: null,
        foregroundImageX: 0,
        foregroundImageY: 0,
        foregroundImageScale: 1
      }
      return NextResponse.json(defaultHero)
    }

    return NextResponse.json(hero)
  } catch (error: unknown) {
    console.error("[HERO_GET_ERROR]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * PUT handler to update or create the active hero section configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check for admin authorization
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { 
      headline, 
      subheadline,
      tagline,
      backgroundImageUrl,
      foregroundImageUrl,
      selectedColor,
      hasFeaturedCar,
      featuredCarId,
      specs,
      foregroundImageX,
      foregroundImageY,
      foregroundImageScale,
      isActive 
    } = body

    // Safe parsing of specs JSON
    let parsedSpecs: HeroSpec[] | null = null
    try {
      if (specs) {
        parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs
      }
    } catch (e) {
      console.warn("[HERO_SPECS_PARSE_WARN]", "Failed to parse specs JSON, defaulting to null")
    }

    // Find existing active hero section
    const existingHero = await prisma.heroSection.findFirst({
      where: { isActive: true }
    })

    const heroData = {
      headline: headline || null,
      subheadline: subheadline || null,
      tagline: tagline || null,
      backgroundImageUrl: backgroundImageUrl || null,
      foregroundImageUrl: foregroundImageUrl || null,
      selectedColor: selectedColor || null,
      hasFeaturedCar: !!hasFeaturedCar,
      featuredCarId: featuredCarId || null,
      specs: parsedSpecs as any, // Prisma Json type handling
      foregroundImageX: parseFloat(foregroundImageX) || 0,
      foregroundImageY: parseFloat(foregroundImageY) || 0,
      foregroundImageScale: parseFloat(foregroundImageScale) || 1,
      isActive: isActive !== undefined ? !!isActive : true
    }

    let result
    if (existingHero) {
      result = await prisma.heroSection.update({
        where: { id: existingHero.id },
        data: heroData
      })
    } else {
      result = await prisma.heroSection.create({
        data: heroData
      })
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error("[HERO_PUT_ERROR]", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
