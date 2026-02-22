"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Store,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building2,
  ArrowRight,
  Loader2,
  Check,
  Navigation,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { StaticLocationSelector } from "@/components/ui/static-location-selector"
import { Header } from "@/components/layout/header"
import DocumentUpload from "@/components/profile/DocumentUpload"
import type { ProfileRequest } from "@/types/api"

const roles = [
  { value: "CLIENT", label: "Client", description: "Achetez des produits" },
  { value: "COMMERCANT", label: "Commerçant", description: "Vendez vos produits" },
  { value: "FOURNISSEUR", label: "Fournisseur", description: "Fournissez des produits" },
  { value: "LIVREUR", label: "Livreur", description: "Livrez des commandes" },
]

export default function InscriptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { register, verifyOtp, resendOtp, isLoading } = useAuth()

  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as ProfileRequest["role"] | "",
    shopName: "",
    town: "",
    customTown: "",
    address: "",
    customAddress: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    cniNumber: "",
    enableGeolocation: false,
  })
  
  const [cniRecto, setCniRecto] = useState<File | null>(null)
  const [cniVerso, setCniVerso] = useState<File | null>(null)
  const [photoProfil, setPhotoProfil] = useState<File | null>(null)

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [resendingOtp, setResendingOtp] = useState(false)
  const [pendingDocuments, setPendingDocuments] = useState(false)

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return false
    }
    if (formData.password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      })
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleStep1Submit = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleStep2Submit = () => {
    if (!formData.phoneNumber || !formData.town || !formData.address) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }
    
    const phoneRegex = /^[+]?[0-9]{8,15}$/
    const cleanPhone = formData.phoneNumber.replace(/\s+/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      toast({
        title: "Erreur",
        description: "Format de téléphone invalide. Utilisez uniquement des chiffres (8-15 caractères)",
        variant: "destructive",
      })
      return
    }
    
    if (formData.role === "CLIENT") {
      if (!formData.firstName || !formData.lastName || !formData.cniNumber) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        })
        return
      }
    } else if (formData.role === "COMMERCANT" || formData.role === "FOURNISSEUR") {
      if (!formData.shopName) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir le nom de l'entreprise",
          variant: "destructive",
        })
        return
      }
    }
    setStep(3)
  }

  const validateStep3 = () => {
    if (formData.role === "COMMERCANT" && (!formData.cniNumber || !cniRecto || !cniVerso || !photoProfil)) {
      toast({
        title: "Documents manquants",
        description: "Veuillez fournir votre CNI et photo de profil",
        variant: "destructive",
      })
      return false
    }
    
    if (formData.role === "LIVREUR" && (!formData.cniNumber || !cniRecto || !cniVerso || !photoProfil)) {
      toast({
        title: "Documents manquants",
        description: "Veuillez fournir tous les documents requis",
        variant: "destructive",
      })
      return false
    }
    
    return true
  }

  const handleRegister = async () => {
    if (!validateStep3()) return
    
    try {
      const request: ProfileRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as ProfileRequest["role"],
      }

      const cleanPhone = formData.phoneNumber.replace(/\s+/g, '')

      if (formData.role === "COMMERCANT") {
        request.merchantInfo = {
          shopName: formData.shopName,
          town: formData.town,
          address: formData.address,
          phoneNumber: cleanPhone,
        }
      } else if (formData.role === "FOURNISSEUR") {
        request.supplierInfo = {
          shopName: formData.shopName,
          town: formData.town,
          address: formData.address,
          phoneNumber: cleanPhone,
        }
      } else if (formData.role === "LIVREUR") {
        request.deliveryInfo = {
          town: formData.town,
          address: formData.address,
          phoneNumber: cleanPhone,
        }
      } else if (formData.role === "CLIENT") {
        request.clientInfo = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          cniNumber: formData.cniNumber,
          town: formData.town,
          address: formData.address,
          phoneNumber: cleanPhone,
        }
      }

      await register(request)
      
      // Marquer qu'il y a des documents à uploader après OTP
      if ((formData.role === "LIVREUR" || formData.role === "COMMERCANT") && (cniRecto || cniVerso || photoProfil)) {
        setPendingDocuments(true)
      }
      
      setOtpSent(true)
      
      toast({
        title: "Inscription réussie",
        description: "Un code de vérification a été envoyé à votre email",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast({
        title: "Erreur d'inscription",
        description: errorMessage.includes("already has") 
          ? "Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter."
          : errorMessage,
        variant: "destructive",
      })
    }
  }

  const uploadDocuments = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tjtracks.com/api/v1.0"
      const token = localStorage.getItem("tj-track-token")
      
      if (!token) {
        throw new Error("Token non disponible")
      }
      
      // Utiliser l'email au lieu de userId pour l'upload
      const userEmail = formData.email
      if (!userEmail) {
        throw new Error("Email utilisateur non disponible")
      }
      
      const uploadFile = async (file: File, endpoint: string) => {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        
        const response = await fetch(`${API_BASE_URL}/profile-documents/${endpoint}?userEmail=${encodeURIComponent(userEmail)}&profileType=${formData.role}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadFormData
        })
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Erreur inconnue')
          console.error(`Upload ${endpoint} échoué:`, errorText)
          throw new Error(`Upload ${endpoint} échoué: ${response.status}`)
        }
      }
      
      // Sauvegarder le numéro CNI
      if (formData.cniNumber) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/profile-documents/save-cni-number?userEmail=${encodeURIComponent(userEmail)}&profileType=${formData.role}&cniNumber=${formData.cniNumber}`,
            { 
              method: "POST", 
              headers: { Authorization: `Bearer ${token}` } 
            }
          )
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Erreur inconnue')
            console.warn("Sauvegarde CNI échouée:", errorText, "- Continuons avec l'upload des fichiers")
          }
        } catch (error) {
          console.warn("Erreur sauvegarde CNI:", error, "- Continuons avec l'upload des fichiers")
        }
      }
      
      // Upload des fichiers
      if (cniRecto) await uploadFile(cniRecto, "upload-cni-recto")
      if (cniVerso) await uploadFile(cniVerso, "upload-cni-verso")
      if (photoProfil) await uploadFile(photoProfil, "upload-photo-profil")
      
      return true
    } catch (error) {
      console.error("Erreur upload documents:", error)
      toast({
        title: "Avertissement",
        description: "Documents non uploadés. Vous pourrez les ajouter depuis votre profil.",
        variant: "destructive",
      })
      return false
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code à 6 chiffres",
        variant: "destructive",
      })
      return
    }
    
    try {
      await verifyOtp(formData.email, otp.trim())
      
      // Upload des documents après vérification OTP réussie
      if (pendingDocuments) {
        await uploadDocuments()
      }
      
      toast({
        title: "Compte vérifié",
        description: "Votre compte a été créé avec succès !",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Code incorrect",
        description: error instanceof Error ? error.message : "Vérifiez le code et réessayez",
        variant: "destructive",
      })
    }
  }

  const handleResendOtp = async () => {
    setResendingOtp(true)
    try {
      await resendOtp(formData.email)
      toast({
        title: "Code renvoyé",
        description: "Un nouveau code a été envoyé à votre email",
      })
      setOtp("")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer le code",
        variant: "destructive",
      })
    } finally {
      setResendingOtp(false)
    }
  }


  const needsExtraInfo = formData.role && true

  if (otpSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Vérification</CardTitle>
              <CardDescription>Entrez le code envoyé à {formData.email}</CardDescription>
              <div className="flex justify-center gap-2 mt-4">
                <div className="h-2 w-8 rounded-full bg-primary/30" />
                <div className="h-2 w-8 rounded-full bg-primary/30" />
                <div className="h-2 w-8 rounded-full bg-primary/30" />
                <div className="h-2 w-8 rounded-full gradient-primary animate-pulse" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Code de vérification (6 chiffres)</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoComplete="off"
                />
                {otp && otp.length !== 6 && (
                  <p className="text-xs text-destructive">Le code doit contenir 6 chiffres</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                onClick={handleVerifyOtp} 
                className="w-full gradient-primary text-white" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Vérifier
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Pas reçu le code ?{" "}
                <button 
                  onClick={handleResendOtp}
                  disabled={resendingOtp}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {resendingOtp ? "Envoi..." : "Renvoyer"}
                </button>
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Créer un compte</CardTitle>
            <CardDescription>
              {step === 1 && "Informations de base"}
              {step === 2 && "Informations de contact"}
              {step === 3 && "Documents requis"}
            </CardDescription>
            {needsExtraInfo && (
              <div className="flex justify-center gap-2 mt-4">
                <div className={`h-2 w-8 rounded-full transition-all ${step >= 1 ? "gradient-primary" : "bg-muted"}`} />
                <div className={`h-2 w-8 rounded-full transition-all ${step >= 2 ? "gradient-primary" : "bg-muted"}`} />
                <div className={`h-2 w-8 rounded-full transition-all ${step >= 3 ? "gradient-primary" : "bg-muted"}`} />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Type de compte *</Label>
                  <Select value={formData.role} onValueChange={(v) => updateFormData("role", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <p className="font-medium">{role.label}</p>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {formData.role === "CLIENT" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="Jean"
                            value={formData.firstName}
                            onChange={(e) => updateFormData("firstName", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lastName"
                            placeholder="Dupont"
                            value={formData.lastName}
                            onChange={(e) => updateFormData("lastName", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cniNumber">Numéro CNI *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cniNumber"
                          placeholder="123456789"
                          value={formData.cniNumber}
                          onChange={(e) => updateFormData("cniNumber", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {(formData.role === "COMMERCANT" || formData.role === "FOURNISSEUR") && (
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Nom de l'entreprise *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="shopName"
                        placeholder="Ma Boutique"
                        value={formData.shopName}
                        onChange={(e) => updateFormData("shopName", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      placeholder="+237612345678"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Format: +237612345678 (8-15 chiffres)</p>
                </div>

                <StaticLocationSelector
                  selectedVille={formData.town}
                  selectedQuartier={formData.address}
                  onVilleChange={(ville) => updateFormData("town", ville)}
                  onQuartierChange={(quartier) => updateFormData("address", quartier)}
                  required
                />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableGeolocation"
                      checked={formData.enableGeolocation}
                      onCheckedChange={(checked) => updateFormData("enableGeolocation", checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="enableGeolocation"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <Navigation className="h-4 w-4" />
                        Activer la géolocalisation (optionnel)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Permet de vous localiser automatiquement pour les livraisons et services à proximité
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {(formData.role === "LIVREUR" || formData.role === "COMMERCANT") && (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="cniNumber">Numéro CNI *</Label>
                        <Input
                          id="cniNumber"
                          placeholder="123456789"
                          value={formData.cniNumber}
                          onChange={(e) => updateFormData("cniNumber", e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cniRecto">Photo CNI Recto *</Label>
                        <Input
                          id="cniRecto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCniRecto(e.target.files?.[0] || null)}
                        />
                        {cniRecto && <p className="text-xs text-muted-foreground">{cniRecto.name}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cniVerso">Photo CNI Verso *</Label>
                        <Input
                          id="cniVerso"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCniVerso(e.target.files?.[0] || null)}
                        />
                        {cniVerso && <p className="text-xs text-muted-foreground">{cniVerso.name}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="photoProfil">Photo 4x4 *</Label>
                        <Input
                          id="photoProfil"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPhotoProfil(e.target.files?.[0] || null)}
                        />
                        {photoProfil && <p className="text-xs text-muted-foreground">{photoProfil.name}</p>}
                      </div>
                    </div>
                  </>
                )}
                
                {(formData.role === "CLIENT" || formData.role === "FOURNISSEUR") && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun document requis pour votre type de compte.</p>
                    <p className="text-sm text-muted-foreground mt-2">Cliquez sur "Créer mon compte" pour continuer.</p>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {step === 1 && (
              <Button onClick={handleStep1Submit} className="w-full gradient-primary text-white" disabled={isLoading}>
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {step === 2 && (
              <div className="w-full space-y-2">
                <Button onClick={handleStep2Submit} className="w-full gradient-primary text-white" disabled={isLoading}>
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setStep(1)} className="w-full bg-transparent">
                  Retour
                </Button>
              </div>
            )}
            
            {step === 3 && (
              <div className="w-full space-y-2">
                <Button onClick={handleRegister} className="w-full gradient-primary text-white" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setStep(2)} className="w-full bg-transparent">
                  Retour
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center">
              Déjà un compte ?{" "}
              <Link href="/connexion" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              En créant un compte, vous acceptez nos{" "}
              <Link href="/conditions-utilisation" className="text-primary hover:underline">
                Conditions d&apos;utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="/politique-confidentialite" className="text-primary hover:underline">
                Politique de confidentialité
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
