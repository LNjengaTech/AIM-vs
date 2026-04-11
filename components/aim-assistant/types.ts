// app-src/components/aim-assistant/types.ts
// Shared TypeScript interfaces for the AIM Assistant chat widget and API route.

export interface CarContext {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  fuelType: string;
  transmission: string;
  features: string[];
  dealerName: string;
  isVerified: boolean;
}

export interface ChatMessage {
  role: "user" | "model"; // "model" is Gemini's term for the AI role
  content: string;
}

export interface MarketplaceContext {
  listings: Array<{
    make: string;
    model: string;
    year: number;
    price: number;
    condition: string;
    mileage: number;
  }>;
}

export interface AssistantContext {
  page: string;
  carContext?: CarContext;
  marketplaceContext?: MarketplaceContext;
  userRole?: string;
}
