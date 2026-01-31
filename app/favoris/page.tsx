"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Heart, ShoppingCart, Trash2, Star, Eye, Grid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"
import { apiClient } from "@/lib/api"
import type { ProduitEcommerceDto } from "@/types/api"

function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiClient.get<ProduitEcommerceDto[]>("/ecommerce/favoris"),
  })
}

export default function FavoritesPage() {
  const { toast } = useToast()
  const { addItem } = useCart()
  const { data: favorites, isLoading, error, refetch } = useFavorites()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const handleAddToCart = async (product: ProduitEcommerceDto) => {
    try {
      await addItem(product.id!, 1, {
        name: product.nom!,
        price: Number(product.prix || 0),
        image: product.images?.[0] || "/placeholder.svg",
      })
      toast({
        title: "Ajouté au panier",
        description: `${product.nom} a été ajouté à votre panier`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter au panier",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFromFavorites = async (productId: number) => {
    try {
      await apiClient.delete(`/ecommerce/favoris/${productId}`)
      toast({
        title: "Retiré des favoris",
        description: "Le produit a été retiré de vos favoris",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive",
      })
    }
  }

  const handleViewProduct = (productId: number) => {
    window.location.href = `/produit/${productId}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  const ProductGridCard = ({ product }: { product: ProduitEcommerceDto }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.nom || "Produit"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => handleRemoveFromFavorites(product.id!)}
        >
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </Button>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-white text-black hover:bg-white/90"
              onClick={() => handleViewProduct(product.id!)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleAddToCart(product)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Panier
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.categorieName}</p>
        <h3 className="font-medium line-clamp-2 mb-2">{product.nom}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{product.noteMoyenne || 0}</span>
          <span className="text-xs text-muted-foreground">({product.nombreEvaluations || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary">{formatPrice(Number(product.prix || 0))}</span>
          <Badge variant="secondary" className="text-xs">
            {product.nombreVentes || 0} vendus
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {product.nomEntreprise || product.nomCommercant}
        </p>
      </CardContent>
    </Card>
  )

  const ProductListCard = ({ product }: { product: ProduitEcommerceDto }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.nom || "Produit"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {product.categorieName}
              </Badge>
              <h3 className="font-semibold text-lg line-clamp-2">{product.nom}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.noteMoyenne || 0}</span>
                <span className="text-muted-foreground">({product.nombreEvaluations || 0} avis)</span>
              </div>
              <Badge variant="outline">
                {product.nombreVentes || 0} vendus
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(Number(product.prix || 0))}
                </span>
                <p className="text-sm text-muted-foreground">
                  Par {product.nomEntreprise || product.nomCommercant}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProduct(product.id!)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromFavorites(product.id!)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes favoris</h1>
            <p className="text-muted-foreground">
              {favorites?.length || 0} produit{(favorites?.length || 0) > 1 ? "s" : ""} dans vos favoris
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!favorites || favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
              <p className="text-muted-foreground text-center mb-4">
                Vous n'avez pas encore ajouté de produits à vos favoris.
                Parcourez notre catalogue et cliquez sur le cœur pour ajouter vos produits préférés.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Découvrir nos produits
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              : "space-y-4"
          }>
            {favorites.map((product) => (
              viewMode === "grid" ? (
                <ProductGridCard key={product.id} product={product} />
              ) : (
                <ProductListCard key={product.id} product={product} />
              )
            ))}
          </div>
        )}

        {favorites && favorites.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => {
                favorites.forEach(product => handleAddToCart(product))
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Tout ajouter au panier
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
