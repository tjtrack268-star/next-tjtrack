"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { ProductSidebar } from "@/components/layout/product-sidebar"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useCreerCommande } from "@/hooks/use-api"
import { StaticLocationSelector } from "@/components/ui/static-location-selector"
import { Truck, User, Mail, Phone, CreditCard, DollarSign, CheckCircle2, Loader2, ShieldCheck, Package } from "lucide-react"
import { apiClient } from "@/lib/api"

interface DeliveryQuoteResponse {
  coutLivraison?: number
  distanceKm?: number
  delaiJours?: number
  gratuit?: boolean
}

const FALLBACK_MIN_DELIVERY = 2500
const FALLBACK_INSURANCE_PERCENT = 1.5
const FALLBACK_INSURANCE_MIN = 200
const FALLBACK_INSURANCE_MAX = 15000

function computeFallbackShipping(totalAmount: number) {
  const safeAmount = Number.isFinite(totalAmount) ? Math.max(totalAmount, 0) : 0
  const insuranceRaw = Math.round((safeAmount * FALLBACK_INSURANCE_PERCENT) / 100)
  const insurance = Math.min(FALLBACK_INSURANCE_MAX, Math.max(FALLBACK_INSURANCE_MIN, insuranceRaw))
  const estimated = 2000 + insurance
  return Math.max(FALLBACK_MIN_DELIVERY, estimated)
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { mutate: creerCommande, isPending: isCreatingOrder } = useCreerCommande()

  const [guestId, setGuestId] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
    }
  }, [items.length, router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        const stored = localStorage.getItem('guestId')
        if (stored) {
          setGuestId(stored)
        } else {
          const newGuestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem('guestId', newGuestId)
          setGuestId(newGuestId)
        }
      }
    }
  }, [isAuthenticated])

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    email: user?.email ?? "",
    phone: user?.phoneNumber ?? "",
    city: user?.town ?? "Douala",
    address: user?.address ?? "",
    postalCode: "",
    paymentMethod: "cash",
    phoneNumberPayment: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingDistanceKm, setShippingDistanceKm] = useState<number | null>(null)
  const [shippingDelayDays, setShippingDelayDays] = useState<number | null>(null)
  const [isShippingLoading, setIsShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis"
    if (!formData.city) newErrors.city = "La ville est requise"
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev
        return rest
      })
    }
  }

  const finalTotal = totalAmount + shippingCost

  useEffect(() => {
    if (!formData.city) return

    let isCancelled = false
    const fallbackShipping = computeFallbackShipping(totalAmount)

    const runQuote = async () => {
      setIsShippingLoading(true)
      setShippingError(null)
      try {
        const quote = await apiClient.post<DeliveryQuoteResponse>("/delivery/tarifs/quote", {
          villeArrivee: formData.city,
          quartierArrivee: formData.address || undefined,
          articleIds: items.map(item => item.articleId).filter((id): id is number => typeof id === "number"),
          typeLivraison: "STANDARD",
          montantCommande: totalAmount,
        })

        if (isCancelled) return

        const quoteCost = Number(quote?.coutLivraison)
        const resolvedCost = Number.isFinite(quoteCost) && quoteCost >= 0 ? quoteCost : fallbackShipping
        setShippingCost(resolvedCost)
        setShippingDistanceKm(typeof quote?.distanceKm === "number" ? quote.distanceKm : null)
        setShippingDelayDays(typeof quote?.delaiJours === "number" ? quote.delaiJours : null)
      } catch (error) {
        if (isCancelled) return
        console.warn("Erreur calcul livraison, fallback appliqué", error)
        setShippingError("Tarif estimé (calcul exact indisponible)")
        setShippingCost(fallbackShipping)
        setShippingDistanceKm(null)
        setShippingDelayDays(null)
      } finally {
        if (!isCancelled) {
          setIsShippingLoading(false)
        }
      }
    }

    runQuote()
    return () => {
      isCancelled = true
    }
  }, [formData.address, formData.city, items, totalAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (items.length === 0) {
      toast({ title: "Erreur", description: "Votre panier est vide", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    try {
      // Nettoyer et valider les items
      console.log('=== CHECKOUT DEBUG ===')
      console.log('Items bruts:', items)
      
      const validItems = items.filter(item => 
        item.articleId && 
        item.quantite > 0 && 
        item.prixUnitaire > 0
      )
      
      if (validItems.length === 0) {
        toast({ title: "Erreur", description: "Aucun article valide dans le panier", variant: "destructive" })
        setIsSubmitting(false)
        return
      }
      
      if (validItems.length < items.length) {
        console.warn(`${items.length - validItems.length} article(s) invalide(s) retiré(s)`)
      }
      
      console.log('Items valides:', validItems.map(i => ({ id: i.articleId, q: i.quantite, p: i.prixUnitaire })))

      if (isAuthenticated && user?.userId) {
        const commandeData = {
          userId: user.userId,
          email: user.email,
          items: validItems.map(item => ({
            articleId: item.articleId,
            quantite: item.quantite,
            prixUnitaire: item.prixUnitaire
          })),
          adresseLivraison: {
            nom: formData.lastName,
            prenom: formData.firstName,
            telephone: formData.phone,
            adresse: formData.address,
            ville: formData.city,
            codePostal: formData.postalCode,
            pays: "Cameroun"
          },
          modePaiement: formData.paymentMethod,
          fraisLivraison: shippingCost
        }
        
        console.log('📦 Données commande envoyées:', JSON.stringify(commandeData, null, 2))
        
        creerCommande(commandeData, {
          onSuccess: async (response) => {
            const orderId = response.data?.numeroCommande || `ORDER-${Date.now()}`
            
            console.log('Payment method selected:', formData.paymentMethod)
            console.log('Checking if VISA:', formData.paymentMethod === "VISA")
            
            // Traiter le paiement selon la méthode choisie
            if (formData.paymentMethod === "VISA") {
              try {
                console.log('Initiating Stripe payment...')
                const payment = await apiClient.post<{ sessionId: string; checkoutUrl: string }>("/payments/visa", {
                  orderId,
                  amount: finalTotal,
                  currency: "XAF"
                })
                console.log('Stripe checkout URL:', payment.checkoutUrl)
                clearCart()
                // Rediriger vers la page de paiement Stripe
                window.location.href = payment.checkoutUrl
                return
              } catch (err: any) {
                console.error('Stripe payment error:', err)
                toast({ title: "Erreur de paiement Stripe", description: err.message, variant: "destructive" })
                setIsSubmitting(false)
                return
              }
            } else if (formData.paymentMethod === "ORANGE_MONEY") {
              try {
                console.log('Initiating CinetPay Orange Money payment...')
                const payment = await apiClient.post<{ transactionId: string; paymentUrl: string }>("/payments/orange-money", {
                  orderId,
                  amount: finalTotal
                })
                console.log('CinetPay response:', payment)
                
                if (!payment.paymentUrl) {
                  throw new Error('URL de paiement non reçue du serveur')
                }
                
                console.log('CinetPay Orange Money URL:', payment.paymentUrl)
                clearCart()
                window.location.href = payment.paymentUrl
                return
              } catch (err: any) {
                console.error('Orange Money payment error:', err)
                toast({ title: "Erreur de paiement Orange Money", description: err.message, variant: "destructive" })
                setIsSubmitting(false)
                return
              }
            } else if (formData.paymentMethod === "MTN_MONEY") {
              try {
                console.log('Initiating CinetPay MTN Money payment...')
                const payment = await apiClient.post<{ transactionId: string; paymentUrl: string }>("/payments/mtn-money", {
                  orderId,
                  amount: finalTotal
                })
                console.log('CinetPay response:', payment)
                
                if (!payment.paymentUrl) {
                  throw new Error('URL de paiement non reçue du serveur')
                }
                
                console.log('CinetPay MTN Money URL:', payment.paymentUrl)
                clearCart()
                window.location.href = payment.paymentUrl
                return
              } catch (err: any) {
                console.error('MTN Money payment error:', err)
                toast({ title: "Erreur de paiement MTN Money", description: err.message, variant: "destructive" })
                setIsSubmitting(false)
                return
              }
            }
            
            // Pour le paiement à la livraison (cash)
            toast({
              title: "Commande confirmée !",
              description: `Commande ${orderId} créée avec succès`,
            })
            clearCart()
            router.push('/')
          },
          onError: (error: any) => {
            console.error('Erreur création commande:', error)
            setErrors({ submit: error.message || "Impossible de passer la commande" })
          },
          onSettled: () => {
            setIsSubmitting(false)
          }
        })
      } else {
        if (!guestId) throw new Error("Erreur d'initialisation du panier invité")

        const response = await fetch('/api/commandes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId,
            email: formData.email,
            items: validItems.map(item => ({
              articleId: item.articleId,
              quantite: item.quantite,
              prixUnitaire: item.prixUnitaire
            })),
            adresseLivraison: {
              nom: formData.lastName,
              prenom: formData.firstName,
              telephone: formData.phone,
              adresse: formData.address,
              ville: formData.city,
              codePostal: formData.postalCode,
              pays: "Cameroun"
            },
            modePaiement: formData.paymentMethod,
            fraisLivraison: shippingCost
          })
        })

        if (!response.ok) {
          try {
            const errorData = await response.json()
            throw new Error(errorData.message || "Erreur lors de la création de la commande")
          } catch {
            throw new Error(`Erreur serveur (${response.status}): Le service est temporairement indisponible`)
          }
        }

        const orderData = await response.json()
        const orderId = orderData.numeroCommande || `ORDER-${Date.now()}`

        // Traiter le paiement selon la méthode choisie
        if (formData.paymentMethod === "VISA") {
          try {
            const payment = await apiClient.post<{ sessionId: string; checkoutUrl: string }>("/payments/visa", {
              orderId,
              amount: finalTotal,
              currency: "XAF",
              email: formData.email
            })
            clearCart()
            localStorage.removeItem('guestId')
            window.location.href = payment.checkoutUrl
            return
          } catch (err: any) {
            toast({ title: "Erreur de paiement Stripe", description: err.message, variant: "destructive" })
            setIsSubmitting(false)
            return
          }
        } else if (formData.paymentMethod === "ORANGE_MONEY") {
          try {
            const payment = await apiClient.post<{ transactionId: string; paymentUrl: string }>("/payments/orange-money", {
              orderId,
              amount: finalTotal,
              email: formData.email
            })
            console.log('CinetPay response:', payment)
            
            if (!payment.paymentUrl) {
              throw new Error('URL de paiement non reçue du serveur')
            }
            
            clearCart()
            localStorage.removeItem('guestId')
            window.location.href = payment.paymentUrl
            return
          } catch (err: any) {
            toast({ title: "Erreur de paiement Orange Money", description: err.message, variant: "destructive" })
            setIsSubmitting(false)
            return
          }
        } else if (formData.paymentMethod === "MTN_MONEY") {
          try {
            const payment = await apiClient.post<{ transactionId: string; paymentUrl: string }>("/payments/mtn-money", {
              orderId,
              amount: finalTotal,
              email: formData.email
            })
            console.log('CinetPay response:', payment)
            
            if (!payment.paymentUrl) {
              throw new Error('URL de paiement non reçue du serveur')
            }
            
            clearCart()
            localStorage.removeItem('guestId')
            window.location.href = payment.paymentUrl
            return
          } catch (err: any) {
            toast({ title: "Erreur de paiement MTN Money", description: err.message, variant: "destructive" })
            setIsSubmitting(false)
            return
          }
        }

        toast({
          title: "Commande confirmée !",
          description: "Votre commande a été enregistrée avec succès",
        })

        clearCart()
        localStorage.removeItem('guestId')
        router.push('/')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setErrors({ submit: error instanceof Error ? error.message : "Une erreur est survenue" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <div className="mb-8 space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Finaliser votre commande</h1>
              <p className="text-muted-foreground text-lg">Complétez vos informations pour recevoir votre commande</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}

                  <div className="group relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl border border-border/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <Truck className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-xl">Informations de livraison</h3>
                      </div>
                    
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                          <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Prénom
                          </Label>
                          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={`h-11 ${errors.firstName ? "border-destructive" : ""}`} placeholder="Votre prénom" />
                          {errors.firstName && <p className="text-sm text-destructive flex items-center gap-1"><span className="text-xs">⚠</span>{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="lastName" className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Nom
                          </Label>
                          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={`h-11 ${errors.lastName ? "border-destructive" : ""}`} placeholder="Votre nom" />
                          {errors.lastName && <p className="text-sm text-destructive flex items-center gap-1"><span className="text-xs">⚠</span>{errors.lastName}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email
                          </Label>
                          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={`h-11 ${errors.email ? "border-destructive" : ""}`} placeholder="exemple@email.com" />
                          {errors.email && <p className="text-sm text-destructive flex items-center gap-1"><span className="text-xs">⚠</span>{errors.email}</p>}
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Téléphone
                          </Label>
                          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={`h-11 ${errors.phone ? "border-destructive" : ""}`} placeholder="+237 6 XX XX XX XX" />
                          {errors.phone && <p className="text-sm text-destructive flex items-center gap-1"><span className="text-xs">⚠</span>{errors.phone}</p>}
                        </div>
                      </div>

                      <StaticLocationSelector
                        selectedVille={formData.city}
                        selectedQuartier={formData.address}
                        onVilleChange={(ville) => setFormData((prev) => ({ ...prev, city: ville, address: "" }))}
                        onQuartierChange={(quartier) => setFormData((prev) => ({ ...prev, address: quartier }))}
                        required
                      />
                    </div>
                  </div>



                  <div className="group relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl border border-border/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-xl">Méthode de paiement</h3>
                      </div>
                      <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))} className="space-y-4">
                        <div className="relative flex items-start space-x-4 p-5 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer transition-all duration-200 hover:shadow-md">
                          <RadioGroupItem value="cash" id="cash" className="mt-1" />
                          <Label htmlFor="cash" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 font-semibold text-base mb-1">
                              <DollarSign className="h-4 w-4" />
                              Paiement à la livraison
                            </div>
                            <p className="text-sm text-muted-foreground">Payez en espèces lors de la réception</p>
                          </Label>
                          {formData.paymentMethod === "cash" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="relative flex items-start space-x-4 p-5 rounded-xl border border-border/50 hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md">
                          <RadioGroupItem value="VISA" id="visa" className="mt-1" />
                          <Label htmlFor="visa" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 font-semibold text-base mb-1">
                              <CreditCard className="h-4 w-4" />
                              Carte Visa/Mastercard
                            </div>
                            <p className="text-sm text-muted-foreground">Paiement sécurisé par Stripe</p>
                          </Label>
                          {formData.paymentMethod === "VISA" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="relative flex items-start space-x-4 p-5 rounded-xl border border-border/50 hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md">
                          <RadioGroupItem value="ORANGE_MONEY" id="orange" className="mt-1" />
                          <Label htmlFor="orange" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 font-semibold text-base mb-1">
                              <Phone className="h-4 w-4 text-orange-500" />
                              Orange Money
                            </div>
                            <p className="text-sm text-muted-foreground">Paiement mobile sécurisé via CinetPay</p>
                          </Label>
                          {formData.paymentMethod === "ORANGE_MONEY" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="relative flex items-start space-x-4 p-5 rounded-xl border border-border/50 hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md">
                          <RadioGroupItem value="MTN_MONEY" id="mtn" className="mt-1" />
                          <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 font-semibold text-base mb-1">
                              <Phone className="h-4 w-4 text-yellow-500" />
                              MTN Mobile Money
                            </div>
                            <p className="text-sm text-muted-foreground">Paiement mobile sécurisé via CinetPay</p>
                          </Label>
                          {formData.paymentMethod === "MTN_MONEY" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full h-14 gradient-primary text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" disabled={isSubmitting || isCreatingOrder}>
                      {(isSubmitting || isCreatingOrder) ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Traitement en cours...</>
                      ) : (
                        <><ShieldCheck className="mr-2 h-5 w-5" />Confirmer la commande • {finalTotal.toLocaleString()} FCFA</>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Paiement sécurisé et données protégées
                    </p>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl sticky top-24 rounded-2xl border border-border/50 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-xl">Résumé</h3>
                  </div>
                  
                  <div className="space-y-3 max-h-72 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {items.map((item) => (
                      <div key={item.articleId} className="flex justify-between gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1 text-sm">{item.articleNom}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">Quantité: {item.quantite}</p>
                        </div>
                        <p className="font-semibold text-sm whitespace-nowrap">{item.sousTotal?.toLocaleString()} <span className="text-xs text-muted-foreground">FCFA</span></p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium">{totalAmount.toLocaleString()} <span className="text-xs text-muted-foreground">FCFA</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" />
                        Livraison
                      </span>
                      <span className={shippingCost === 0 ? "text-green-600 font-semibold" : "font-medium"}>
                        {isShippingLoading
                          ? "Calcul..."
                          : `${shippingCost.toLocaleString()} FCFA`}
                      </span>
                    </div>
                    {(shippingDistanceKm !== null || shippingDelayDays !== null || shippingError) && (
                      <p className="text-xs text-muted-foreground">
                        {shippingError ||
                          `Distance: ${shippingDistanceKm ?? 0} km${shippingDelayDays !== null ? ` • Délai estimé: ${shippingDelayDays} j` : ""}`}
                      </p>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-3 rounded-lg mb-6">
                    <p className="text-xs text-foreground/80 flex items-center gap-2">
                      <span className="text-primary">💡</span>
                      Les frais incluent une taxe d'assurance calculée sur la valeur de la commande.
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold">Total à payer</span>
                      <span className="text-2xl font-bold text-primary">{finalTotal.toLocaleString()} <span className="text-sm">FCFA</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProductSidebar />
        </div>
      </div>
    </div>
  )
}
