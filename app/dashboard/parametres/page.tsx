"use client"

import { useState } from "react"
import { User, Building2, Bell, Shield, Palette, Globe, Save, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function ParametresPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    stockAlerts: true,
    orderUpdates: true,
    marketing: false,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">Gérez les paramètres de votre compte et de l'application</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="entreprise" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Entreprise</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="securite" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="apparence" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Apparence</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Changer la photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input defaultValue="User" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue="admin@tj-track.com" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue="+33 6 12 34 56 78" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entreprise Tab */}
        <TabsContent value="entreprise">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Informations de l'Entreprise</CardTitle>
              <CardDescription>Paramètres de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'entreprise</Label>
                  <Input defaultValue="TJ-Track SARL" />
                </div>
                <div className="space-y-2">
                  <Label>SIRET</Label>
                  <Input defaultValue="123 456 789 00012" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Adresse</Label>
                  <Textarea defaultValue="123 Rue du Commerce, 75001 Paris, France" />
                </div>
                <div className="space-y-2">
                  <Label>TVA Intracommunautaire</Label>
                  <Input defaultValue="FR 12 345678901" />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Préférences de Notification</CardTitle>
              <CardDescription>Configurez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications par email</p>
                    <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, email: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertes de stock</p>
                    <p className="text-sm text-muted-foreground">Être alerté en cas de stock faible ou rupture</p>
                  </div>
                  <Switch
                    checked={notifications.stockAlerts}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, stockAlerts: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mises à jour des commandes</p>
                    <p className="text-sm text-muted-foreground">Notifications sur les nouvelles commandes</p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, orderUpdates: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Communications marketing</p>
                    <p className="text-sm text-muted-foreground">Offres et actualités de TJ-Track</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, marketing: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="securite">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Sécurité du Compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <Input type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nouveau mot de passe</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmer le mot de passe</Label>
                    <Input type="password" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authentification à deux facteurs</p>
                  <p className="text-sm text-muted-foreground">Ajouter une couche de sécurité supplémentaire</p>
                </div>
                <Button variant="outline">Configurer</Button>
              </div>

              <div className="flex justify-end">
                <Button className="gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Mettre à jour
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="apparence">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Select defaultValue="dark">
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger className="w-full md:w-64">
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Format de date</Label>
                  <Select defaultValue="dmy">
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dmy">JJ/MM/AAAA</SelectItem>
                      <SelectItem value="mdy">MM/JJ/AAAA</SelectItem>
                      <SelectItem value="ymd">AAAA-MM-JJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
