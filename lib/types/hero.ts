// lib/types/hero.ts
// Shared TypeScript interfaces for HeroSection data management

/**
 * Interface for individual car specifications displayed in the hero section
 */
export interface HeroSpec {
  label: string;
  value: string;
}

/**
 * Comprehensive interface for HeroSection data, matching the Prisma model
 */
export interface HeroSectionData {
  id: string;
  isActive: boolean;
  headline: string | null;
  subheadline: string | null;
  tagline: string | null;
  
  // Featured Car / Background
  hasFeaturedCar: boolean;
  featuredCarId: string | null;
  backgroundImageUrl: string | null;
  foregroundImageUrl: string | null;
  
  // Showcase Specs
  specs: HeroSpec[] | null;
  
  // Background Styling
  selectedColor: string | null;
  
  // Positioning for Foreground Image
  foregroundImageX: number;
  foregroundImageY: number;
  foregroundImageScale: number;
  
  updatedAt: Date | string;
}
