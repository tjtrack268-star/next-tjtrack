"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { buildImageUrl } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Lock, LogOut, Palette, Upload, Loader2 } from "lucide-react"
import type { ProfileResponse } from "@/types/api"

export default function ProfilePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/connexion")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    const loadProfile = async () => {
      setLoadingProfile(true)
      try {
        const [profileResponse, avatarResponse] = await Promise.all([
          apiClient.get<ProfileResponse>("/profile"),
          apiClient.get<{ avatarUrl?: string }>("/profile/avatar").catch(() => ({ avatarUrl: "" })),
        ])

        if (cancelled) return

        setProfile(profileResponse)
        setDisplayName(profileResponse?.name || "")
        setAvatarUrl(avatarResponse?.avatarUrl || "")
      } catch (error) {
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Impossible de charger votre profil",
          variant: "destructive",
        })
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, toast])

  const roleLabels = useMemo(() => {
    const roles = profile?.roles || user?.roles || []
    if (!roles.length) return []
    return roles.map((role) => {
      switch (role) {
        case "COMMERCANT":
          return "Commerçant"
        case "FOURNISSEUR":
          return "Fournisseur"
        case "LIVREUR":
          return "Livreur"
        case "CLIENT":
          return "Client"
        case "ADMIN":
          return "Admin"
        case "MANAGER":
          return "Manager"
        default:
          return role
      }
    })
  }, [profile?.roles, user?.roles])

  const handleSaveName = async () => {
    const trimmed = displayName.trim()
    if (trimmed.length < 2) {
      toast({
        title: "Nom invalide",
        description: "Le nom doit contenir au moins 2 caractères.",
        variant: "destructive",
      })
      return
    }

    setSavingName(true)
    try {
      const updated = await apiClient.put<{ name?: string }>("/profile/name", { name: trimmed })
      const nextName = String(updated?.name || trimmed)
      setDisplayName(nextName)
      setProfile((prev) => (prev ? { ...prev, name: nextName } : prev))

      const savedUser = localStorage.getItem("tj-track-user")
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          parsed.name = nextName
          localStorage.setItem("tj-track-user", JSON.stringify(parsed))
        } catch {}
      }

      toast({ title: "Profil", description: "Nom mis à jour avec succès." })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le nom",
        variant: "destructive",
      })
    } finally {
      setSavingName(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Mot de passe",
        description: "Renseignez le mot de passe actuel et le nouveau mot de passe.",
        variant: "destructive",
      })
      return
    }
    if (newPassword.length < 6) {
      toast({
        title: "Mot de passe",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Mot de passe",
        description: "La confirmation du mot de passe ne correspond pas.",
        variant: "destructive",
      })
      return
    }

    setSavingPassword(true)
    try {
      await apiClient.put<{ success?: boolean; message?: string }>("/profile/password", {
        currentPassword,
        newPassword,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast({ title: "Sécurité", description: "Mot de passe modifié avec succès." })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de modifier le mot de passe",
        variant: "destructive",
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return

    setSavingAvatar(true)
    try {
      const form = new FormData()
      form.append("avatar", file)
      const res = await apiClient.post<{ data?: string; message?: string; success?: boolean }>("/profile/avatar", form)
      const uploadedPath = res?.data || ""
      setAvatarUrl(uploadedPath)
      toast({ title: "Profil", description: "Photo de profil mise à jour." })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'uploader la photo de profil",
        variant: "destructive",
      })
    } finally {
      setSavingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartDrawer />
        <main className="container mx-auto px-4 py-10">
          <Card>
            <CardContent className="py-10 flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement...
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartDrawer />
        <main className="container mx-auto px-4 py-10">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Mon profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Connectez-vous pour gérer votre profil et vos informations.</p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/connexion">Se connecter</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/inscription">Créer un compte</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Mon profil</h1>
          <Button variant="destructive" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={buildImageUrl(avatarUrl) || avatarUrl || undefined} alt="Photo de profil" />
                  <AvatarFallback className="text-lg font-semibold">
                    {(profile?.name || user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={savingAvatar}
                  >
                    {savingAvatar ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {savingAvatar ? "Upload..." : "Changer photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Nom</p>
                <p className="font-medium">{profile?.name || user?.name || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium break-all">{profile?.email || user?.email || "Non renseigné"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rôles</p>
                <div className="flex flex-wrap gap-2">
                  {roleLabels.length ? (
                    roleLabels.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Aucun rôle</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Mode actuel:{" "}
                <span className="font-medium text-foreground">
                  {theme === "dark" ? "Sombre" : theme === "light" ? "Clair" : "Système"}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => setTheme("system")}>Système</Button>
                <Button variant="outline" onClick={() => setTheme("light")}>Clair</Button>
                <Button variant="outline" onClick={() => setTheme("dark")}>Sombre</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                <p className="font-medium">{profile?.phoneNumber || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ville</p>
                <p className="font-medium">{profile?.town || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Adresse</p>
                <p className="font-medium">{profile?.address || "Non renseignée"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Modifier le nom
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="displayName">Nom affiché</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre nom"
              />
              <Button onClick={handleSaveName} disabled={savingName || loadingProfile}>
                {savingName ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {savingName ? "Enregistrement..." : "Enregistrer le nom"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Changer le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmation"
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={savingPassword}>
                {savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {savingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
