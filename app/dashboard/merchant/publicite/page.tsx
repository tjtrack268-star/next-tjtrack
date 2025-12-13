"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Megaphone,
  Plus,
  Eye,
  MousePointer,
  TrendingUp,
  Sparkles,
  Star,
  Zap,
  Crown,
  Check,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMesCampagnes, useMerchantCalculerTarif, useCreerCampagne, useMerchantProduits } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"

const campaignTypes = [
  {
    id: "MISE_EN_AVANT_SIMPLE",
    name: "Mise en avant Simple",
    description: "Votre produit apparaît dans la section 'Produits en avant'",
    icon: Sparkles,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "MISE_EN_AVANT_PREMIUM",
    name: "Mise en avant Premium",
    description: "Position prioritaire + badge 'Premium' sur votre produit",
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "BANNIERE_PRINCIPALE",
    name: "Bannière Principale",
    description: "Votre produit en bannière sur la page d'accueil",
    icon: Zap,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "CARROUSEL_ACCUEIL",
    name: "Carrousel d'accueil",
    description: "Présence dans le carrousel premium en haut de page",
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

export default function MerchantPublicitePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("SEMAINE")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: campaignsResponse, isLoading, error, refetch } = useMesCampagnes(user?.id || user?.email || "")
  const { data: productsResponse } = useMerchantProduits(user?.id || user?.email || "")
  const { data: tarifResponse } = useMerchantCalculerTarif(selectedType, selectedPeriod)
  const createCampaignMutation = useCreerCampagne()

  // Extract data from responses
  const campaigns = campaignsResponse?.data || campaignsResponse || []
  const products = productsResponse?.data || productsResponse || []
  const tarif = tarifResponse?.data || tarifResponse || 0

  const getTypeInfo = (typeId: string) => campaignTypes.find((t) => t.id === typeId)

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const handleCreateCampaign = async () => {
    if (!selectedProduct || !selectedType) return

    try {
      await createCampaignMutation.mutateAsync({
        userId: user?.id || user?.email || "",
        data: {
          produitId: Number(selectedProduct),
          typeMiseEnAvant: selectedType,
          periode: selectedPeriod,
        },
      })
      toast({
        title: "Campagne créée",
        description: "Votre campagne publicitaire a été soumise pour validation",
      })
      setIsDialogOpen(false)
      setSelectedType("")
      setSelectedPeriod("SEMAINE")
      setSelectedProduct("")
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la campagne",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erreur lors du chargement des campagnes</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  const activeCampaigns = Array.isArray(campaigns) ? campaigns.filter((c) => c.statut === "ACTIVE") : []
  const totalViews = Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + (c.nombreVues || 0), 0) : 0
  const totalClicks = Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + (c.nombreClics || 0), 0) : 0
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Publicité</h1>
          <p className="text-muted-foreground">Boostez la visibilité de vos produits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une campagne publicitaire</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Sélectionnez un produit</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(products) &&
                      products.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.nom} - {formatPrice(product.prix || 0)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campaign Type */}
              <div className="space-y-3">
                <Label>Type de campagne</Label>
                <div className="grid gap-3">
                  {campaignTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <div className={`p-2 rounded-lg ${type.bgColor}`}>
                        <type.icon className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{type.name}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      {selectedType === type.id && (
                        <div className="absolute top-4 right-4">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Period */}
              <div className="space-y-3">
                <Label>Durée de la campagne</Label>
                <RadioGroup value={selectedPeriod} onValueChange={setSelectedPeriod} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="JOUR" id="jour" />
                    <Label htmlFor="jour">1 Jour</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SEMAINE" id="semaine" />
                    <Label htmlFor="semaine">1 Semaine</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MOIS" id="mois" />
                    <Label htmlFor="mois">1 Mois</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Price Summary */}
              {selectedType && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Montant à payer:</span>
                      <span className="text-2xl font-bold text-primary">{formatPrice(Number(tarif) || 0)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                className="gradient-primary text-white"
                onClick={handleCreateCampaign}
                disabled={!selectedProduct || !selectedType || createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer la campagne
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campagnes actives</p>
                <p className="text-2xl font-bold">{activeCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total vues</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MousePointer className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total clics</p>
                <p className="text-2xl font-bold">{totalClicks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux de clic</p>
                <p className="text-2xl font-bold">{ctr}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Nos offres publicitaires</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {campaignTypes.map((type) => (
            <Card key={type.id} className="glass-card hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className={`p-3 rounded-lg ${type.bgColor} w-fit mb-2`}>
                  <type.icon className={`h-6 w-6 ${type.color}`} />
                </div>
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full mt-4 bg-transparent"
                  variant="outline"
                  onClick={() => {
                    setSelectedType(type.id)
                    setIsDialogOpen(true)
                  }}
                >
                  Choisir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Campaigns */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Mes campagnes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(campaigns) && campaigns.length > 0 ? (
              campaigns.map((campaign) => {
                const typeInfo = getTypeInfo(campaign.type || campaign.typeMiseEnAvant)
                return (
                  <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${typeInfo?.bgColor || "bg-muted"}`}>
                        {typeInfo && <typeInfo.icon className={`h-5 w-5 ${typeInfo.color}`} />}
                      </div>
                      <div>
                        <p className="font-medium">{campaign.produit || campaign.produitNom || "Produit"}</p>
                        <p className="text-sm text-muted-foreground">{typeInfo?.name || "Campagne"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Vues</p>
                        <p className="font-medium">{(campaign.nombreVues || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Clics</p>
                        <p className="font-medium">{campaign.nombreClics || 0}</p>
                      </div>
                      <Badge
                        variant={campaign.statut === "ACTIVE" ? "default" : "secondary"}
                        className={campaign.statut === "ACTIVE" ? "bg-green-500" : ""}
                      >
                        {campaign.statut === "ACTIVE" ? "Active" : "Expirée"}
                      </Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">Aucune campagne pour le moment</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
