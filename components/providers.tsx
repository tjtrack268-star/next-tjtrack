"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"

import { type ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { SearchProvider } from "@/contexts/search-context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { ApiErrorBoundary } from "@/components/api-error-boundary"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { queryClient } from "@/lib/query-client"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ApiErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <SearchProvider>
                {children}
                <CartDrawer />
                <Toaster />
                <SonnerToaster position="top-right" richColors />
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </ApiErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
