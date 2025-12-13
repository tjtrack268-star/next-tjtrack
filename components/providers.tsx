"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { type ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { ApiErrorBoundary } from "@/components/api-error-boundary"
import { DebugWrapper } from "@/components/debug-wrapper"
import { queryClient } from "@/lib/query-client"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiErrorBoundary>
        <DebugWrapper>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster />
              <SonnerToaster position="top-right" richColors />
            </CartProvider>
          </AuthProvider>
        </DebugWrapper>
      </ApiErrorBoundary>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
