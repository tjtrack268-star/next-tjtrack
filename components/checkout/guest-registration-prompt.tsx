"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Gift, Package, Heart, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface GuestRegistrationPromptProps {
  isOpen: boolean
  onClose: () => void
  guestEmail: string
  guestName: string
}

export function GuestRegistrationPrompt({ isOpen, onClose, guestEmail, guestName }: GuestRegistrationPromptProps) {
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")

  const handleRegister = async () => {
    if (!password || password.length < 6) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await register({
        name: guestName,
        email: guestEmail,
        password,
        role: "CLIENT"
      })
      
      toast({
        title: "Compte créé avec succès !",
        description: "Vérifiez votre email pour activer votre compte"
      })
      
      onClose()
      router.push("/connexion")
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le compte",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">Commande confirmée !</DialogTitle>
          <DialogDescription className="text-center">
            Créez un compte pour profiter de nombreux avantages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Suivi de vos commandes</p>
              <p className="text-xs text-muted-foreground">Suivez l'état de vos livraisons en temps réel</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Checkout rapide</p>
              <p className="text-xs text-muted-foreground">Vos informations sauvegardées pour vos prochains achats</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Liste de favoris</p>
              <p className="text-xs text-muted-foreground">Sauvegardez vos produits préférés</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Offres exclusives</p>
              <p className="text-xs text-muted-foreground">Recevez des promotions personnalisées</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={guestEmail} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
              disabled={isLoading}
            >
              Plus tard
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer mon compte"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
