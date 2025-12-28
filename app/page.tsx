"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  ShoppingCart,
  ChevronDown,
  Heart,
  SlidersHorizontal,
  Star,
  Eye,
  Sparkles,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { buildImageUrl } from "@/lib/image-utils"
import type { ProduitEcommerceDto } from "@/types/api"
import { CheckoutModal } from "@/components/checkout/checkout-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { useRouter } from "next/navigation"

// Hook pour récupérer les produits e-commerce
function useEcommerceProducts() {
  return useQuery({
    queryKey: ["ecommerceProducts"],
    queryFn: () => apiClient.get<ProduitEcommerceDto[]>("/ecommerce/produits"),
  })
}

const categories = ["Tous", "Électronique", "Mode", "Maison", "Sport", "Auto", "Beauté"]
const cities = ["Toutes", "Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda"]

export default function HomePage() {
  const { totalItems, addItem, openCart } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { data: apiProducts, isLoading, error } = useEcommerceProducts()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  console.log('HomePage - Auth state:', { user: user ? 'logged in' : 'not logged in', isAuthenticated })
  
  const products = apiProducts || []

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [selectedCity, setSelectedCity] = useState("Toutes")
  const [sortBy, setSortBy] = useState("pertinence")
  const [visibleProducts, setVisibleProducts] = useState(8)

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categorieName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tous" || product.categorieName === selectedCategory
    const matchesPriceMin = !priceMin || (product.prix && Number(product.prix) >= Number.parseInt(priceMin))
    const matchesPriceMax = !priceMax || (product.prix && Number(product.prix) <= Number.parseInt(priceMax))
    return matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "prix-asc":
        return Number(a.prix || 0) - Number(b.prix || 0)
      case "prix-desc":
        return Number(b.prix || 0) - Number(a.prix || 0)
      case "popularite":
        return (b.nombreLikes || 0) - (a.nombreLikes || 0)
      default:
        return 0
    }
  })

  const displayedProducts = sortedProducts.slice(0, visibleProducts)

  const handleAddToCart = async (product: ProduitEcommerceDto) => {
    try {
      const articleId = product.articleId || product.id!
      await addItem(articleId, 1, {
        name: product.nom!,
        price: Number(product.prix || 0),
        image: buildImageUrl(product.images?.[0]) || "/placeholder.svg",
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

  const handleLoadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 4, sortedProducts.length))
  }

  const handleProductClick = (product: ProduitEcommerceDto) => {
    router.push(`/produit/${product.id}`)
  }

  const ProductCard = ({ product }: { product: ProduitEcommerceDto }) => (
    <Card 
      className="group glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onClick={() => handleProductClick(product)}
    >
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        <img
          src={buildImageUrl(product.images?.[0]) || "/placeholder.svg"}
          alt={product.nom || "Produit"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
          <Heart className="h-4 w-4" />
        </Button>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            className="w-full gradient-primary text-white"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart(product)
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.categorieName}</p>
        <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.nom}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{product.noteMoyenne || 0}</span>
          <span className="text-xs text-muted-foreground">({product.nombreEvaluations || 0})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{formatPrice(Number(product.prix || 0))}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Vendu par {product.nomEntreprise || product.nomCommercant}</p>
      </CardContent>
    </Card>
  )

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Navigation</h3>
        <div className="space-y-2">
          <Link href="/catalogue" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            Catalogue
          </Link>
          <Link href="/categories" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            Catégories
          </Link>
          <Link href="/promotions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            Promotions
          </Link>
          <Link href="/nouveautes" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            Nouveautés
          </Link>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Catégories</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Prix</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="text-sm"
            />
          </div>
          <Button size="sm" variant="secondary">
            Go
          </Button>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Vendeur</h3>
        <Input placeholder="Nom du vendeur" className="text-sm" />
        <Button size="sm" variant="secondary" className="mt-2 w-full">
          Go
        </Button>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Localisation</h3>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-primary text-primary-foreground accordion-up py-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-4">Livraison gratuite à partir de 50 000 XAF</span>
          <span className="mx-4">•</span>
          <span className="mx-4">Nouveaux produits chaque semaine</span>
          <span className="mx-4">•</span>
          <span className="mx-4">Paiement sécurisé</span>
          <span className="mx-4">•</span>
          <span className="mx-4">Service client 24/7</span>
        </div>
      </div>

      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-3 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="glass-card sticky top-32">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-4 w-4" />
                  <h2 className="font-semibold">Filtres</h2>
                </div>
                <FilterSidebar />
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort & Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""} trouvé
                {sortedProducts.length > 1 ? "s" : ""}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pertinence">Pertinence</SelectItem>
                  <SelectItem value="prix-asc">Prix croissant</SelectItem>
                  <SelectItem value="prix-desc">Prix décroissant</SelectItem>
                  <SelectItem value="popularite">Popularité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
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
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun produit disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {visibleProducts < sortedProducts.length && (
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" className="px-8 bg-transparent" onClick={handleLoadMore}>
                  Voir plus de produits ({sortedProducts.length - visibleProducts} restants)
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Featured/Ads */}
          <aside className="hidden xl:block w-72 shrink-0">
            <Card className="glass-card sticky top-32">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">Produits en avant</h2>
                </div>

                {/* Promo Banner */}
                <div className="relative rounded-lg overflow-hidden mb-4 bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
                  <div className="relative z-10">
                    <Badge className="bg-white/20 mb-2">Promo</Badge>
                    <p className="font-bold">Soldes d'été</p>
                    <p className="text-2xl font-bold">-50%</p>
                    <p className="text-xs opacity-80">Sur une sélection</p>
                  </div>
                </div>

                {/* Featured Products */}
                <div className="space-y-3">
                  {products.slice(0, 4).map((product, idx) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <span className="text-lg font-bold text-muted-foreground w-5">{idx + 1}</span>
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.nom || "Produit"}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Badge className="bg-primary text-white text-xs mb-1">Populaire</Badge>
                        <p className="text-sm font-medium truncate">{product.nom}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{formatPrice(Number(product.prix || 0))}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {(product.nombreVues || 0).toLocaleString()} vues
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href={isAuthenticated ? "/dashboard/merchant/publicite" : "/connexion"}>
                  <Button className="w-full mt-4 gradient-primary text-white">
                    Mettre mon produit en avant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>

                <Card className="mt-4 bg-muted/30 border-0">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">Publicité</p>
                    <p className="text-sm text-muted-foreground">
                      Boostez la visibilité de vos produits avec nos options de mise en avant.
                    </p>
                    <Link
                      href="/dashboard/merchant/publicite"
                      className="text-xs text-primary hover:underline mt-2 inline-block"
                    >
                      En savoir plus →
                    </Link>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gradient-to-b from-primary to-primary/80 text-white dark:from-primary dark:to-primary/80">
        <div className="container mx-auto px-2 sm:px-3 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Objet de l'aide</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="hover:text-white cursor-pointer transition-colors">Paiements</li>
                <li className="hover:text-white cursor-pointer transition-colors">Expédition</li>
                <li className="hover:text-white cursor-pointer transition-colors">Annulation et retour</li>
                <li className="hover:text-white cursor-pointer transition-colors">Signaler un acquisi</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Votre édition de lien</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="hover:text-white cursor-pointer transition-colors">Point relais</li>
                <li className="hover:text-white cursor-pointer transition-colors">Information d'achat</li>
                <li className="hover:text-white cursor-pointer transition-colors">Politique de livraison</li>
                <li className="hover:text-white cursor-pointer transition-colors">Vérifier le statut de livraison</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Programme partenaire</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <Link href="/inscription">
                  <li className="hover:text-white cursor-pointer transition-colors">Devenir vendeur</li>
                </Link>
                <li className="hover:text-white cursor-pointer transition-colors">Ouverture vitrine</li>
                <Link href="/inscription">
                  <li className="hover:text-white cursor-pointer transition-colors">Devenir partenaire</li>
                </Link>
                <li className="hover:text-white cursor-pointer transition-colors">Faire de la publicité</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Mentions légales</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="hover:text-white cursor-pointer transition-colors">Politique de retour</li>
                <li className="hover:text-white cursor-pointer transition-colors">Conditions d'utilisation</li>
                <li className="hover:text-white cursor-pointer transition-colors">Sécurité</li>
                <li className="hover:text-white cursor-pointer transition-colors">Politique de confidentialité</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo_tjtrack.jpg"
                alt="TJ-Track Logo"
                width={32}
                height={32}
                className="rounded bg-white p-1 object-contain"
              />
              <span className="font-bold text-xl">TRACK</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">CB</span>
              </div>
              <img src="/mastercard-logo.png" alt="Mastercard" className="h-8" />
              <img src="/visa-logo-generic.png" alt="Visa" className="h-8" />
              <div className="h-8 w-16 bg-yellow-400 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-primary">E-CARD</span>
              </div>
              <img src="/apple-pay-logo.png" alt="Apple Pay" className="h-8" />
              <img src="/paypal-logo.png" alt="PayPal" className="h-8" />
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  )
}
