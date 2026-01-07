"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import type { PanierDto, PanierItemDto, PanierRequest } from "@/types/api"
import { useAuth } from "./auth-context"

interface LocalCartItem extends PanierItemDto {
  articleNom: string
  articlePhoto?: string
  prixUnitaire: number
}

interface CartContextType {
  items: LocalCartItem[]
  isOpen: boolean
  isLoading: boolean
  totalItems: number
  totalAmount: number
  montantHT: number
  montantTVA: number
  addItem: (
    articleIdOrItem: number | PanierItemDto,
    quantite?: number,
    productInfo?: { name: string; price: number; image?: string },
  ) => Promise<void>
  updateQuantity: (articleId: number, quantite: number) => Promise<void>
  removeItem: (articleId: number) => Promise<void>
  clearCart: () => Promise<void>
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const LOCAL_CART_KEY = "tj-track-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user?.email) {
      setLocalItems([])
      return
    }

    setIsLoading(true)
    try {
      const data = await apiClient.get<PanierDto>("/panier", { userEmail: user.email })
      if (data?.items) {
        setLocalItems(data.items as LocalCartItem[])
      } else {
        setLocalItems([])
      }
    } catch (error: any) {
      // If user not found (400 error), work offline
      if (error?.message?.includes('400')) {
        console.warn('User not found in database, working offline')
        setLocalItems([])
        return
      }
      console.warn('Backend non disponible, utilisation du cache local:', error)
      try {
        const cached = localStorage.getItem(LOCAL_CART_KEY)
        if (cached) {
          const cachedItems = JSON.parse(cached)
          setLocalItems(cachedItems)
        } else {
          setLocalItems([])
        }
      } catch {
        setLocalItems([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.email])

  const loadGuestCart = useCallback(() => {
    try {
      const cached = localStorage.getItem(LOCAL_CART_KEY)
      if (cached) {
        const cachedItems = JSON.parse(cached)
        setLocalItems(cachedItems)
      } else {
        setLocalItems([])
      }
    } catch {
      setLocalItems([])
    }
  }, [])

  const addItemLocally = useCallback(
    (
      articleIdOrItem: number | PanierItemDto,
      quantite?: number,
      productInfo?: { name: string; price: number; image?: string }
    ) => {
      // Handle object parameter (PanierItemDto)
      if (typeof articleIdOrItem === 'object') {
        const item = articleIdOrItem
        if (!item.articleId || !item.quantite || !item.prixUnitaire) {
          throw new Error('Données article incomplètes')
        }
        
        setLocalItems((prev) => {
          const existingIndex = prev.findIndex((i) => i.articleId === item.articleId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            const newQuantite = updated[existingIndex].quantite + item.quantite
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantite: newQuantite,
              sousTotal: newQuantite * item.prixUnitaire,
            }
            return updated
          }
          return [...prev, { ...item, id: Date.now() } as LocalCartItem]
        })
        return
      }

      // Handle separate parameters
      const articleId = articleIdOrItem
      if (!quantite || !productInfo || quantite <= 0) {
        throw new Error("Quantité et informations produit requises")
      }

      const newItem = {
        id: Date.now(),
        articleId,
        articleCode: `ART-${articleId}`,
        articleNom: productInfo.name,
        articlePhoto: productInfo.image,
        quantite,
        prixUnitaire: productInfo.price,
        sousTotal: quantite * productInfo.price,
        stockDisponible: 100,
        disponible: true,
      }

      setLocalItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.articleId === articleId)
        if (existingIndex >= 0) {
          const updated = [...prev]
          const newQuantite = updated[existingIndex].quantite + quantite
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantite: newQuantite,
            sousTotal: newQuantite * productInfo.price,
          }
          return updated
        }
        return [...prev, newItem]
      })
    },
    []
  )

  const removeItemLocally = useCallback((articleId: number) => {
    setLocalItems((prev) => prev.filter((i) => i.articleId !== articleId))
  }, [])

  const updateQuantityLocally = useCallback((articleId: number, quantite: number) => {
    if (quantite <= 0) {
      return removeItemLocally(articleId)
    }

    setLocalItems((prev) =>
      prev.map((item) =>
        item.articleId === articleId ? { ...item, quantite, sousTotal: quantite * item.prixUnitaire } : item,
      ),
    )
  }, [removeItemLocally])

  const mergeGuestCartAndRefresh = useCallback(async () => {
    if (!user?.email) return
    
    // Get guest cart from localStorage before refreshCart clears localItems
    let guestCartItems: LocalCartItem[] = []
    try {
      const cached = localStorage.getItem(LOCAL_CART_KEY)
      if (cached) {
        guestCartItems = JSON.parse(cached)
      }
    } catch {
      guestCartItems = []
    }
    
    console.log('=== MERGE CART DEBUG ===')
    console.log('Guest cart items:', guestCartItems.length)
    
    // If there are guest items, merge them BEFORE refreshing
    if (guestCartItems.length > 0) {
      setIsLoading(true)
      let userNotFound = false
      
      try {
        // Try to merge first item to check if user exists
        for (const guestItem of guestCartItems) {
          try {
            console.log(`Merging item: ${guestItem.articleNom} (ID: ${guestItem.articleId})`)
            await apiClient.post("/panier/ajouter", 
              { articleId: guestItem.articleId, quantite: guestItem.quantite }, 
              { userEmail: user.email }
            )
          } catch (error: any) {
            // Si l'utilisateur n'existe pas (400), arrêter et garder le panier local
            if (error?.message?.includes('400') || error?.message?.includes('Utilisateur non trouvé')) {
              console.warn('User not found in database, keeping guest cart locally')
              userNotFound = true
              break
            }
            // Si l'article n'existe plus, continuer avec les autres
            if (error?.message?.includes('Article non trouvé')) {
              console.warn(`Article ${guestItem.articleNom} no longer exists, skipping...`)
              continue
            }
            console.warn(`Failed to merge item ${guestItem.articleNom}, skipping...`)
          }
        }
        
        // Si l'utilisateur n'existe pas, garder le panier local
        if (userNotFound) {
          console.log('Keeping guest cart in localStorage')
          setLocalItems(guestCartItems)
          setIsLoading(false)
          return
        }
        
        // Clear guest cart after successful merge
        localStorage.removeItem(LOCAL_CART_KEY)
        console.log('Guest cart merged and cleared from localStorage')
      } catch (error: any) {
        console.error('Error merging guest cart:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Now refresh to get the merged cart from server
    await refreshCart()
    console.log('=== END MERGE CART DEBUG ===')
  }, [user?.email, refreshCart])

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      // Use requestIdleCallback or setTimeout to defer heavy operations
      const timeoutId = setTimeout(() => {
        mergeGuestCartAndRefresh()
      }, 100) // Small delay to prevent blocking the main thread
      
      return () => clearTimeout(timeoutId)
    } else {
      // Load guest cart from localStorage
      loadGuestCart()
    }
  }, [isAuthenticated, user?.email, mergeGuestCartAndRefresh, loadGuestCart])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localItems))
    }
  }, [localItems])

  const items = localItems
  const totalItems = localItems.reduce((sum, item) => sum + item.quantite, 0)
  const totalAmount = localItems.reduce((sum, item) => sum + item.sousTotal, 0)
  const montantHT = totalAmount * 0.8095
  const montantTVA = totalAmount * 0.1905

  const addItem = useCallback(
    async (
      articleIdOrItem: number | PanierItemDto,
      quantite?: number,
      productInfo?: { name: string; price: number; image?: string }
    ) => {
      // Prevent duplicate requests with debouncing
      const requestKey = typeof articleIdOrItem === 'object' 
        ? `add-${articleIdOrItem.articleId}-${Date.now()}` 
        : `add-${articleIdOrItem}-${Date.now()}`
      
      // For guest users, work with local storage only
      if (!isAuthenticated || !user?.email) {
        return addItemLocally(articleIdOrItem, quantite, productInfo)
      }

      // Prevent multiple simultaneous requests for the same item
      if (isLoading) {
        console.warn('Cart operation already in progress, skipping...')
        return
      }

      setIsLoading(true)
      
      try {
        // Handle object parameter (PanierItemDto)
        if (typeof articleIdOrItem === 'object') {
          const item = articleIdOrItem
          if (!item.articleId || !item.quantite || !item.prixUnitaire) {
            throw new Error('Données article incomplètes')
          }
          
          const previousItems = [...localItems]
          
          // Optimistic update
          setLocalItems((prev) => {
            const existingIndex = prev.findIndex((i) => i.articleId === item.articleId)
            if (existingIndex >= 0) {
              const updated = [...prev]
              const newQuantite = updated[existingIndex].quantite + item.quantite
              updated[existingIndex] = {
                ...updated[existingIndex],
                quantite: newQuantite,
                sousTotal: newQuantite * item.prixUnitaire,
              }
              return updated
            }
            return [...prev, { ...item, id: Date.now() } as LocalCartItem]
          })
          
          try {
            const request: PanierRequest = { articleId: item.articleId, quantite: item.quantite }
            await apiClient.post("/panier/ajouter", request, { userEmail: user.email })
          } catch (error: any) {
            // Rollback on error
            setLocalItems(previousItems)
            if (error?.message?.includes('400')) {
              console.warn('Article not found or user not found, working offline')
              // Re-apply local changes for offline mode
              setLocalItems((prev) => {
                const existingIndex = prev.findIndex((i) => i.articleId === item.articleId)
                if (existingIndex >= 0) {
                  const updated = [...prev]
                  const newQuantite = updated[existingIndex].quantite + item.quantite
                  updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantite: newQuantite,
                    sousTotal: newQuantite * item.prixUnitaire,
                  }
                  return updated
                }
                return [...prev, { ...item, id: Date.now() } as LocalCartItem]
              })
              return
            }
            console.error('Erreur ajout panier:', error)
            throw error
          }
          return
        }

        // Handle separate parameters
        const articleId = articleIdOrItem
        if (!quantite || !productInfo || quantite <= 0) {
          throw new Error("Quantité et informations produit requises")
        }

        const previousItems = [...localItems]
        const newItem = {
          id: Date.now(),
          articleId,
          articleCode: `ART-${articleId}`,
          articleNom: productInfo.name,
          articlePhoto: productInfo.image,
          quantite,
          prixUnitaire: productInfo.price,
          sousTotal: quantite * productInfo.price,
          stockDisponible: 100,
          disponible: true,
        }

        // Optimistic update
        setLocalItems((prev) => {
          const existingIndex = prev.findIndex((i) => i.articleId === articleId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            const newQuantite = updated[existingIndex].quantite + quantite
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantite: newQuantite,
              sousTotal: newQuantite * productInfo.price,
            }
            return updated
          }
          return [...prev, newItem]
        })

        try {
          const request: PanierRequest = { articleId, quantite }
          await apiClient.post("/panier/ajouter", request, { userEmail: user.email })
        } catch (error: any) {
          // Rollback on error
          setLocalItems(previousItems)
          if (error?.message?.includes('400')) {
            console.warn('Article not found or user not found, working offline')
            // Re-apply local changes for offline mode
            setLocalItems((prev) => {
              const existingIndex = prev.findIndex((i) => i.articleId === articleId)
              if (existingIndex >= 0) {
                const updated = [...prev]
                const newQuantite = updated[existingIndex].quantite + quantite
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  quantite: newQuantite,
                  sousTotal: newQuantite * productInfo.price,
                }
                return updated
              }
              return [...prev, newItem]
            })
            return
          }
          console.error('Erreur ajout panier:', error)
          throw error
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, user?.email, localItems, isLoading, addItemLocally],
  )

  const removeItem = useCallback(
    async (articleId: number) => {
      // For guest users, work with local storage only
      if (!isAuthenticated || !user?.email) {
        return removeItemLocally(articleId)
      }

      const previousItems = [...localItems]
      setLocalItems((prev) => prev.filter((i) => i.articleId !== articleId))

      try {
        await apiClient.delete(`/panier/supprimer/${articleId}`, { userEmail: user.email })
      } catch (error) {
        console.error('Erreur suppression article:', error)
        setLocalItems(previousItems)
        throw error
      }
    },
    [isAuthenticated, user?.email, localItems],
  )

  const updateQuantity = useCallback(
    async (articleId: number, quantite: number) => {
      if (quantite <= 0) {
        return removeItem(articleId)
      }

      // For guest users, work with local storage only
      if (!isAuthenticated || !user?.email) {
        return updateQuantityLocally(articleId, quantite)
      }

      const previousItems = [...localItems]
      setLocalItems((prev) =>
        prev.map((item) =>
          item.articleId === articleId ? { ...item, quantite, sousTotal: quantite * item.prixUnitaire } : item,
        ),
      )

      try {
        const request: PanierRequest = { articleId, quantite }
        await apiClient.put("/panier/modifier", request, { userEmail: user.email })
      } catch (error) {
        console.error('Erreur modification quantité:', error)
        setLocalItems(previousItems)
        throw error
      }
    },
    [isAuthenticated, user?.email, localItems, removeItem],
  )

  const clearCart = useCallback(async () => {
    setLocalItems([])
    localStorage.removeItem(LOCAL_CART_KEY)

    if (isAuthenticated && user?.email) {
      try {
        await apiClient.delete("/panier/vider", { userEmail: user.email })
      } catch (error) {
        // API sync failed
      }
    }
  }, [isAuthenticated, user?.email])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), [])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isLoading,
        totalItems,
        totalAmount,
        montantHT,
        montantTVA,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
