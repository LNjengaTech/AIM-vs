import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { auth } from "@/lib/auth";

// In-memory rate limiter: 10 generations per dealer per server lifetime.
// Resets on server restart. Upgrade path: Redis sliding-window counter.
const generationCounts = new Map<string, number>();
const RATE_LIMIT = 10;

interface CarData {
  make: string;
  model: string;
  year: number;
  color?: string;
  condition?: string;
  transmission?: string;
  fuelType?: string;
  engineCapacity?: string;
  mileage?: number;
  price?: number;
  negotiable?: boolean;
  features?: string[];
}

function mapCondition(condition?: string): string {
  switch (condition) {
    case "foreign": return "foreign used";
    case "used": return "locally used";
    case "new": return "brand new";
    default: return condition ?? "used";
  }
}

function buildPrompt(car: CarData): string {
  const parts: string[] = [
    `${car.year} ${car.make} ${car.model}`,
    car.color ? `colour: ${car.color}` : "",
    `condition: ${mapCondition(car.condition)}`,
    car.transmission ? `${car.transmission} transmission` : "",
    car.fuelType ? `${car.fuelType} engine` : "",
    car.engineCapacity ? `${car.engineCapacity} engine capacity` : "",
    car.mileage != null ? `${car.mileage.toLocaleString()} km on the odometer` : "",
    car.price != null ? `priced at KES ${car.price.toLocaleString()}${car.negotiable ? " (negotiable)" : ""}` : "",
    car.features?.length ? `features include: ${car.features.join(", ")}` : "",
  ].filter(Boolean);

  return `Write a compelling, honest 2–3 sentence car listing description for the following vehicle:

${parts.join(", ")}.

Rules:
- Exactly 2–3 sentences. No more.
- Plain English, third person (e.g. "This vehicle...")
- No hype words (amazing, stunning, breathtaking, etc.)
- Be specific and factual using the details provided
- End with a brief buying angle (e.g. ideal for families, great value for money)
- Output ONLY the description — no labels, no markdown, no quotes`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!geminiApiKey && !groqApiKey) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    const dealerId = session.user.id;
    const count = generationCounts.get(dealerId) ?? 0;
    if (count >= RATE_LIMIT) {
      return NextResponse.json(
        { error: `You've used all ${RATE_LIMIT} AI generations for this session. Restart the server to reset (or upgrade to Redis).` },
        { status: 429 }
      );
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const car = body as Record<string, unknown>;
    if (!car.make || !car.model || !car.year) {
      return NextResponse.json(
        { error: "make, model, and year are required to generate a description" },
        { status: 400 }
      );
    }

    const carData: CarData = {
      make: String(car.make),
      model: String(car.model),
      year: Number(car.year),
      color: car.color ? String(car.color) : undefined,
      condition: car.condition ? String(car.condition) : undefined,
      transmission: car.transmission ? String(car.transmission) : undefined,
      fuelType: car.fuelType ? String(car.fuelType) : undefined,
      engineCapacity: car.engineCapacity ? String(car.engineCapacity) : undefined,
      mileage: car.mileage != null ? Number(car.mileage) : undefined,
      price: car.price != null ? Number(car.price) : undefined,
      negotiable: car.negotiable != null ? Boolean(car.negotiable) : undefined,
      features: Array.isArray(car.features) ? (car.features as string[]) : undefined,
    };

    const prompt = buildPrompt(carData);
    let description = "";

    // 1. TIER 1: GEMINI 1.5 FLASH
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        description = result.response.text().trim();
      } catch (err15f: unknown) {
        console.warn("[AI_DESCRIPTION] Gemini 1.5 Flash failed, trying Tier 2 (Groq)...");
      }
    }

    // 2. TIER 2: GROQ LLAMA 3.3 70B
    if (!description && groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          max_tokens: 150,
        });
        description = completion.choices[0]?.message?.content?.trim() ?? "";
      } catch (groqErr: unknown) {
        console.warn("[AI_DESCRIPTION] Groq Llama failed, trying Tier 3 (Gemini 1.5 Pro)...");
      }
    }

    // 3. TIER 3: GEMINI 1.5 PRO
    if (!description && geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        description = result.response.text().trim();
      } catch (err15p: unknown) {
        console.error("[AI_DESCRIPTION] All tiers failed.", err15p);
      }
    }

    if (!description) {
      return NextResponse.json(
        { error: "AI generation failed. Please try again or write manually." },
        { status: 500 }
      );
    }

    // Increment rate limit counter on success
    generationCounts.set(dealerId, count + 1);

    return NextResponse.json({ description });
  } catch (error: unknown) {
    console.error("[AI_DESCRIPTION_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error during AI generation." },
      { status: 500 }
    );
  }
}
