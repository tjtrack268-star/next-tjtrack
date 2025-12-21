"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Heart, 
  Share2, 
  Star, 
  ShoppingCart, 
  Minus, 
  Plus, 
  MapPin, 
  Truck, 
  Shield, 
  Eye,
  ThumbsUp,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Clock
} from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { ProduitEcommerceDto } from "@/types/api"

interface ProductModalProps {
  product: ProduitEcommerceDto | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  if (!product) return null

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"
  
  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]

  const handleAddToCart = async () => {
    try {
      await addItem(product.id!, quantity, {
        name: product.nom!,
        price: Number(product.prix || 0),
        image: images[0],
      })
      toast({
        title: "Ajouté au panier",
        description: `${quantity}x ${product.nom} ajouté(s) à votre panier`,
      })
    } catch (error: any) {
      console.error('Erreur ajout panier:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter au panier",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nom,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        navigator.clipboard.writeText(window.location.href)
        toast({ title: "Lien copié dans le presse-papiers" })
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: "Lien copié dans le presse-papiers" })
    }
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Images Section */}
          <div className="relative bg-muted/30">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.nombreVentes && product.nombreVentes > 10 && (
                  <Badge className="bg-green-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
                {product.noteMoyenne && Number(product.noteMoyenne) >= 4.5 && (
                  <Badge className="bg-yellow-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Top Rated
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.nom} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">
                    {product.categorieName}
                  </Badge>
                  <DialogTitle className="text-2xl font-bold leading-tight">
                    {product.nom}
                  </DialogTitle>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.noteMoyenne || 0}</span>
                  <span className="text-muted-foreground">({product.nombreEvaluations || 0} avis)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{(product.nombreVues || 0).toLocaleString()} vues</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{product.nombreLikes || 0} likes</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(Number(product.prix || 0))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prix TTC, livraison non incluse
                </p>
              </div>
            </DialogHeader>

            <Separator className="my-6" />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.quantite || 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.quantite} en stock
                </span>
              </div>

              <Button
                size="lg"
                className="w-full gradient-primary text-white"
                onClick={handleAddToCart}
                disabled={!product.quantite || product.quantite <= 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au panier - {formatPrice(Number(product.prix || 0) * quantity)}
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Seller Info */}
            <Card className="bg-muted/30 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.nomEntreprise || product.nomCommercant}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{product.villeCommercant}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir le profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            {/* Delivery & Services */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Livraison estimée: 2-5 jours ouvrés</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Garantie vendeur 30 jours</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>Retour gratuit sous 14 jours</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Tabs for Details */}
            <Tabs defaultValue="description" className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
                <TabsTrigger value="reviews">Avis ({product.nombreEvaluations || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.descriptionLongue || product.description || "Aucune description disponible."}
                  </p>
                </div>
                
                {product.motsCles && (
                  <div>
                    <h4 className="font-medium mb-2">Mots-clés</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.motsCles.split(',').map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="specs" className="mt-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Catégorie:</span>
                    <span>{product.categorieName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Stock disponible:</span>
                    <span>{product.quantite} unités</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Vendeur:</span>
                    <span>{product.nomEntreprise || product.nomCommercant}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Localisation:</span>
                    <span>{product.villeCommercant}</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{product.noteMoyenne || 0}</div>
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Number(product.noteMoyenne || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.nombreEvaluations || 0} avis
                      </div>
                    </div>
                  </div>
                  
                  {(!product.nombreEvaluations || product.nombreEvaluations === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun avis pour le moment</p>
                      <p className="text-sm">Soyez le premier à laisser un avis !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Card className="border-0 bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">U</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">Utilisateur</span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Excellent produit, conforme à la description. Livraison rapide.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}