"use client"

import { useState, useMemo } from "react"
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ProductCard } from "@/components/cards/product-card"
import { Spinner } from "@/components/ui/spinner"
import { useCatalogue, useCategories } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import type { ArticleDto } from "@/types/api"

export default function CataloguePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [sortBy, setSortBy] = useState("designation")
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [inStockOnly, setInStockOnly] = useState(false)

  const {
    data: apiProducts,
    isLoading: isLoadingProducts,
    error,
  } = useCatalogue({
    search: searchQuery,
    sortBy,
  })

  const { data: apiCategories, isLoading: isLoadingCategories } = useCategories()

  const products: ArticleDto[] = (apiProducts || []) as ArticleDto[]
  const categories = (apiCategories || []) as {
    id: number
    code?: string
    designation: string
    nombreArticles?: number
  }[]
  const isLoading = isLoadingProducts || isLoadingCategories

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchQuery && !product.designation.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.categorieId || 0)) {
        return false
      }
      // Price filter
      const price = product.prixUnitaireTtc || product.prixUnitaireHt || 0
      if (price < priceRange[0] || price > priceRange[1]) {
        return false
      }
      // Stock filter
      if (inStockOnly && (product.quantiteStock || 0) <= 0) {
        return false
      }
      return true
    })
  }, [products, searchQuery, selectedCategories, priceRange, inStockOnly])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    switch (sortBy) {
      case "designation":
        return sorted.sort((a, b) => a.designation.localeCompare(b.designation))
      case "-designation":
        return sorted.sort((a, b) => b.designation.localeCompare(a.designation))
      case "prixUnitaireTtc":
        return sorted.sort((a, b) => (a.prixUnitaireTtc || 0) - (b.prixUnitaireTtc || 0))
      case "-prixUnitaireTtc":
        return sorted.sort((a, b) => (b.prixUnitaireTtc || 0) - (a.prixUnitaireTtc || 0))
      default:
        return sorted
    }
  }, [filteredProducts, sortBy])

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 2000000])
    setInStockOnly(false)
    setSortBy("designation")
  }

  const activeFiltersCount =
    selectedCategories.length + (inStockOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 2000000 ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Catalogue</h1>
          <p className="text-muted-foreground">Découvrez notre sélection de {sortedProducts.length} produits</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-0"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-secondary/50 border-0">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="designation">Nom (A-Z)</SelectItem>
                <SelectItem value="-designation">Nom (Z-A)</SelectItem>
                <SelectItem value="prixUnitaireTtc">Prix croissant</SelectItem>
                <SelectItem value="-prixUnitaireTtc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative bg-transparent">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium mb-3">Catégories</h3>
                    <div className="space-y-2">
                      {categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune catégorie disponible</p>
                      ) : (
                        categories.map((category) => (
                          <div key={category.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`cat-${category.id}`}
                              checked={selectedCategories.includes(category.id!)}
                              onCheckedChange={() => toggleCategory(category.id!)}
                            />
                            <Label htmlFor={`cat-${category.id}`} className="flex-1 cursor-pointer">
                              {category.designation}
                            </Label>
                            {category.nombreArticles !== undefined && (
                              <span className="text-xs text-muted-foreground">({category.nombreArticles})</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-3">Prix</h3>
                    <div className="space-y-4">
                      <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={2000000} step={10000} />
                      <div className="flex items-center justify-between text-sm">
                        <span>{priceRange[0].toLocaleString()} FCFA</span>
                        <span>{priceRange[1].toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="in-stock"
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                    />
                    <Label htmlFor="in-stock" className="cursor-pointer">
                      En stock uniquement
                    </Label>
                  </div>

                  {/* Clear Filters */}
                  <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Effacer les filtres
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* View Mode */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map((catId) => {
              const cat = categories.find((c) => c.id === catId)
              return cat ? (
                <Badge
                  key={catId}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => toggleCategory(catId)}
                >
                  {cat.designation}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ) : null
            })}
            {inStockOnly && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setInStockOnly(false)}
              >
                En stock
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 2000000) && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setPriceRange([0, 2000000])}
              >
                {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Erreur lors du chargement des produits</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {products.length === 0
                ? "Aucun produit disponible dans le catalogue"
                : "Aucun produit ne correspond à vos critères"}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
            )}
          >
            {sortedProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard product={product} variant={viewMode === "list" ? "horizontal" : "default"} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
