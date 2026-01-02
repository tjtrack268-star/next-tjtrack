"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { Spinner } from "@/components/ui/spinner"
import { useCategories } from "@/hooks/use-api"
import { Package } from "lucide-react"

export default function CategoriesPage() {
  const { data: apiCategories, isLoading } = useCategories()
  const categories = (apiCategories || []) as {
    id: number
    code?: string
    designation: string
    nombreArticles?: number
  }[]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Catégories</h1>
          <p className="text-muted-foreground">Explorez nos produits par catégorie</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune catégorie disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalogue?categorie=${category.id}`}
                className="glass-card p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{category.designation}</h3>
                    {category.nombreArticles !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {category.nombreArticles} produit{category.nombreArticles > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
