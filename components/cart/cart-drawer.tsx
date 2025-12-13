"use client"

import Image from "next/image"
import Link from "next/link"
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface CartDrawerProps {
  onCheckout?: () => void
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isOpen, isLoading, closeCart, totalItems, totalAmount, updateQuantity, removeItem, clearCart } =
    useCart()
  const { isAuthenticated } = useAuth()

  const shippingCost = totalAmount > 50000 ? 0 : 2500
  const finalTotal = totalAmount + shippingCost

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg glass-card p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Mon Panier
              {totalItems > 0 && <Badge className="bg-primary text-primary-foreground">{totalItems}</Badge>}
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={clearCart}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Vider
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Votre panier est vide</h3>
            <p className="text-muted-foreground mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
            <Button asChild className="gradient-primary text-white" onClick={closeCart}>
              <Link href="/">
                Parcourir le catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.articleId}
                    className={cn("animate-fade-in flex gap-4 p-3 rounded-xl bg-secondary/30")}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <Image
                        src={item.articlePhoto || "/placeholder.svg?height=80&width=80&query=product"}
                        alt={item.articleNom || "Produit"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{item.articleNom}</h4>
                          <p className="text-xs text-muted-foreground">{item.prixUnitaire?.toLocaleString()} FCFA</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.articleId!)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.articleId!, item.quantite! - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantite}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.articleId!, item.quantite! + 1)}
                            disabled={
                              isLoading ||
                              (item.stockDisponible !== undefined && item.quantite! >= item.stockDisponible)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-semibold text-primary">{item.sousTotal?.toLocaleString()} FCFA</p>
                      </div>

                      {item.disponible === false && (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          Stock insuffisant
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border p-6 space-y-4 bg-card/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{totalAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className={cn(shippingCost === 0 && "text-green-500 font-medium")}>
                    {shippingCost === 0 ? "Gratuite" : `${shippingCost.toLocaleString()} FCFA`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground">Livraison gratuite à partir de 50 000 FCFA</p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{finalTotal.toLocaleString()} FCFA</span>
              </div>

              <div className="space-y-2">
                {isAuthenticated ? (
                  <Button 
                    className="w-full gradient-primary text-white" 
                    size="lg"
                    onClick={() => {
                      closeCart()
                      onCheckout?.()
                    }}
                  >
                    Commander
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild className="w-full gradient-primary text-white" size="lg">
                    <Link href="/connexion" onClick={closeCart}>
                      Se connecter pour commander
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={closeCart}>
                  Continuer mes achats
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
