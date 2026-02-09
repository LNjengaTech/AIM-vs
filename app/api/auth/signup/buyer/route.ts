//app/api/auth/signup/buyer/route.ts
//Buyer registration API endpoint
//destructures/extract the data from the POST requset body, validates it, hashes the password before storing, creates the user and returns/respond with a sanitized user data(without the password).

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password, phone, location } = body

        //validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        //Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            )
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        //create user and buyer profile using prisma transaction
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "BUYER",
                buyerProfile: {
                    create: {
                        phone: phone || null,
                        location: location || null,
                    },
                },
            },
            include: {
                buyerProfile: true,
            },
        })

        //returns sanitized user data - no password in response
        return NextResponse.json(
            {
                success: true,
                message: "Buyer account created successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Buyer signup error:", error)
        return NextResponse.json(
            { error: "Failed to create buyer account" },
            { status: 500 }
        )
    }
}
