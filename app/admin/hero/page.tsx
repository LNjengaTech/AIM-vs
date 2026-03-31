"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Eye, Image as ImageIcon, Sparkles } from "lucide-react"
import { HeroSection } from "@/components/home/hero-section"

export default function AdminHeroPage() {
  const [formData, setFormData] = useState<{
    headline: string
    subheadline: string
    tagline: string
    backgroundImageUrl: string
    foregroundImageUrl: string
    selectedColor: string
    hasFeaturedCar: boolean
    featuredCarId: string
    specs: { label: string; value: string }[]
  }>({
    headline: "",
    subheadline: "",
    tagline: "",
    backgroundImageUrl: "",
    foregroundImageUrl: "",
    selectedColor: "#3b82f6",
    hasFeaturedCar: false,
    featuredCarId: "",
    specs: [
      { label: "0-100", value: "" },
      { label: "Top Speed", value: "" },
      { label: "Engine", value: "" },
      { label: "Power", value: "" },
    ],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchHeroData()
  }, [])

  const fetchHeroData = async () => {
    try {
      const response = await fetch("/api/admin/hero")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setFormData({
        headline: data.headline || "",
        subheadline: data.subheadline || "",
        tagline: data.tagline || "",
        backgroundImageUrl: data.backgroundImageUrl || "",
        foregroundImageUrl: data.foregroundImageUrl || "",
        selectedColor: data.selectedColor || "#3b82f6",
        hasFeaturedCar: data.hasFeaturedCar || false,
        featuredCarId: data.featuredCarId || "",
        specs: data.specs && data.specs.length > 0 ? data.specs : [
          { label: "0-100", value: "" },
          { label: "Top Speed", value: "" },
          { label: "Engine", value: "" },
          { label: "Power", value: "" },
        ],
      })
    } catch (error) {
      console.error("Error fetching hero data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save")
      
      alert("Hero section updated successfully!")
    } catch (error) {
      console.error("Error saving hero data:", error)
      alert("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Section Management</h1>
          <p className="text-muted-foreground mt-1">
            Customize the main landing page headline and background
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      {showPreview && (
        <div className="rounded-xl overflow-hidden border-4 border-primary/20 shadow-2xl animate-in zoom-in-95 duration-300">
           <HeroSection 
             headline={formData.headline}
             subheadline={formData.subheadline}
             tagline={formData.tagline}
             backgroundImageUrl={formData.backgroundImageUrl}
             foregroundImageUrl={formData.foregroundImageUrl}
             selectedColor={formData.selectedColor}
             hasFeaturedCar={formData.hasFeaturedCar}
             featuredCarId={formData.featuredCarId}
             specs={formData.specs.filter(s => s.label || s.value)} // Only pass non-empty specs
             className="min-h-[400px]"
           />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Content Settings */}
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Visual Content
               </CardTitle>
               <CardDescription>Headlines and messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input 
                    id="tagline" 
                    value={formData.tagline}
                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                    placeholder="e.g. PERFORMANCE"
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="headline">Main Headline</Label>
                  <Input 
                    id="headline" 
                    value={formData.headline}
                    onChange={(e) => setFormData({...formData, headline: e.target.value})}
                    placeholder="e.g. LIMITLESS"
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="subheadline">Sub-headline</Label>
                  <Textarea 
                    id="subheadline" 
                    value={formData.subheadline}
                    onChange={(e) => setFormData({...formData, subheadline: e.target.value})}
                    placeholder="Enter a compelling description..."
                    className="min-h-[100px]"
                  />
               </div>
               
               {/* Specs fields */}
               <div className="pt-4 border-t space-y-3">
                 <Label>Featured Specs (Below Image)</Label>
                 <div className="grid grid-cols-2 gap-4">
                   {formData.specs.map((spec, index) => (
                     <div key={index} className="flex gap-2">
                       <Input 
                         placeholder="Label" 
                         value={spec.label}
                         onChange={(e) => {
                           const newSpecs = [...formData.specs];
                           newSpecs[index].label = e.target.value;
                           setFormData({...formData, specs: newSpecs});
                         }}
                         className="w-1/2 text-xs"
                       />
                       <Input 
                         placeholder="Value" 
                         value={spec.value}
                         onChange={(e) => {
                           const newSpecs = [...formData.specs];
                           newSpecs[index].value = e.target.value;
                           setFormData({...formData, specs: newSpecs});
                         }}
                         className="w-1/2 text-xs"
                       />
                     </div>
                   ))}
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Media & Appearance */}
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Media & Style
               </CardTitle>
               <CardDescription>Background aesthetics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="bgImage">Background Image URL (Layer Z-0)</Label>
                  <Input 
                    id="bgImage" 
                    value={formData.backgroundImageUrl}
                    onChange={(e) => setFormData({...formData, backgroundImageUrl: e.target.value})}
                    placeholder="https://example.com/scenery.jpg"
                  />
                  <p className="text-[10px] text-muted-foreground">The environment/scenery backdrop.</p>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="fgImage">Foreground Image URL (Layer Z-20)</Label>
                  <Input 
                    id="fgImage" 
                    value={formData.foregroundImageUrl}
                    onChange={(e) => setFormData({...formData, foregroundImageUrl: e.target.value})}
                    placeholder="https://example.com/cutout-car.png"
                  />
                  <p className="text-[10px] text-muted-foreground">Transparent PNG of the car cutout.</p>
               </div>
               
               <div className="space-y-2">
                  <Label htmlFor="color">Accent Color</Label>
                  <div className="flex gap-4 items-center">
                    <Input 
                      id="color" 
                      type="color"
                      value={formData.selectedColor}
                      onChange={(e) => setFormData({...formData, selectedColor: e.target.value})}
                      className="w-16 h-10 p-1"
                    />
                    <span className="text-sm font-mono uppercase">{formData.selectedColor}</span>
                  </div>
               </div>

               <div className="flex items-center space-x-2 pt-4">
                  <input 
                    type="checkbox" 
                    id="hasFeaturedCar"
                    checked={formData.hasFeaturedCar}
                    onChange={(e) => setFormData({...formData, hasFeaturedCar: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="hasFeaturedCar">Show Featured Model Badge</Label>
               </div>
            </CardContent>
            <CardFooter className="bg-muted/50 mt-auto pt-6">
               <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
               </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
