"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Trash2, Loader2, Search, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useCatalogue } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Produit {
  id: number
  designation: string
  prixVente: number
  imageUrl?: string
  categorie?: string
  stock: number
}

export default function FavorisPage() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // For now, we'll use the catalogue and filter client-side
  // In production, this would be a dedicated favorites API endpoint
  const { data: catalogueData, isLoading, error, refetch } = useCatalogue()

  // Mock favorites - in production this would come from a user favorites API
  const [favoriteIds, setFavoriteIds] = useState<number[]>([1, 3, 5, 7])

  const produits: Produit[] = ((catalogueData as { data?: unknown[] })?.data || catalogueData || [])
    .filter((p: unknown) => {
      const prod = p as Record<string, unknown>
      return favoriteIds.includes(prod.id as number)
    })
    .map((p: unknown) => {
      const prod = p as Record<string, unknown>
      return {
        id: (prod.id as number) || 0,
        designation: (prod.designation as string) || (prod.nom as string) || "Produit",
        prixVente: (prod.prixVente as number) || (prod.prix as number) || 0,
        imageUrl: prod.imageUrl as string,
        categorie: (prod.categorie as string) || (prod.categorieNom as string),
        stock: (prod.quantiteStock as number) || (prod.stock as number) || 0,
      }
    })

  const filteredProduits = produits.filter((p) => p.designation.toLowerCase().includes(search.toLowerCase()))

  const handleRemoveFavorite = (id: number) => {
    setFavoriteIds((prev) => prev.filter((fid) => fid !== id))
    toast({
      title: "Retiré des favoris",
      description: "Le produit a été retiré de vos favoris",
    })
  }

  const handleAddToCart = (produit: Produit) => {
    addItem({
      id: produit.id,
      name: produit.designation,
      price: produit.prixVente,
      quantity: 1,
      image: produit.imageUrl,
    })
    toast({
      title: "Ajouté au panier",
      description: `${produit.designation} a été ajouté à votre panier`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Erreur lors du chargement des favoris</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Mes Favoris
          </h1>
          <p className="text-muted-foreground">{filteredProduits.length} produit(s) dans vos favoris</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans vos favoris..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products */}
      {filteredProduits.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun favori</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Vous n'avez pas encore de produits favoris. Explorez notre catalogue et ajoutez vos produits préférés.
            </p>
            <Button className="mt-4" asChild>
              <a href="/catalogue">Voir le catalogue</a>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProduits.map((produit) => (
            <Card key={produit.id} className="glass-card group overflow-hidden">
              <div className="aspect-square relative bg-muted/30">
                {produit.imageUrl ? (
                  <Image
                    src={produit.imageUrl || "/placeholder.svg"}
                    alt={produit.designation}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground">📦</span>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveFavorite(produit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                {produit.categorie && (
                  <Badge variant="secondary" className="mb-2">
                    {produit.categorie}
                  </Badge>
                )}
                <h3 className="font-medium truncate">{produit.designation}</h3>
                <p className="text-lg font-bold text-primary mt-1">{produit.prixVente.toLocaleString("fr-FR")} XAF</p>
                <p className="text-sm text-muted-foreground">
                  {produit.stock > 0 ? `${produit.stock} en stock` : "Rupture de stock"}
                </p>
                <Button className="w-full mt-3" disabled={produit.stock === 0} onClick={() => handleAddToCart(produit)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProduits.map((produit) => (
            <Card key={produit.id} className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted/30 flex-shrink-0 overflow-hidden relative">
                  {produit.imageUrl ? (
                    <Image
                      src={produit.imageUrl || "/placeholder.svg"}
                      alt={produit.designation}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{produit.designation}</h3>
                  {produit.categorie && (
                    <Badge variant="secondary" className="mt-1">
                      {produit.categorie}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {produit.stock > 0 ? `${produit.stock} en stock` : "Rupture de stock"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{produit.prixVente.toLocaleString("fr-FR")} XAF</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="icon" onClick={() => handleRemoveFavorite(produit.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button size="sm" disabled={produit.stock === 0} onClick={() => handleAddToCart(produit)}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
