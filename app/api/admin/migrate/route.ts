/**
 * app/api/admin/migrate/route.ts
 * Admin-only migration route to generate missing car slugs.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueCarSlug } from '@/lib/utils/slug';

export async function GET() {
    try {
        // 1. Fetch all cars that are missing a slug (empty string)
        const carsToUpdate = await prisma.car.findMany({
            where: {
                slug: ""
            }
        });

        console.log(`Starting migration for ${carsToUpdate.length} cars...`);

        const updatedCars = [];

        // 2. Loop through and update each car
        for (const car of carsToUpdate) {
            const newSlug = await generateUniqueCarSlug(
                car.make, 
                car.model, 
                car.year, 
                prisma
            );

            const updated = await prisma.car.update({
                where: { id: car.id },
                data: { slug: newSlug },
                select: { id: true, slug: true }
            });
            
            updatedCars.push(updated);
        }

        // 3. Return a success response
        return NextResponse.json({ 
            success: true,
            message: `Successfully migrated ${updatedCars.length} cars.`,
            updated: updatedCars
        }, { status: 200 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Migration failed"
        console.error("[MIGRATION_ERROR]", message);
        return NextResponse.json({ 
            success: false, 
            error: message
        }, { status: 500 });
    }
}
