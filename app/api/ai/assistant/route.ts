// app-src/app/api/ai/assistant/route.ts
// AIM Assistant API — context-aware streaming chat using Gemini 2.0 Flash.
// No auth required (guests can ask questions too).
// Rate-limited per sessionId: 20 messages per server session.

import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { AssistantContext } from "@/components/aim-assistant/types";
import Groq from "groq-sdk";

// In-memory rate limiter
const sessionMessageCounts = new Map<string, number>();

function buildSystemInstruction(context: AssistantContext): string {
  const roleContext =
    context.userRole === "DEALER"
      ? "The user is a car dealer managing their inventory on AIM-Mombasa."
      : context.userRole === "BUYER"
      ? "The user is a buyer looking for a car on AIM-Mombasa."
      : "The user is a guest exploring AIM-Mombasa.";

  const pageDescriptions: Record<string, string> = {
    home: "The user is on the AIM-Mombasa homepage.",
    marketplace: "The user is browsing the car marketplace listings.",
    "car-detail": "The user is viewing a specific car listing.",
    dashboard: "The user is on their dealer dashboard managing inventory.",
    bolo: "The user is on the BOLO (Be On Look Out) alert page.",
    favorites: "The user is viewing their saved favourite cars.",
    analytics: "The user is viewing their dealer analytics.",
  };

  const carInfo = context.carContext
    ? `The specific car being viewed: ${context.carContext.year} ${
        context.carContext.make
      } ${context.carContext.model}, priced at KES ${context.carContext.price.toLocaleString()}, ${context.carContext.mileage.toLocaleString()} km, ${
        context.carContext.condition
      } condition, ${context.carContext.transmission} ${
        context.carContext.fuelType
      }. Dealer: ${context.carContext.dealerName}${
        context.carContext.isVerified ? " (Verified ✓)" : ""
      }.`
    : "";
  
  const marketplaceInfo = context.marketplaceContext?.listings
    ? `The user is looking at these listings on the page: ${context.marketplaceContext.listings
        .map(
          (l) =>
            `${l.year} ${l.make} ${l.model} (KES ${l.price.toLocaleString()}, ${l.condition}, ${l.mileage.toLocaleString()} km)`
        )
        .join("; ")}.`
    : "";

  return `You are the AIM Assistant — the built-in AI helper for AIM-Mombasa, a verified car marketplace in Mombasa, Kenya. You are friendly, direct, and knowledgeable about cars and the Kenyan used car market.

${roleContext}
${pageDescriptions[context.page] ?? "The user is navigating AIM-Mombasa."}
${carInfo}
${marketplaceInfo}

Your role:
- Help buyers evaluate cars, understand specs, and decide what to look for
- Explain BOLO requests and help buyers define better search criteria
- Help dealers improve completeness scores, understand rankings, and write better listings
- Give honest, grounded opinions on car value using Kenyan KES market context
- Guide guests to sign up and use the platform correctly
- Answer questions about typical Mombasa used car prices and market norms

Rules:
- Keep answers concise: 2–4 sentences for simple questions, slightly more for comparisons
- Never make up specific car listings, dealer phone numbers, or real prices you are unsure of
- For pricing, reason from what you know about Kenyan used car markets (Cheki.co.ke range)
- If asked something outside cars/AIM-Mombasa/Kenyan market, politely decline and redirect
- Be warm but efficient — Mombasa buyers value directness
- Do not mention that you are built on Gemini or any specific AI model`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Service Unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sessionId = body.sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const count = sessionMessageCounts.get(sessionId) || 0;
    if (count >= 20) {
      return new Response(
        JSON.stringify({ error: "You've reached the chat limit for this session." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    sessionMessageCounts.set(sessionId, count + 1);

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = buildSystemInstruction(body.context || { page: "home" });
    const groqApiKey = process.env.GROQ_API_KEY;
    
    // Convert history for Gemini
    const geminiHistory: Content[] = body.messages
      .slice(0, -1)
      .filter((msg: { role: string; content: string }, index: number) => {
        if (index === 0 && msg.role === "model") return false;
        return true;
      })
      .map((msg: { role: string; content: string }) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

    const lastMessageContent = body.messages[body.messages.length - 1].content;

    // Helper to create the response stream from Gemini
    const createGeminiStream = (streamResult: any) => {
      return new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of streamResult.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Stream error";
            controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
          } finally {
            controller.close();
          }
        },
      });
    };

    // 1. TIER 1: GEMINI 1.5 FLASH (Google SDK) - primary
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction,
      });
      const chat = model.startChat({ history: geminiHistory });
      const streamResult = await chat.sendMessageStream(lastMessageContent);
      return new Response(createGeminiStream(streamResult), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      });
    } catch (err15f: unknown) {
      console.warn("[AIM_ASSISTANT] Gemini 1.5 Flash failed, trying Tier 2 (Groq Llama)...");
      
      // 2. TIER 2: GROQ LLAMA 3.3 70B (Groq SDK) - first fallback
      if (groqApiKey) {
        try {
          const groq = new Groq({ apiKey: groqApiKey });
          const groqMessages = [
            { role: "system", content: systemInstruction },
            ...body.messages.map((msg: { role: string; content: string }) => ({
              role: msg.role === "model" ? "assistant" : "user",
              content: msg.content,
            })),
          ];

          const groqStream = await groq.chat.completions.create({
            messages: groqMessages as any,
            model: "llama-3.3-70b-versatile",
            stream: true,
          });

          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              try {
                for await (const chunk of groqStream) {
                  const text = chunk.choices[0]?.delta?.content || "";
                  if (text) controller.enqueue(encoder.encode(text));
                }
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Groq Stream error";
                controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
              } finally {
                controller.close();
              }
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Transfer-Encoding": "chunked",
              "Cache-Control": "no-cache",
              "X-Accel-Buffering": "no",
            },
          });
        } catch (groqErr: unknown) {
          console.warn("[AIM_ASSISTANT] Groq Llama failed, trying Tier 3 (Gemini 1.5 Pro)...");
        }
      }

      // 3. TIER 3: GEMINI 1.5 PRO (Google SDK) - second fallback
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          systemInstruction,
        });
        const chat = model.startChat({ history: geminiHistory });
        const streamResult = await chat.sendMessageStream(lastMessageContent);
        return new Response(createGeminiStream(streamResult), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
          },
        });
      } catch (err15p: unknown) {
        console.error("[AIM_ASSISTANT] All tiers failed.", err15p);
        throw err15p;
      }
    }
  } catch (error: unknown) {
    console.error("[AIM_ASSISTANT_ERROR]", error);
    
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")) {
       return new Response(
         JSON.stringify({ error: "The assistant is currently experiencing high demand. Please try again later." }),
         { status: 429, headers: { "Content-Type": "application/json" } }
       );
    }

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
