"use client"

import { useMemo, useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ProductCard } from "@/components/cards/product-card"
import { Spinner } from "@/components/ui/spinner"
import { useCatalogue } from "@/hooks/use-api"
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import type { ProduitEcommerceDto } from "@/types/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buildImageUrl } from "@/lib/image-utils"
import { useRouter } from "next/navigation"

export default function NouveautesPage() {
  const { data: apiProducts, isLoading } = useCatalogue({})
  const products: ProduitEcommerceDto[] = (apiProducts || []) as ProduitEcommerceDto[]
  const [carouselSlide, setCarouselSlide] = useState(0)
  const router = useRouter()

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const newProducts = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return products
      .filter((product) => {
        if (!product.dateCreation) return false
        const creationDate = new Date(product.dateCreation)
        return creationDate >= thirtyDaysAgo
      })
      .sort((a, b) => {
        const dateA = new Date(a.dateCreation || 0)
        const dateB = new Date(b.dateCreation || 0)
        return dateB.getTime() - dateA.getTime()
      })
  }, [products])

  const carouselProducts = newProducts.slice(0, 5)

  useEffect(() => {
    if (carouselProducts.length > 0) {
      const timer = setInterval(() => {
        setCarouselSlide((prev) => (prev + 1) % carouselProducts.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [carouselProducts.length])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      {/* Mobile/Tablet Carousel */}
      <div className="xl:hidden container mx-auto px-4 pt-4">
        <Card className="glass-card overflow-hidden">
          <div className="relative h-48 sm:h-56">
            <div 
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${carouselSlide * 100}%)` }}
            >
              {carouselProducts.map((product, index) => (
                <div 
                  key={index} 
                  className="w-full flex-shrink-0 relative bg-gradient-to-r from-primary to-primary/80 cursor-pointer"
                  onClick={() => router.push(`/produit/${product.id}`)}
                >
                  <img
                    src={buildImageUrl(product.images?.[0]) || "/placeholder.svg"}
                    alt={product.nom || "Produit"}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div className="relative z-10 p-6 h-full flex flex-col justify-center">
                    <Badge className="bg-white/20 text-white mb-2 w-fit">Nouveauté</Badge>
                    <h3 className="font-bold text-white text-lg sm:text-xl mb-2 line-clamp-2">{product.nom}</h3>
                    <p className="text-white/90 text-2xl sm:text-3xl font-bold mb-1">{formatPrice(Number(product.prix || 0))}</p>
                    <p className="text-white/70 text-sm">{product.nomEntreprise || product.nomCommercant}</p>
                  </div>
                </div>
              ))}
            </div>
            {carouselProducts.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setCarouselSlide((prev) => (prev - 1 + carouselProducts.length) % carouselProducts.length)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setCarouselSlide((prev) => (prev + 1) % carouselProducts.length)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {carouselProducts.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === carouselSlide ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCarouselSlide(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Nouveautés</h1>
          </div>
          <p className="text-muted-foreground">
            Découvrez nos derniers produits - {newProducts.length} nouveauté
            {newProducts.length > 1 ? "s" : ""} ce mois-ci
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : newProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">Aucune nouveauté pour le moment</p>
            <p className="text-sm text-muted-foreground">Consultez notre catalogue complet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
