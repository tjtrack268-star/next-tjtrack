import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

interface Product {
  id: string
  nom: string
  prix: number
  image?: string
  // autres propriétés...
}

interface UseOptimizedProductsOptions {
  pageSize?: number
  enableCache?: boolean
}

export function useOptimizedProducts(options: UseOptimizedProductsOptions = {}) {
  const { pageSize = 20, enableCache = true } = options
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const loadProducts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (loading) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<{
        produits: Product[]
        totalPages: number
        currentPage: number
      }>('/ecommerce/produits', {
        page: pageNum,
        limit: pageSize,
        cache: enableCache ? 'force-cache' : 'no-cache'
      })

      if (reset) {
        setProducts(response.produits || [])
      } else {
        setProducts(prev => [...prev, ...(response.produits || [])])
      }
      
      setHasMore(pageNum < (response.totalPages || 1))
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      console.error('Erreur chargement produits:', err)
    } finally {
      setLoading(false)
    }
  }, [pageSize, enableCache, loading])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadProducts(page + 1, false)
    }
  }, [hasMore, loading, page, loadProducts])

  const refresh = useCallback(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
    loadProducts(1, true)
  }, [loadProducts])

  useEffect(() => {
    loadProducts(1, true)
  }, [])

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }
}