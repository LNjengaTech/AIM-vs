/**
 * app/admin/hero/page.tsx
 * Admin management page for the landing page hero section.
 * Supports visual configuration of headlines, background/foreground images, and spatial calibration.
 */

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
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, Eye, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { HeroSection } from "@/components/home/hero-section"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HeroSectionData } from "@/lib/types/hero"

type SaveStatus = "idle" | "saving" | "success" | "error"

export default function AdminHeroPage() {
  const [formData, setFormData] = useState<Omit<HeroSectionData, 'id' | 'updatedAt'>>({
    isActive: true,
    headline: "",
    subheadline: "",
    tagline: "",
    backgroundImageUrl: "",
    foregroundImageUrl: "",
    selectedColor: "#3b82f6",
    hasFeaturedCar: false,
    featuredCarId: "",
    foregroundImageX: 0,
    foregroundImageY: 0,
    foregroundImageScale: 1,
    specs: [
      { label: "0-100", value: "" },
      { label: "Top Speed", value: "" },
      { label: "Engine", value: "" },
      { label: "Power", value: "" },
    ],
  })
  
  const [availableCars, setAvailableCars] = useState<{id: string, make: string, model: string, year: number, slug: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const [heroRes, carsRes] = await Promise.all([
        fetch("/api/admin/hero"),
        fetch("/api/admin/cars")
      ])

      if (heroRes.ok) {
        const data = await heroRes.json()
        setFormData({
          isActive: data.isActive ?? true,
          headline: data.headline || "",
          subheadline: data.subheadline || "",
          tagline: data.tagline || "",
          backgroundImageUrl: data.backgroundImageUrl || "",
          foregroundImageUrl: data.foregroundImageUrl || "",
          selectedColor: data.selectedColor || "#3b82f6",
          hasFeaturedCar: data.hasFeaturedCar || false,
          featuredCarId: data.featuredCarId || "",
          foregroundImageX: data.foregroundImageX ?? 0,
          foregroundImageY: data.foregroundImageY ?? 0,
          foregroundImageScale: data.foregroundImageScale ?? 1,
          specs: data.specs && data.specs.length > 0 ? data.specs : [
            { label: "0-100", value: "" },
            { label: "Top Speed", value: "" },
            { label: "Engine", value: "" },
            { label: "Power", value: "" },
          ],
        })
      }

      if (carsRes.ok) {
        setAvailableCars(await carsRes.json())
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus("saving")
    try {
      const response = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save")
      setSaveStatus("success")
      toast.success("Hero section updated successfully!")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      console.error("Error saving hero data:", error)
      setSaveStatus("error")
      toast.error("Failed to save changes. Please try again.")
      setTimeout(() => setSaveStatus("idle"), 5000)
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
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Hero Management</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Fine-tune the &quot;Sandwich&quot; landing page experience
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 rounded-full font-bold border-primary text-primary hover:bg-primary/5"
        >
          {showPreview ? <Eye className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {showPreview ? "Hide Preview" : "Live Preview"}
        </Button>
      </div>

      {showPreview && (
        <div className="rounded-4xl overflow-hidden border-8 border-primary/10 shadow-3xl animate-in zoom-in-95 duration-500">
           <HeroSection 
             headline={formData.headline}
             subheadline={formData.subheadline}
             tagline={formData.tagline}
             backgroundImageUrl={formData.backgroundImageUrl}
             foregroundImageUrl={formData.foregroundImageUrl}
             selectedColor={formData.selectedColor}
             hasFeaturedCar={formData.hasFeaturedCar}
             featuredCarId={formData.featuredCarId}
             foregroundImageX={formData.foregroundImageX}
             foregroundImageY={formData.foregroundImageY}
             foregroundImageScale={formData.foregroundImageScale}
             specs={(formData.specs || []).filter(s => s.label || s.value)}
             className="min-h-125"
           />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Content Settings */}
          <Card className="rounded-4xl shadow-xl border-muted-foreground/10">
            <CardHeader className="pb-4">
               <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
                  <div className="bg-primary/10 p-2 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  Visual Content
               </CardTitle>
               <CardDescription className="font-medium">Headlines and dynamic specs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-[10px] font-black uppercase tracking-widest opacity-50">Backdrop Tagline (Massive)</Label>
                  <Input 
                    id="tagline" 
                    value={formData.tagline || ""}
                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                    placeholder="e.g. PERFORMANCE"
                    className="h-12 text-lg font-black italic rounded-2xl bg-muted/30"
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="headline" className="text-[10px] font-black uppercase tracking-widest opacity-50">Main Headline</Label>
                  <Input 
                    id="headline" 
                    value={formData.headline || ""}
                    onChange={(e) => setFormData({...formData, headline: e.target.value})}
                    placeholder="e.g. LIMITLESS"
                    className="h-12 text-lg font-bold rounded-2xl"
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="subheadline" className="text-[10px] font-black uppercase tracking-widest opacity-50">Sub-headline Description</Label>
                  <Textarea 
                    id="subheadline" 
                    value={formData.subheadline || ""}
                    onChange={(e) => setFormData({...formData, subheadline: e.target.value})}
                    placeholder="Enter a compelling description..."
                    className="min-h-30 rounded-2xl resize-none"
                  />
               </div>
               
               <div className="pt-6 border-t border-dashed space-y-4">
                 <Label className="text-xs font-black uppercase tracking-widest opacity-50">Featured Specifications</Label>
                 <div className="grid grid-cols-2 gap-3">
                   {(formData.specs || []).map((spec, index) => (
                     <div key={index} className="flex gap-2">
                       <Input 
                         placeholder="Label" 
                         value={spec.label}
                         onChange={(e) => {
                           const newSpecs = [...(formData.specs || [])];
                           newSpecs[index].label = e.target.value;
                           setFormData({...formData, specs: newSpecs});
                         }}
                         className="w-1/2 text-[10px] font-bold h-9 rounded-xl"
                       />
                       <Input 
                         placeholder="Value" 
                         value={spec.value}
                         onChange={(e) => {
                           const newSpecs = [...(formData.specs || [])];
                           newSpecs[index].value = e.target.value;
                           setFormData({...formData, specs: newSpecs});
                         }}
                         className="w-1/2 text-[10px] font-black h-9 rounded-xl italic bg-primary/5 border-primary/20"
                       />
                     </div>
                   ))}
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Media & Positioning */}
          <Card className="rounded-4xl shadow-xl border-muted-foreground/10">
            <CardHeader className="pb-4">
               <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
                  <div className="bg-primary/10 p-2 rounded-2xl">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  Placement & Style
               </CardTitle>
               <CardDescription className="font-medium">Car layer and background control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <Label htmlFor="bgImage" className="text-[10px] font-black uppercase tracking-widest opacity-50">Background URL (Z-0)</Label>
                  <Input 
                    id="bgImage" 
                    value={formData.backgroundImageUrl || ""}
                    onChange={(e) => setFormData({...formData, backgroundImageUrl: e.target.value})}
                    placeholder="Scenery backdrop URL"
                    className="h-10 rounded-xl"
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="fgImage" className="text-[10px] font-black uppercase tracking-widest opacity-50">Foreground Car URL (Z-20)</Label>
                  <Input 
                    id="fgImage" 
                    value={formData.foregroundImageUrl || ""}
                    onChange={(e) => setFormData({...formData, foregroundImageUrl: e.target.value})}
                    placeholder="Transparent PNG cutout URL"
                    className="h-10 rounded-xl"
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-6 pt-2">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Accent Color</Label>
                    <div className="flex gap-3 items-center bg-muted/40 p-2 rounded-2xl border border-muted/60">
                      <Input 
                        type="color"
                        value={formData.selectedColor || ""}
                        onChange={(e) => setFormData({...formData, selectedColor: e.target.value})}
                        className="w-10 h-10 p-0 border-none rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase tracking-tighter">{formData.selectedColor}</span>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Featured Selector</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="hasFeaturedCar"
                        checked={formData.hasFeaturedCar}
                        onChange={(e) => setFormData({...formData, hasFeaturedCar: e.target.checked})}
                        className="h-5 w-5 rounded-lg border-primary text-primary focus:ring-primary"
                      />
                      <Label htmlFor="hasFeaturedCar" className="text-xs font-bold leading-none cursor-pointer">Enable Badge</Label>
                    </div>
                 </div>
               </div>

               {formData.hasFeaturedCar && (
                 <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Link To Car Listing</Label>
                    <Select 
                      value={formData.featuredCarId || ""} 
                      onValueChange={(val) => setFormData({...formData, featuredCarId: val})}
                    >
                      <SelectTrigger className="h-11 rounded-2xl border-primary/30">
                        <SelectValue placeholder="Select a verified vehicle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCars.map(car => (
                          <SelectItem key={car.id} value={car.slug}>
                            {car.year} {car.make} {car.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
               )}
               
               <div className="pt-6 border-t border-dashed space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest text-primary">Spatial Calibration</Label>
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">Precision Tuning</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="posX" className="text-[10px] font-bold uppercase opacity-50">Horizontal offset (%)</Label>
                      <Input 
                        id="posX" 
                        type="number"
                        step="0.1"
                        value={formData.foregroundImageX}
                        onChange={(e) => setFormData({...formData, foregroundImageX: parseFloat(e.target.value) || 0})}
                        className="h-9 text-xs rounded-xl font-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="posY" className="text-[10px] font-bold uppercase opacity-50">Vertical offset (%)</Label>
                      <Input 
                        id="posY" 
                        type="number"
                        step="0.1"
                        value={formData.foregroundImageY}
                        onChange={(e) => setFormData({...formData, foregroundImageY: parseFloat(e.target.value) || 0})}
                        className="h-9 text-xs rounded-xl font-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="scale" className="text-[10px] font-bold uppercase opacity-50">Global Scale Factor</Label>
                      <span className="text-xs font-black italic bg-primary text-primary-foreground px-2 py-0.5 rounded-md">{formData.foregroundImageScale}x</span>
                    </div>
                    <Input 
                      id="scale" 
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.01"
                      value={formData.foregroundImageScale}
                      onChange={(e) => setFormData({...formData, foregroundImageScale: parseFloat(e.target.value) || 1})}
                      className="h-2 bg-muted accent-primary cursor-pointer"
                    />
                  </div>
               </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
               <Button 
                 type="submit" 
                 className="w-full h-14 rounded-3xl text-lg font-black italic uppercase tracking-wider shadow-lg hover:shadow-primary/20 transition-all" 
                 disabled={saveStatus === "saving"}
               >
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Uploading config...
                    </>
                  ) : (
                    <>
                      <Save className="mr-3 h-5 w-5" />
                      Publish Changes
                    </>
                  )}
               </Button>

               {saveStatus === "success" && (
                 <div className="flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                   <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 py-2 px-4 rounded-xl flex items-center gap-2">
                     <CheckCircle2 className="h-4 w-4" />
                     <span className="font-bold">Hero section updated successfully!</span>
                   </Badge>
                 </div>
               )}

               {saveStatus === "error" && (
                 <div className="flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                   <Badge variant="destructive" className="py-2 px-4 rounded-xl flex items-center gap-2">
                     <AlertCircle className="h-4 w-4" />
                     <span className="font-bold">Failed to save changes. Please try again.</span>
                   </Badge>
                 </div>
               )}
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
