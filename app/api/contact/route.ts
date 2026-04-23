// app/api/contact/route.ts
// Handles public contact form submissions.
// No auth required. Creates a Notification for the admin.

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Memory-based rate limiting (clears on server restart)
// In production, use Redis or a similar persistent store
const rateLimitMap = new Map<string, { count: number, resetAt: number }>()

const SUBJECT_OPTIONS = [
  "General Enquiry",
  "Dealer Application",
  "Technical Support",
  "Research Collaboration"
]

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    // 1. Basic Validation
    if (!name || typeof name !== "string" || name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Invalid name (2-80 characters)" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    if (!subject || !SUBJECT_OPTIONS.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 })
    }

    if (!message || typeof message !== "string" || message.length < 20 || message.length > 1000) {
      return NextResponse.json({ error: "Invalid message (20-1000 characters)" }, { status: 400 })
    }

    // 2. Rate Limiting (3 per IP per hour)
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const now = Date.now()
    const limit = rateLimitMap.get(ip)

    if (limit) {
      if (now < limit.resetAt) {
        if (limit.count >= 3) {
          return NextResponse.json(
            { error: "Too many messages. Please wait before trying again." },
            { status: 429 }
          )
        }
        limit.count++
      } else {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    }

    // 3. Create Admin Notification
    // Type CONTACT_FORM was added to schema in Stage 17
    await prisma.notification.create({
      data: {
        type: "CONTACT_FORM",
        title: `Contact Form: ${subject}`,
        message: `From ${name} (${email}): ${message.slice(0, 150)}${message.length > 150 ? "..." : ""}`,
        link: null, // Public contact form doesn't link to a specific dashboard page yet
        buyerId: null, // null means it's a platform-wide/admin notification
      }
    })

    // TODO: also send email notification via Resend when email is configured
    // console.log("Contact form submission:", { name, email, subject, message })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Contact API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Cleanup rate limit map occasionally to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetAt) {
      rateLimitMap.delete(ip)
    }
  }
}, 15 * 60 * 1000) // Every 15 minutes
