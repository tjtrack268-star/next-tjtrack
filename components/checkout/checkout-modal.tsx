"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useCreerCommande } from "@/hooks/use-api"
import { CreditCard, DollarSign, Loader2 } from "lucide-react"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalAmount, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { mutate: creerCommande, isPending: isCreatingOrder } = useCreerCommande()

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
    "Douala",
    "Yaoundé",
    "Garoua",
    "Bamenda",
    "Limbe",
    "Kumba",
    "Bafoussam",
    "Buea",
    "Foumban",
    "Ebolowa",
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
    
    if (!isAuthenticated || !user?.userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour passer commande",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Erreur", 
        description: "Votre panier est vide",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    creerCommande({
      userId: user.userId,
      adresseLivraison: {
        nom: formData.lastName,
        prenom: formData.firstName,
        telephone: formData.phone,
        adresse: formData.address,
        ville: formData.city,
        codePostal: formData.postalCode
      },
      modePaiement: formData.paymentMethod
    }, {
      onSuccess: (response) => {
        toast({
          title: "Commande confirmée !",
          description: `Commande ${response.data?.numeroCommande} créée avec succès`,
        })
        clearCart()
        onClose()
      },
      onError: (error: any) => {
        console.error('Erreur création commande:', error)
        setErrors({ submit: error.message || "Impossible de passer la commande" })
      },
      onSettled: () => {
        setIsSubmitting(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirmation de la commande</DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations de livraison</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? "border-destructive" : ""}
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? "border-destructive" : ""}
                      placeholder="Votre nom"
                    />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "border-destructive" : ""}
                      placeholder="exemple@email.com"
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? "border-destructive" : ""}
                      placeholder="+237 6 XX XX XX XX"
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? "border-destructive" : ""}
                    placeholder="Rue, bâtiment, etc."
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMEROON_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Code postal (optionnel)"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Méthode de paiement
                </h3>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="font-medium">Paiement à la livraison</div>
                      <p className="text-sm text-muted-foreground">Payez en espèces lors de la livraison</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary cursor-pointer opacity-50">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex-1 cursor-pointer opacity-50">
                      <div className="font-medium">Carte bancaire</div>
                      <p className="text-sm text-muted-foreground">Indisponible pour le moment</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full gradient-primary text-white" size="lg" disabled={isSubmitting || isCreatingOrder}>
                {(isSubmitting || isCreatingOrder) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création de la commande...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Confirmer la commande ({finalTotal.toLocaleString()} FCFA)
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card/50 backdrop-blur sticky top-4 rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">Résumé de la commande</h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.articleId} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium line-clamp-1">{item.articleNom}</p>
                      <p className="text-muted-foreground text-xs">x{item.quantite}</p>
                    </div>
                    <p className="font-semibold text-right">{item.sousTotal?.toLocaleString()} FCFA</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border mb-4" />

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{totalAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className={shippingCost === 0 ? "text-green-500 font-medium" : ""}>
                    {shippingCost === 0 ? "Gratuite" : `${shippingCost.toLocaleString()} FCFA`}
                  </span>
                </div>
              </div>

              {shippingCost > 0 && (
                <p className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded mb-4">
                  Livraison gratuite à partir de 50 000 FCFA
                </p>
              )}

              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{finalTotal.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}