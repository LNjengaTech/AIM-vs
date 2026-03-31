import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const hero = await prisma.heroSection.findFirst({
      where: {
        isActive: true
      }
    })

    if (!hero) {
      // Return default values if none found
      return NextResponse.json({
        id: "default",
        headline: "Find Your Perfect Car – Verified, Available, and Matched Just for You!",
        subheadline: "No more wasted trips. Browse live inventory, set alerts, and connect with trusted dealers.",
        isActive: true
      })
    }

    return NextResponse.json(hero)
  } catch (error) {
    console.error("[HERO_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
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
      isActive 
    } = body

    // Ensure we parse specs properly or default to null
    const parsedSpecs = specs ? (typeof specs === 'string' ? JSON.parse(specs) : specs) : null;

    // Upsert the active hero section
    const hero = await prisma.heroSection.findFirst({
      where: { isActive: true }
    })

    let updatedHero
    if (hero) {
      updatedHero = await prisma.heroSection.update({
        where: { id: hero.id },
        data: {
          headline: headline || null,
          subheadline: subheadline || null,
          tagline: tagline || null,
          backgroundImageUrl: backgroundImageUrl || null,
          foregroundImageUrl: foregroundImageUrl || null,
          selectedColor,
          hasFeaturedCar,
          featuredCarId,
          specs: parsedSpecs,
          isActive
        }
      })
    } else {
      updatedHero = await prisma.heroSection.create({
        data: {
          headline: headline || null,
          subheadline: subheadline || null,
          tagline: tagline || null,
          backgroundImageUrl: backgroundImageUrl || null,
          foregroundImageUrl: foregroundImageUrl || null,
          selectedColor,
          hasFeaturedCar,
          featuredCarId,
          specs: parsedSpecs,
          isActive: true
        }
      })
    }

    return NextResponse.json(updatedHero)
  } catch (error) {
    console.error("[HERO_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
