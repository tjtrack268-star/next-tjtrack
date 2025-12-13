import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('HTTP: 4')) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error instanceof Error && error.message.includes('HTTP: 4')) {
          return false
        }
        return failureCount < 2
      },
      onError: (error) => {
        console.error('Mutation error:', error)
        toast.error(
          error instanceof Error 
            ? error.message 
            : "Une erreur s'est produite lors de l'opération"
        )
      },
    },
  },
})

// Global error handler for queries
queryClient.setMutationDefaults(['*'], {
  onError: (error) => {
    console.error('Query error:', error)
    if (error instanceof Error && !error.message.includes('HTTP: 4')) {
      toast.error("Erreur de connexion au serveur")
    }
  },
})