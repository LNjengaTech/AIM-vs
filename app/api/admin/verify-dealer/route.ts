// app/api/admin/verify-dealer/route.ts
//Verufication API - Admin API endpoint to approve or reject dealer verifications

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await auth()

        //check admin authorization - Role-based access control
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { dealerId, action } = body //action: 'approve' or 'reject'

        if (!dealerId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        //Approve action
        if (action === "approve") {
            //approve dealer
            await prisma.dealerProfile.update({
                where: { id: dealerId },
                data: {
                    isVerified: true,
                    verifiedAt: new Date(),
                },
            })

            return NextResponse.json({
                success: true,
                message: "Dealer approved successfully",
            })
        } 
        //Reject action
        else if (action === "reject") {
            //for now, just marked as not verified
            //in future, i might want to add a rejection reason
            await prisma.dealerProfile.update({
                where: { id: dealerId },
                data: {
                    isVerified: false,
                    verifiedAt: null,
                },
            })

            return NextResponse.json({
                success: true,
                message: "Dealer verification rejected",
            })
        } else {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error("Dealer verification error:", error)
        return NextResponse.json(
            { error: "Failed to process verification" },
            { status: 500 }
        )
    }
}
