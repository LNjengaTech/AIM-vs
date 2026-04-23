"use client"

// components/contact/contact-form.tsx
// Contact form client component — handles form state and submission.

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [charCount, setCharCount] = useState(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || "Failed to send message")
      }

      setSubmitted(true)
      toast.success("Message sent successfully!")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send message. Please try again."
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
        <p className="text-muted-foreground text-sm">
          We've received your message and will get back to you within 24 hours.
        </p>
        <Button 
          variant="outline" 
          className="mt-6 rounded-full"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border bg-card p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              required
              disabled={loading}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              disabled={loading}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select name="subject" defaultValue="General Enquiry" required disabled={loading}>
            <SelectTrigger id="subject" className="rounded-xl">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General Enquiry">General Enquiry</SelectItem>
              <SelectItem value="Dealer Application">Dealer Application</SelectItem>
              <SelectItem value="Technical Support">Technical Support</SelectItem>
              <SelectItem value="Research Collaboration">Research Collaboration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="message">Message</Label>
            <span className={charCount < 20 ? "text-[10px] text-destructive" : "text-[10px] text-muted-foreground"}>
              {charCount}/1000 characters
            </span>
          </div>
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us more about your enquiry..."
            required
            disabled={loading}
            minLength={20}
            maxLength={1000}
            className="min-h-[150px] rounded-xl resize-none"
            onChange={(e) => setCharCount(e.target.value.length)}
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-full py-6 text-base font-semibold"
          disabled={loading || charCount < 20}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </div>
  )
}
