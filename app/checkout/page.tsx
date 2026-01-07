"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { ProductSidebar } from "@/components/layout/product-sidebar"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useCreerCommande } from "@/hooks/use-api"
import { CreditCard, DollarSign, Loader2, MapPin, Mail, Phone, User, Package, ShieldCheck, Truck, CheckCircle2 } from "lucide-react"

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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const CAMEROON_CITIES = [
    "Douala", "Yaoundé", "Garoua", "Bamenda", "Limbe",
    "Kumba", "Bafoussam", "Buea", "Foumban", "Ebolowa",
  ]

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

  const shippingCost = totalAmount > 50000 ? 0 : 2500
  const finalTotal = totalAmount + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (items.length === 0) {
      toast({ title: "Erreur", description: "Votre panier est vide", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    try {
      if (isAuthenticated && user?.userId) {
        const commandeData = {
          userId: user.userId,
          email: user.email,
          items: items.map(item => ({
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
          modePaiement: formData.paymentMethod
        }
        
        console.log('📦 Données commande envoyées:', JSON.stringify(commandeData, null, 2))
        
        creerCommande(commandeData, {
          onSuccess: (response) => {
            toast({
              title: "Commande confirmée !",
              description: `Commande ${response.data?.numeroCommande} créée avec succès`,
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
            items: items.map(item => ({
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
            }
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

                      <div className="space-y-2.5">
                        <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Adresse complète
                        </Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleInputChange} className={`h-11 ${errors.address ? "border-destructive" : ""}`} placeholder="Rue, bâtiment, quartier..." />
                        {errors.address && <p className="text-sm text-destructive flex items-center gap-1"><span className="text-xs">⚠</span>{errors.address}</p>}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                          <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
                          <Select value={formData.city} onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CAMEROON_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.city && <p className="text-sm text-destructive flex items-center gap-1"><span className="text-xs">⚠</span>{errors.city}</p>}
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="postalCode" className="text-sm font-medium">Code postal</Label>
                          <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="h-11" placeholder="Optionnel" />
                        </div>
                      </div>
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
                            <p className="text-sm text-muted-foreground">Payez en espèces lors de la réception de votre commande</p>
                          </Label>
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="relative flex items-start space-x-4 p-5 rounded-xl border border-border/50 bg-muted/20 cursor-not-allowed opacity-60">
                          <RadioGroupItem value="card" id="card" disabled className="mt-1" />
                          <Label htmlFor="card" className="flex-1 cursor-not-allowed">
                            <div className="flex items-center gap-2 font-semibold text-base mb-1">
                              <CreditCard className="h-4 w-4" />
                              Carte bancaire
                            </div>
                            <p className="text-sm text-muted-foreground">Bientôt disponible</p>
                          </Label>
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
                        {shippingCost === 0 ? "Gratuite" : `${shippingCost.toLocaleString()} FCFA`}
                      </span>
                    </div>
                  </div>

                  {shippingCost > 0 && (
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-3 rounded-lg mb-6">
                      <p className="text-xs text-foreground/80 flex items-center gap-2">
                        <span className="text-primary">💡</span>
                        Livraison gratuite dès 50 000 FCFA
                      </p>
                    </div>
                  )}

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
