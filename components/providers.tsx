"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import dynamic from "next/dynamic"

import { type ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { SearchProvider } from "@/contexts/search-context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { ApiErrorBoundary } from "@/components/api-error-boundary"
import { queryClient } from "@/lib/query-client"



const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (mod) => mod.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : () => null
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ApiErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <SearchProvider>
                {children}
                <Toaster />
                <SonnerToaster position="top-right" richColors />
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </ApiErrorBoundary>
        <ReactQueryDevtools />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
