//app/layout.tsx
//root layout for AIM-Mombasa application with theme support

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AIM-Mombasa | Find Your Perfect Car in Mombasa",
  description: "AI-Enhanced Automotive Inventory Management & Matchmaking System. Browse verified cars, set alerts, and connect with trusted dealers in Mombasa.",
  keywords: ["cars", "Mombasa", "automotive", "car dealers", "verified cars", "Kenya"],
  authors: [{ name: "AIM-Mombasa Team" }],
  openGraph: {
    title: "AIM-Mombasa | Find Your Perfect Car",
    description: "No more wasted trips. Browse live inventory, set alerts, and connect with trusted dealers.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

