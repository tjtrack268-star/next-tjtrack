"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Store
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"
import { ProductSidebar } from "@/components/layout/product-sidebar"
import { apiClient } from "@/lib/api"
import type { ProduitDetailDto, ProduitEcommerceDto } from "@/types/api"

function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["productDetail", id],
    queryFn: () => apiClient.get<ProduitDetailDto>(`/catalogue/produits/${id}`),
    enabled: !!id,
  })
}

function useRelatedProducts(categoryId: number, currentId: number) {
  return useQuery({
    queryKey: ["relatedProducts", categoryId, currentId],
    queryFn: () => apiClient.get<ProduitEcommerceDto[]>(`/ecommerce/produits/categorie/${categoryId}`),
    enabled: !!categoryId,
  })
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  
  const productId = params.id as string
  const { data: product, isLoading, error } = useProductDetail(productId)
  const { data: relatedProducts } = useRelatedProducts(product?.categorieId || 0, parseInt(productId))
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      await addItem(product.id, quantity, {
        name: product.nom,
        price: product.prix,
        image: product.images[0] || "/placeholder.svg",
      })
      toast({
        title: "Ajouté au panier",
        description: `${quantity} x ${product.nom} ajouté(s) au panier`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter au panier",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      description: product?.nom,
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.nom,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copié",
        description: "Le lien du produit a été copié dans le presse-papiers",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Button onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    )
  }

  const images = product.images || ["/placeholder.svg"]
  const relatedProductsFiltered = relatedProducts?.filter(p => p.id !== product.id).slice(0, 4) || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            Accueil
          </Button>
          <ChevronRight className="h-4 w-4" />
          <Button variant="ghost" size="sm" onClick={() => router.push("/catalogue")}>
            Catalogue
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span>{product.categorieNom}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.nom}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={image} alt={`${product.nom} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.categorieNom}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.nom}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.noteMoyenne || 0}</span>
                  <span className="text-muted-foreground">({product.nombreEvaluations || 0} avis)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-muted-foreground">{product.nombreVentes || 0} vendus</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{formatPrice(product.prix)}</span>
                {product.prixOriginal && product.prixOriginal > product.prix && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.prixOriginal)}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${product.enStock ? "bg-green-500" : "bg-red-500"}`} />
              <span className={product.enStock ? "text-green-600" : "text-red-600"}>
                {product.enStock ? `En stock (${product.quantiteDisponible} disponibles)` : "Rupture de stock"}
              </span>
            </div>

            {/* Quantity & Actions */}
            {product.enStock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Quantité:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.quantiteDisponible, quantity + 1))}
                      disabled={quantity >= product.quantiteDisponible}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleAddToCart} className="flex-1" size="lg">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ajouter au panier
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleToggleFavorite}>
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Merchant Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <Store className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.commercant.entreprise}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Par {product.commercant.nom}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.commercant.ville}
                      </div>
                      {product.commercant.noteCommercant && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {product.commercant.noteCommercant}
                        </div>
                      )}
                      <span>{product.commercant.nombreVentes || 0} ventes</span>
                    </div>
                    {product.commercant.telephone && (
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {product.commercant.telephone}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Livraison rapide</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>Retour 14 jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({product.nombreEvaluations || 0})</TabsTrigger>
            <TabsTrigger value="shipping">Livraison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p>{product.descriptionLongue || product.description}</p>
                  {product.motsCles && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Mots-clés:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.motsCles.split(",").map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {product.evaluations && product.evaluations.length > 0 ? (
                  <div className="space-y-6">
                    {product.evaluations.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{review.nomClient}</h4>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.note ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.dateEvaluation).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.commentaire}</p>
                        {review.recommande && (
                          <Badge variant="secondary" className="mt-2">
                            Recommandé
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Aucun avis pour ce produit</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Options de livraison</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Livraison standard: 2-5 jours ouvrés</li>
                      <li>• Livraison express: 1-2 jours ouvrés</li>
                      <li>• Retrait en magasin: Disponible</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Frais de livraison</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Gratuite à partir de 50 000 XAF</li>
                      <li>• Standard: 2 500 XAF</li>
                      <li>• Express: 5 000 XAF</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProductsFiltered.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProductsFiltered.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/produit/${relatedProduct.id}`)}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={relatedProduct.images?.[0] || "/placeholder.svg"}
                      alt={relatedProduct.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-2 mb-2">{relatedProduct.nom}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{relatedProduct.noteMoyenne || 0}</span>
                    </div>
                    <p className="font-bold text-primary">{formatPrice(relatedProduct.prix || 0)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
          </div>

          {/* Sidebar */}
          <ProductSidebar />
        </div>
      </div>
    </div>
  )
}