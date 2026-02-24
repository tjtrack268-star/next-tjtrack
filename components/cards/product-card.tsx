"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"
import { buildImageUrl } from "@/lib/image-utils"
import type { ArticleDto, ProduitEcommerceDto } from "@/types/api"

interface ProductCardProps {
  product: ArticleDto | ProduitEcommerceDto
  variant?: "default" | "compact" | "horizontal"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { addItem, openCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const isArticle = "codeArticle" in product

  // CRITICAL: For ProduitEcommerceDto, use articleId (not id which is produits_ecommerce.id)
  const id = isArticle ? (product.id || 0) : (product.articleId || product.id || 0)
  const produitId = isArticle ? (product.id || 0) : (product.id || 0)
  const isLiked = !isArticle && isFavorite(produitId)
  const name = isArticle ? product.designation : product.nom
  const price = isArticle ? product.prixUnitaireTtc || product.prixUnitaireHt : product.prix
  const image = buildImageUrl(isArticle ? product.photo : product.images?.[0])
  const displayImage = imageError ? "/placeholder.svg?height=300&width=300&query=product" : (image || "/placeholder.svg?height=300&width=300&query=product")
  const category = isArticle ? product.categorieDesignation : product.categorieName
  const inStock = isArticle ? (product.quantiteStock || 0) > 0 : (product.quantite || 0) > 0
  const stockCount = isArticle ? product.quantiteStock : product.quantite
  const rating = !isArticle ? product.noteMoyenne : undefined
  const reviews = !isArticle ? product.nombreEvaluations : undefined

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!inStock) {
      return
    }

    try {
      await addItem({
        articleId: id,
        articleCode: isArticle ? product.codeArticle : String(id),
        articleNom: name,
        articlePhoto: image || undefined,
        quantite: 1,
        prixUnitaire: price,
        sousTotal: price,
        stockDisponible: stockCount || 0,
        disponible: inStock,
      })
      openCart()
    } catch (error) {
      console.error('Erreur ajout au panier:', error)
      // L'erreur sera affichée par le toast du contexte
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isArticle) {
      console.log('💗 ProductCard handleLike:', { produitId, productName: name })
      toggleFavorite(produitId)
    }
  }

  if (variant === "horizontal") {
    return (
      <Card className="glass-card hover-lift overflow-hidden">
        <Link href={`/produit/${id}`} className="flex">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="128px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                {category && (
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {category}
                  </Badge>
                )}
                <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
                {rating !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-xs text-muted-foreground">
                      {rating.toFixed(1)} ({reviews})
                    </span>
                  </div>
                )}
              </div>
              <p className="text-lg font-bold text-primary">{price.toLocaleString()} FCFA</p>
            </div>
          </CardContent>
        </Link>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "group glass-card hover-lift overflow-hidden transition-all duration-300",
        variant === "compact" && "h-full",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/produit/${id}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          <Image
            src={displayImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className={cn("object-cover transition-transform duration-500", isHovered && "scale-110")}
            onError={() => setImageError(true)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!inStock && <Badge variant="destructive">Rupture</Badge>}
            {isArticle && product.stockFaible && inStock && (
              <Badge className="bg-warning text-warning-foreground">Stock faible</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className={cn(
              "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
            )}
          >
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
              onClick={handleLike}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-destructive text-destructive")} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Overlay */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <Button
              className="w-full gradient-primary text-white font-medium"
              size="sm"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter au panier
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {category && (
            <Badge variant="outline" className="mb-2 text-xs font-normal border-primary/30 text-primary">
              {category}
            </Badge>
          )}

          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {rating !== undefined && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(rating) ? "fill-warning text-warning" : "fill-muted text-muted",
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <p className="text-lg font-bold text-primary">
              {price.toLocaleString()} <span className="text-xs font-normal">FCFA</span>
            </p>
            {stockCount !== undefined && stockCount > 0 && stockCount <= 10 && (
              <span className="text-xs text-muted-foreground">Plus que {stockCount}</span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
