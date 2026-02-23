"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Store, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"

export default function ConnexionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login, isLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    console.log("[v0] Form submitted with email:", email)

    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    try {
      await login({ email, password })
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur TJTrack !",
      })
      router.push("/")
    } catch (err) {
      console.error("[v0] Login failed:", err)
      const errorMessage = err instanceof Error ? err.message : "Email ou mot de passe incorrect"
      setError(errorMessage)
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }



  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte TJTrack</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">


              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full gradient-primary text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Pas encore de compte ?{" "}
                <Link href="/inscription" className="text-primary hover:underline font-medium">
                  Créer un compte
                </Link>
              </p>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                En continuant, vous acceptez nos{" "}
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
          </form>
        </Card>
      </main>
    </div>
  )
}
