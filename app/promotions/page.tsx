"use client"

import { useMemo } from "react"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ProductCard } from "@/components/cards/product-card"
import { Spinner } from "@/components/ui/spinner"
import { useCatalogue } from "@/hooks/use-api"
import { Badge } from "@/components/ui/badge"
import { Percent } from "lucide-react"
import type { ProduitEcommerceDto } from "@/types/api"

export default function PromotionsPage() {
  const { data: apiProducts, isLoading } = useCatalogue({})
  const products: ProduitEcommerceDto[] = (apiProducts || []) as ProduitEcommerceDto[]

  const promotionProducts = useMemo(() => {
    return products.filter((product) => product.enPromotion === true)
  }, [products])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Percent className="h-5 w-5 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold">Promotions</h1>
          </div>
          <p className="text-muted-foreground">
            Profitez de nos meilleures offres - {promotionProducts.length} produit
            {promotionProducts.length > 1 ? "s" : ""} en promotion
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : promotionProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">Aucune promotion disponible pour le moment</p>
            <p className="text-sm text-muted-foreground">Revenez bientôt pour découvrir nos offres !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {promotionProducts.map((product, index) => (
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
