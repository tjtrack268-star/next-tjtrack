"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, Sparkles, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { buildImageUrl } from "@/lib/image-utils"
import type { ApiResponse, ProduitEcommerceDto } from "@/types/api"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Hook pour récupérer les produits e-commerce (même que la page d'accueil)
function useEcommerceProducts() {
  return useQuery({
    queryKey: ["ecommerceProducts"],
    queryFn: () => apiClient.get<ProduitEcommerceDto[]>("/ecommerce/produits"),
  })
}

function normalizeApiList<T>(response: T[] | ApiResponse<T[]> | null | undefined): T[] {
  if (Array.isArray(response)) return response
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data
  }
  return []
}

export function ProductSidebar() {
  const { data: products, isLoading } = useEcommerceProducts()
  const { data: bannerResponse } = useQuery({
    queryKey: ["sidebarBannerAds"],
    queryFn: () => apiClient.get<ApiResponse<ProduitEcommerceDto[]> | ProduitEcommerceDto[]>("/catalogue/banniere-principale"),
  })
  const { data: carouselResponse } = useQuery({
    queryKey: ["sidebarCarouselAds"],
    queryFn: () => apiClient.get<ApiResponse<ProduitEcommerceDto[]> | ProduitEcommerceDto[]>("/catalogue/carrousel-accueil"),
  })
  const { data: featuredResponse } = useQuery({
    queryKey: ["sidebarFeaturedAds"],
    queryFn: () => apiClient.get<ApiResponse<ProduitEcommerceDto[]> | ProduitEcommerceDto[]>("/catalogue/produits-en-avant"),
  })
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const seenAdProductIdsRef = useRef<Set<number>>(new Set())

  const fallbackProducts = products || []
  const bannerAds = normalizeApiList(bannerResponse)
  const carouselAds = normalizeApiList(carouselResponse)
  const featuredAds = normalizeApiList(featuredResponse)

  const displayProducts = (featuredAds.length > 0 ? featuredAds : fallbackProducts).slice(0, 4)
  const carouselItems = (carouselAds.length > 0 ? carouselAds : bannerAds).slice(0, 3)

  useEffect(() => {
    if (carouselItems.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [carouselItems.length])

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const trackAdImpressions = useCallback((productIds: number[]) => {
    const deduped = productIds
      .filter((id) => Number.isFinite(id) && id > 0)
      .filter((id) => {
        if (seenAdProductIdsRef.current.has(id)) return false
        seenAdProductIdsRef.current.add(id)
        return true
      })

    if (deduped.length === 0) return
    apiClient.post("/api/publicite/produits/vues", { produitIds: deduped }).catch(() => undefined)
  }, [])

  const trackAdClick = useCallback((productId?: number) => {
    if (!productId || productId <= 0) return
    apiClient.post(`/api/publicite/produit/${productId}/clic`).catch(() => undefined)
  }, [])

  useEffect(() => {
    const visibleAdIds = [
      ...carouselItems.map((item) => item.id),
      ...displayProducts.map((item) => item.id),
    ].filter((id): id is number => typeof id === "number")
    trackAdImpressions(visibleAdIds)
  }, [carouselItems, displayProducts, trackAdImpressions])

  const handleAdClick = useCallback(
    (product: ProduitEcommerceDto) => {
      if (!product.id) return
      trackAdClick(product.id)
      router.push(`/produit/${product.id}`)
    },
    [router, trackAdClick]
  )

  return (
    <div className="hidden xl:block w-72 flex-shrink-0">
      <Card className="glass-card sticky top-32">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Produits en avant</h2>
          </div>

          {/* Promo Banner */}
          <div className="relative rounded-lg overflow-hidden mb-4">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carouselItems.map((item, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 relative bg-gradient-to-r from-primary to-primary/80 p-4 text-white cursor-pointer"
                  onClick={() => handleAdClick(item)}
                >
                  <img
                    src={buildImageUrl(item.images?.[0]) || "/placeholder.svg"}
                    alt={item.nom || "Produit"}
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                  />
                  <div className="relative z-10">
                    <Badge className="bg-white/20 mb-2">Publicité</Badge>
                    <p className="font-bold">{item.nom}</p>
                    <p className="text-xs opacity-80">{formatPrice(Number(item.prix || 0))}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {carouselItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentSlide ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Featured Products */}
          <div className="space-y-3">
            {displayProducts.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleAdClick(product)}
              >
                <span className="text-lg font-bold text-muted-foreground w-5">{idx + 1}</span>
                <img
                  src={buildImageUrl(product.images?.[0]) || "/placeholder.svg"}
                  alt={product.nom || "Produit"}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <Badge className="bg-primary text-white text-xs mb-1">Sponsorisé</Badge>
                  <p className="text-sm font-medium truncate">{product.nom}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{formatPrice(Number(product.prix || 0))}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {(product.nombreVues || 0).toLocaleString()} vues
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link href={isAuthenticated ? "/dashboard/merchant/publicite" : "/connexion"}>
            <Button className="w-full mt-4 gradient-primary text-white">
              Mettre mon produit en avant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>

          <Card className="mt-4 bg-muted/30 border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Publicité</p>
              <p className="text-sm text-muted-foreground">
                Boostez la visibilité de vos produits avec nos options de mise en avant.
              </p>
              <Link
                href="/dashboard/merchant/publicite"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                En savoir plus →
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
