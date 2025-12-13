"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store, Mail, Lock, ArrowRight, Loader2, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function MotDePasseOubliePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { sendResetOtp, resetPassword, isLoading } = useAuth()

  const [step, setStep] = useState<"email" | "otp" | "newPassword">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSendOtp = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre email",
        variant: "destructive",
      })
      return
    }

    try {
      await sendResetOtp(email)
      toast({
        title: "Code envoyé",
        description: "Vérifiez votre boîte mail",
      })
      setStep("otp")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le code",
        variant: "destructive",
      })
    }
  }

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le code de vérification",
        variant: "destructive",
      })
      return
    }
    setStep("newPassword")
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    try {
      await resetPassword(email, otp, newPassword)
      toast({
        title: "Mot de passe réinitialisé",
        description: "Vous pouvez maintenant vous connecter",
      })
      router.push("/connexion")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le mot de passe",
        variant: "destructive",
      })
    }
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

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
              {step === "email" && <Mail className="h-8 w-8 text-white" />}
              {step === "otp" && <Lock className="h-8 w-8 text-white" />}
              {step === "newPassword" && <Check className="h-8 w-8 text-white" />}
            </div>
            <CardTitle className="text-2xl">
              {step === "email" && "Mot de passe oublié"}
              {step === "otp" && "Vérification"}
              {step === "newPassword" && "Nouveau mot de passe"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "Entrez votre email pour recevoir un code"}
              {step === "otp" && `Code envoyé à ${email}`}
              {step === "newPassword" && "Choisissez un nouveau mot de passe"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {step === "otp" && (
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
            )}

            {step === "newPassword" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {step === "email" && (
              <Button onClick={handleSendOtp} className="w-full gradient-primary text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Envoyer le code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {step === "otp" && (
              <div className="w-full space-y-2">
                <Button onClick={handleVerifyOtp} className="w-full gradient-primary text-white">
                  Vérifier
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setStep("email")} className="w-full bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </div>
            )}

            {step === "newPassword" && (
              <Button onClick={handleResetPassword} className="w-full gradient-primary text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Réinitialiser
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}

            <Link href="/connexion" className="text-sm text-primary hover:underline">
              Retour à la connexion
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
