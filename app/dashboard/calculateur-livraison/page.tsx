"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, MapPin, Package, Clock, Truck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

const VILLES = ["Douala", "Yaoundé", "Garoua", "Bamenda", "Limbe", "Bafoussam", "Buea", "Kumba", "Foumban", "Ebolowa"]

export default function CalculateurLivraisonPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    villeDepart: "Douala",
    villeArrivee: "Yaoundé",
    typeLivraison: "STANDARD",
    poidsKg: 2,
    volumeM3: 0.01,
    montantCommande: 0
  })

  const calculateDelivery = async () => {
    setLoading(true)
    try {
      const result = await apiClient.post("/delivery/tarifs/quote", formData)
      setQuote(result)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de calculer le tarif",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calculateur de Livraison</h1>
        <p className="text-muted-foreground">Calculez automatiquement les frais de livraison</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Informations de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ville de départ</Label>
                <Select value={formData.villeDepart} onValueChange={(v) => setFormData({...formData, villeDepart: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VILLES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ville d'arrivée</Label>
                <Select value={formData.villeArrivee} onValueChange={(v) => setFormData({...formData, villeArrivee: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VILLES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Type de livraison</Label>
              <Select value={formData.typeLivraison} onValueChange={(v) => setFormData({...formData, typeLivraison: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="EXPRESS">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Poids (kg)</Label>
                <Input 
                  type="number" 
                  value={formData.poidsKg} 
                  onChange={(e) => setFormData({...formData, poidsKg: Number(e.target.value)})} 
                />
                <p className="text-xs text-muted-foreground mt-1">+200 FCFA/kg au-delà de 5kg</p>
              </div>
              <div>
                <Label>Volume (m³)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.volumeM3} 
                  onChange={(e) => setFormData({...formData, volumeM3: Number(e.target.value)})} 
                />
                <p className="text-xs text-muted-foreground mt-1">+5000 FCFA/m³ au-delà de 0.05m³</p>
              </div>
            </div>

            <div>
              <Label>Montant de la commande (FCFA)</Label>
              <Input 
                type="number" 
                value={formData.montantCommande} 
                onChange={(e) => setFormData({...formData, montantCommande: Number(e.target.value)})} 
                placeholder="Pour vérifier l'éligibilité à la livraison gratuite"
              />
            </div>

            <Button 
              onClick={calculateDelivery} 
              disabled={loading}
              className="w-full gradient-primary text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {loading ? "Calcul..." : "Calculer le tarif"}
            </Button>
          </CardContent>
        </Card>

        {quote && (
          <Card className="glass-card border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Devis de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Zone</span>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  quote.zoneLivraison === 'URBAINE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {quote.zoneLivraison}
                </span>
              </div>

              {quote.distanceKm > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Distance</span>
                  </div>
                  <span className="font-semibold">{quote.distanceKm} km</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Délai</span>
                </div>
                <span className="font-semibold">{quote.delaiJours} jour{quote.delaiJours > 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Type</span>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  quote.typeLivraison === 'EXPRESS' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {quote.typeLivraison}
                </span>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Coût total</span>
                  {quote.gratuit ? (
                    <span className="text-2xl font-bold text-green-600">GRATUIT</span>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {quote.coutLivraison.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
                {quote.gratuit && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Seuil de livraison gratuite atteint
                  </p>
                )}
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {quote.villeDepart && quote.villeArrivee && (
                  <div>
                    <p>{quote.villeDepart} → {quote.villeArrivee}</p>
                    <p className="mt-1">Formule : 2500 XAF + ({quote.distanceKm} km × 100 XAF/km)</p>
                  </div>
                )}
                {quote.ville && (
                  <p>Tarif fixe urbain : 500 XAF</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
            <div>
              <p className="font-medium">Tarifs configurables avec fallback</p>
              <p className="text-muted-foreground">Utilise les tarifs en base de données, sinon : Urbain 500 XAF | Interurbain 2500 XAF + 100 XAF/km</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
            <div>
              <p className="font-medium">Calcul de distance GPS</p>
              <p className="text-muted-foreground">Pour les livraisons interurbaines, la distance est calculée automatiquement via les coordonnées GPS</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
            <div>
              <p className="font-medium">Suppléments intelligents</p>
              <p className="text-muted-foreground">Poids &gt; 5kg : +200 FCFA/kg | Volume &gt; 0.05m³ : +5000 FCFA/m³</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
            <div>
              <p className="font-medium">Livraison gratuite automatique</p>
              <p className="text-muted-foreground">Urbain : &gt; 30 000 XAF | Interurbain : &gt; 50 000 XAF</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
