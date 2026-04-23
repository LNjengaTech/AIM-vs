// app/contact/page.tsx
// Contact page — reach the AIM-Mombasa team.
// Public page. No auth required. Contact form sends to admin via internal API.

import { auth } from "@/lib/auth"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/home/footer"
import { ContactForm } from "@/components/contact/contact-form"
import { MapPin, Mail, MessageSquare } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Contact AIM-Mombasa",
  description: "Get in touch with the AIM-Mombasa team for dealer enquiries, technical support, or general questions.",
}

export default async function ContactPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={session?.user} />

      <main className="flex-1">
        {/* Contact Info Block */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Get In Touch
            </p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
            <p className="text-muted-foreground">
              Whether you are a dealer with a question about verification, a buyer
              needing help, or a researcher interested in the project — we want to hear
              from you.
            </p>
          </div>
        </div>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Left: contact details */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    <ContactDetail
                      icon={<MapPin className="h-5 w-5" />}
                      label="Location"
                      value="Technical University of Mombasa"
                      sub="Tom Mboya St, Mombasa, Kenya"
                    />
                    <ContactDetail
                      icon={<Mail className="h-5 w-5" />}
                      label="Email"
                      value="aim.mombasa@tum.ac.ke" 
                      sub="We aim to respond within 24 hours"
                      /* TODO: replace with real contact details */
                    />
                    <ContactDetail
                      icon={<MessageSquare className="h-5 w-5" />}
                      label="WhatsApp"
                      value="+254 700 000 000"
                      sub="For urgent dealer enquiries"
                      href="https://wa.me/254700000000"
                      /* TODO: replace with real contact details */
                    />
                  </div>
                </div>

                <div className="rounded-3xl border bg-muted/30 p-6 text-sm text-muted-foreground">
                  <p className="font-bold text-foreground mb-2">For Dealers</p>
                  <p className="leading-relaxed">
                    Already registered? Use the{" "}
                    <Link href="/dashboard" className="text-primary font-medium hover:underline">
                      messaging feature
                    </Link>{" "}
                    in your dashboard to contact us directly — it's faster and linked to your account.
                  </p>
                </div>
              </div>

              {/* Right: contact form */}
              <div>
                <h2 className="text-2xl font-bold mb-6 md:hidden">Send us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ContactDetail({
  icon, label, value, sub, href
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="rounded-2xl bg-primary/10 p-3 text-primary mt-1 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline text-lg">{value}</a>
        ) : (
          <p className="font-semibold text-lg">{value}</p>
        )}
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}
