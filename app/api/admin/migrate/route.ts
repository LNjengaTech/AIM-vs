// app/api/admin/migrate/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma'; // Make sure this path points to your Prisma client
import { generateUniqueCarSlug } from '@/lib/utils/slug';

export async function GET() {
    try {
        // 1. Fetch all cars that are missing a slug
        const carsToUpdate = await prisma.car.findMany({
            where: {
                OR: [
                    { slug: null },
                    { slug: "" }
                ]
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

    } catch (error: any) {
        console.error("Migration failed:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
