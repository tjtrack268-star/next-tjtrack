"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
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
  const { register, verifyOtp, isLoading } = useAuth()

  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as ProfileRequest["role"] | "",
    // Role-specific info
    shopName: "",
    town: "",
    address: "",
    phoneNumber: "",
  })

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")

  const updateFormData = (field: string, value: string) => {
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
      if (formData.role === "CLIENT") {
        handleRegister()
      } else {
        setStep(2)
      }
    }
  }

  const handleRegister = async () => {
    try {
      const request: ProfileRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as ProfileRequest["role"],
      }

      // Add role-specific info
      if (formData.role === "COMMERCANT") {
        request.merchantInfo = {
          shopName: formData.shopName,
          town: formData.town,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
        }
      } else if (formData.role === "FOURNISSEUR") {
        request.supplierInfo = {
          shopName: formData.shopName,
          town: formData.town,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
        }
      } else if (formData.role === "LIVREUR") {
        request.deliveryInfo = {
          town: formData.town,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
        }
      } else if (formData.role === "CLIENT") {
        request.clientInfo = {
          town: formData.town || "N/A",
          address: formData.address || "N/A",
          phoneNumber: formData.phoneNumber || "+237000000000",
        }
      }

      await register(request)
      setOtpSent(true)
      toast({
        title: "Inscription réussie",
        description: "Un code de vérification a été envoyé à votre email",
      })
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(formData.email, otp)
      toast({
        title: "Compte vérifié",
        description: "Votre compte a été créé avec succès !",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Code de vérification incorrect",
        variant: "destructive",
      })
    }
  }

  const needsExtraInfo = formData.role && formData.role !== "CLIENT"

  if (otpSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">TJ-Track</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Vérification</CardTitle>
              <CardDescription>Entrez le code envoyé à {formData.email}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Code de vérification</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button onClick={handleVerifyOtp} className="w-full gradient-primary text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Vérifier
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Pas reçu le code ? <button className="text-primary hover:underline font-medium">Renvoyer</button>
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">TJ-Track</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Créer un compte</CardTitle>
            <CardDescription>{step === 1 ? "Informations de base" : "Informations professionnelles"}</CardDescription>
            {needsExtraInfo && (
              <div className="flex justify-center gap-2 mt-4">
                <div className={`h-2 w-8 rounded-full ${step >= 1 ? "gradient-primary" : "bg-muted"}`} />
                <div className={`h-2 w-8 rounded-full ${step >= 2 ? "gradient-primary" : "bg-muted"}`} />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 ? (
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
            ) : (
              <>
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
                      placeholder="+237 6XX XXX XXX"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="town">Ville *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="town"
                      placeholder="Douala"
                      value={formData.town}
                      onChange={(e) => updateFormData("town", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Rue de la Liberté, Akwa"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {step === 1 ? (
              <Button onClick={handleStep1Submit} className="w-full gradient-primary text-white" disabled={isLoading}>
                {needsExtraInfo ? "Continuer" : "Créer mon compte"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
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
                <Button variant="outline" onClick={() => setStep(1)} className="w-full bg-transparent">
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
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
