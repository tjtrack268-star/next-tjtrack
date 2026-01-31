import { useCallback, useRef } from 'react'
import { useCart } from '@/contexts/cart-context'
import type { PanierItemDto } from '@/types/api'

interface UseDebounceCartOptions {
  debounceMs?: number
}

export function useDebouncedCart(options: UseDebounceCartOptions = {}) {
  const { debounceMs = 300 } = options
  const { addItem, updateQuantity, removeItem } = useCart()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const pendingRequests = useRef<Set<string>>(new Set())

  const debouncedAddItem = useCallback(
    async (
      articleIdOrItem: number | PanierItemDto,
      quantite?: number,
      productInfo?: { name: string; price: number; image?: string }
    ) => {
      const requestKey = typeof articleIdOrItem === 'object' 
        ? `add-${articleIdOrItem.articleId}` 
        : `add-${articleIdOrItem}`

      // Prevent duplicate requests
      if (pendingRequests.current.has(requestKey)) {
        console.warn('Duplicate add request prevented for:', requestKey)
        return
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Add to pending requests
      pendingRequests.current.add(requestKey)

      // Debounce the request
      return new Promise<void>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            await addItem(articleIdOrItem, quantite, productInfo)
            resolve()
          } catch (error) {
            reject(error)
          } finally {
            // Remove from pending requests
            pendingRequests.current.delete(requestKey)
          }
        }, debounceMs)
      })
    },
    [addItem, debounceMs]
  )

  const debouncedUpdateQuantity = useCallback(
    async (articleId: number, quantite: number) => {
      const requestKey = `update-${articleId}`

      if (pendingRequests.current.has(requestKey)) {
        console.warn('Duplicate update request prevented for:', requestKey)
        return
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      pendingRequests.current.add(requestKey)

      return new Promise<void>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            await updateQuantity(articleId, quantite)
            resolve()
          } catch (error) {
            reject(error)
          } finally {
            pendingRequests.current.delete(requestKey)
          }
        }, debounceMs)
      })
    },
    [updateQuantity, debounceMs]
  )

  const debouncedRemoveItem = useCallback(
    async (articleId: number) => {
      const requestKey = `remove-${articleId}`

      if (pendingRequests.current.has(requestKey)) {
        console.warn('Duplicate remove request prevented for:', requestKey)
        return
      }

      pendingRequests.current.add(requestKey)

      try {
        await removeItem(articleId)
      } finally {
        pendingRequests.current.delete(requestKey)
      }
    },
    [removeItem]
  )

  return {
    debouncedAddItem,
    debouncedUpdateQuantity,
    debouncedRemoveItem,
  }
}
