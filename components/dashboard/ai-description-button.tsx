/**
 * components/dashboard/ai-description-button.tsx
 * "Generate with AI" button for the add/edit car forms.
 * Posts car data to /api/ai/generate-description and calls onGenerated with the result.
 * Disabled until make, model, and year are provided.
 */

"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIDescriptionButtonProps {
  carData: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    mileage?: number;
    condition?: string;
    bodyType?: string;
    transmission?: string;
    fuelType?: string;
    engineCapacity?: string;
    features?: string[];
    price?: number;
    negotiable?: boolean;
  };
  onGenerated: (description: string) => void;
}

export function AIDescriptionButton({ carData, onGenerated }: AIDescriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canGenerate = !!(carData.make && carData.model && carData.year);

  const handleGenerate = async () => {
    if (!canGenerate || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });

      const data: unknown = await response.json();
      const body = data as Record<string, unknown>;

      if (!response.ok) {
        const msg = typeof body.error === "string" ? body.error : "AI generation failed. Please try again.";
        setErrorMessage(msg);
        return;
      }

      if (typeof body.description === "string" && body.description) {
        onGenerated(body.description);
        setHasGenerated(true);
      } else {
        setErrorMessage("AI returned an empty description. Please try again.");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Network error. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:border-primary gap-2 transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wand2 className="h-3.5 w-3.5" />
          )}
          {isLoading ? "Generating…" : "Generate with AI"}
        </Button>

        {hasGenerated && !isLoading && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ AI suggestion ready — edit freely before saving.
          </span>
        )}
      </div>

      {!canGenerate && (
        <p className="text-[11px] text-muted-foreground">
          Fill in make, model and year to unlock AI ✨
        </p>
      )}

      {errorMessage && (
        <p className="text-[11px] text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
