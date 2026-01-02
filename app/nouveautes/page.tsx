"use client"

import { useMemo } from "react"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ProductCard } from "@/components/cards/product-card"
import { Spinner } from "@/components/ui/spinner"
import { useCatalogue } from "@/hooks/use-api"
import { Sparkles } from "lucide-react"
import type { ProduitEcommerceDto } from "@/types/api"

export default function NouveautesPage() {
  const { data: apiProducts, isLoading } = useCatalogue({})
  const products: ProduitEcommerceDto[] = (apiProducts || []) as ProduitEcommerceDto[]

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

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
