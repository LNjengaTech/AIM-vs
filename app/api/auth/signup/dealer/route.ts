//app/api/auth/signup/dealer/route.ts
//Dealer registration API endpoint with pioneer status detection

//destructures/extract the data from the POST requset body, validates it, hashes the password before storing, creates the user and returns/respond with a sanitized user data(without the password).

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            name,
            email,
            password,
            businessName,
            businessPhone,
            businessAddress,
            location,
            permitNumber,
            permitImageUrl,
        } = body

        //validate required fields
        if (!name || !email || !password || !businessName || !businessPhone || !businessAddress || !location) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        //check if user/email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            )
        }

        //check pioneer status(first 10 dealers)
        const dealerCount = await prisma.dealerProfile.count()
        const isPioneer = dealerCount < 10

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        //create user and dealer profile in a transaction
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "DEALER",
                dealerProfile: {
                    create: {
                        businessName,
                        businessPhone,
                        businessAddress,
                        location,
                        permitNumber: permitNumber || null,
                        permitImageUrl: permitImageUrl || null,
                        isPioneer,
                        pioneerBadgeDate: isPioneer ? new Date() : null,
                        isVerified: false,//requires admin approval
                    },
                },
            },
            include: {
                dealerProfile: true,
            },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Dealer account created successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isPioneer,
                    isVerified: false,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Dealer signup error:", error)
        return NextResponse.json(
            { error: "Failed to create dealer account" },
            { status: 500 }
        )
    }
}
