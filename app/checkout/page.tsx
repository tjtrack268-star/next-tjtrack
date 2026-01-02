"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { GuestRegistrationPrompt } from "@/components/checkout/guest-registration-prompt"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false)
  
  // Initialiser le guestId pour les invités
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
      } else {
        // Utilisateur authentifié
        setGuestId(null)
      }
    }
  }, [isAuthenticated])
  
  const [formData, setFormData] = useState({
    nom: user?.name || "",
    email: user?.email || "",
    telephone: "",
    adresse: "",
    ville: "",
    codePostal: "",
    methodePaiement: "card"
  })

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits à votre panier avant de commander",
        variant: "destructive"
      })
      router.push("/")
      return
    }

    // Valider les champs obligatoires
    if (!formData.nom || !formData.email || !formData.telephone || !formData.adresse || !formData.ville) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Vérifier que le guestId est défini pour les invités
      if (!isAuthenticated && !guestId) {
        throw new Error("Erreur d'initialisation du panier invité")
      }

      const adresseLivraisonData = {
        nom: formData.nom.split(' ').slice(1).join(' ') || formData.nom,
        prenom: formData.nom.split(' ')[0],
        telephone: formData.telephone,
        adresse: formData.adresse,
        ville: formData.ville,
        codePostal: formData.codePostal,
        pays: "Cameroun"
      }

      const requestBody = isAuthenticated 
        ? { userId: user?.email }
        : { 
            guestId,
            email: formData.email, 
            adresseLivraison: adresseLivraisonData 
          }

      console.log('Authentifié:', isAuthenticated)
      console.log('GuestId:', guestId)
      console.log('Body:', requestBody)

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la création de la commande")
      }

      const result = await response.json()
      
      clearCart()
      
      // Nettoyer le guestId après commande réussie
      if (!isAuthenticated) {
        localStorage.removeItem('guestId')
        // Proposer l'inscription aux invités
        setShowRegistrationPrompt(true)
      } else {
        toast({
          title: "Commande confirmée !",
          description: "Votre commande a été enregistrée avec succès",
        })
        // Rediriger vers les commandes
        router.push("/dashboard/mes-commandes")
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors du traitement de votre commande",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-6">Ajoutez des produits à votre panier pour continuer</p>
            <Button onClick={() => router.push("/")}>
              Continuer mes achats
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Finaliser ma commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de commande */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom">Nom complet</Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="codePostal">Code postal</Label>
                    <Input
                      id="codePostal"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Mode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="methodePaiement"
                      value="card"
                      checked={formData.methodePaiement === "card"}
                      onChange={handleInputChange}
                      className="text-primary"
                    />
                    <span>Carte bancaire</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="methodePaiement"
                      value="mobile"
                      checked={formData.methodePaiement === "mobile"}
                      onChange={handleInputChange}
                      className="text-primary"
                    />
                    <span>Mobile Money</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="methodePaiement"
                      value="cash"
                      checked={formData.methodePaiement === "cash"}
                      onChange={handleInputChange}
                      className="text-primary"
                    />
                    <span>Paiement à la livraison</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé de commande */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Articles */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Quantité: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totaux */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Traitement..." : "Confirmer la commande"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de proposition d'inscription pour les invités */}
      <GuestRegistrationPrompt
        isOpen={showRegistrationPrompt}
        onClose={() => {
          setShowRegistrationPrompt(false)
          router.push("/")
        }}
        guestEmail={formData.email}
        guestName={formData.nom}
      />
    </div>
  )
}