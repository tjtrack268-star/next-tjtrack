import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "TJ-Track | Gestion de Stock & E-commerce",
  description: "Plateforme moderne de gestion de stock et e-commerce pour marchands et fournisseurs",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["stock", "inventory", "ecommerce", "gestion", "marchand"],
  authors: [{ name: "TJ-Track" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1fad9f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
