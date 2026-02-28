"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Phone, Clock, Truck, Star, MessageCircle, ArrowRight, Package } from 'lucide-react'
import { deliveryApi } from '@/lib/delivery-api'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import DeliveryMap from '@/components/maps/DeliveryMap'
import { getCityCoordinates } from '@/lib/geo'

interface Livreur {
  id: number
  nom: string
  telephone: string
  latitude: number
  longitude: number
  distance: number
  rating?: number
  totalDeliveries?: number
  status: "DISPONIBLE" | "OCCUPE" | "HORS_LIGNE"
  zone?: string
}

interface DualDeliveryAssignmentProps {
  commandeId: number
  merchantEmail: string
  merchantLat: number
  merchantLon: number
  clientVille: string
  merchantVille: string
  onAssigned: (result: any) => void
}

interface DeliveryQuoteDetail {
  coutLivraison?: number
  distanceKm?: number
  distancePickupKm?: number
  distanceLinehaulKm?: number
  distanceFinalKm?: number
  coutPickupLocal?: number
  coutLinehaulInterville?: number
  coutFinalLocal?: number
  coutAssurance?: number
  coutSupplementPoids?: number
  coutSupplementVolume?: number
  coutSupplements?: number
}

export default function DualDeliveryAssignment({ 
  commandeId, merchantEmail, merchantLat, merchantLon, clientVille, merchantVille, onAssigned 
}: DualDeliveryAssignmentProps) {
  const { toast } = useToast()
  const [livreursPickup, setLivreursPickup] = useState<Livreur[]>([])
  const [livreursDelivery, setLivreursDelivery] = useState<Livreur[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPickup, setSelectedPickup] = useState<number | null>(null)
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [infoLivraison, setInfoLivraison] = useState<any>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quote, setQuote] = useState<DeliveryQuoteDetail | null>(null)
  const [agenceDepartQuartier, setAgenceDepartQuartier] = useState("")
  const [agenceArriveeQuartier, setAgenceArriveeQuartier] = useState("")
  const [livreurFinalQuartier, setLivreurFinalQuartier] = useState("")
  const [poidsKg, setPoidsKg] = useState("1")
  const [volumeM3, setVolumeM3] = useState("")

  const isDifferentCity = infoLivraison
    ? !infoLivraison.memeVille
    : Boolean(clientVille && merchantVille && clientVille.toLowerCase() !== merchantVille.toLowerCase())

  const resolvedLat =
    (infoLivraison?.merchantLatitude != null ? Number(infoLivraison.merchantLatitude) : null) ??
    (Number.isFinite(merchantLat) ? merchantLat : 0)
  const resolvedLon =
    (infoLivraison?.merchantLongitude != null ? Number(infoLivraison.merchantLongitude) : null) ??
    (Number.isFinite(merchantLon) ? merchantLon : 0)
  const canQueryLivreurs = resolvedLat !== 0 || resolvedLon !== 0

  useEffect(() => {
    loadInfoLivraison()
    loadLivreurs()
  }, [merchantLat, merchantLon, commandeId])

  useEffect(() => {
    if (!canQueryLivreurs) return
    const interval = setInterval(() => {
      loadLivreurs()
    }, 30000)
    return () => clearInterval(interval)
  }, [canQueryLivreurs, commandeId, infoLivraison?.memeVille, clientVille, merchantVille])

  const loadInfoLivraison = async () => {
    try {
      const response = await apiClient.get(`/commandes/${commandeId}/info-livraison`) as any
      const data = response.data || response
      setInfoLivraison(data)
      console.log('Info livraison:', data)
    } catch (error) {
      console.error('Erreur chargement info livraison:', error)
    }
  }

  const calculerDevisInterville = async () => {
    if (isDifferentCity && !selectedDelivery) {
      toast({
        title: "Livreur final requis",
        description: "Sélectionnez d'abord le livreur final pour calculer le segment livreur final -> client.",
        variant: "destructive"
      })
      return
    }
    setQuoteLoading(true)
    try {
      const villeDepartResolved = infoLivraison?.merchantVille || merchantVille
      const villeArriveeResolved = infoLivraison?.clientVille || clientVille
      const itemIds: number[] = Array.isArray(infoLivraison?.items)
        ? infoLivraison.items
            .map((it: any) => Number(it?.articleId || it?.article?.id || it?.id || 0))
            .filter((id: number) => Number.isFinite(id) && id > 0)
        : []
      const montantCommande = Number(infoLivraison?.montantTotal || 0)

        const response = await apiClient.post<DeliveryQuoteDetail>("/delivery/tarifs/quote", {
        villeDepart: villeDepartResolved,
        villeArrivee: villeArriveeResolved,
        quartierDepart: infoLivraison?.merchantAddress || undefined,
        quartierArrivee: infoLivraison?.clientAddress || undefined,
        villeAgenceDepart: villeDepartResolved,
        quartierAgenceDepart: agenceDepartQuartier || undefined,
        villeAgenceArrivee: villeArriveeResolved,
        quartierAgenceArrivee: agenceArriveeQuartier || undefined,
        villeLivreurFinal: villeArriveeResolved,
        quartierLivreurFinal: livreurFinalQuartier || undefined,
        livreurFinalId: selectedDelivery || undefined,
        articleIds: itemIds,
        typeLivraison: "STANDARD",
        poidsKg: Number(poidsKg) > 0 ? Number(poidsKg) : 1,
        montantCommande: montantCommande > 0 ? montantCommande : undefined,
        volumeM3: Number(volumeM3) > 0 ? Number(volumeM3) : undefined
      })
      setQuote(response)
    } catch (error) {
      console.error("Erreur devis interville:", error)
      toast({
        title: "Erreur devis",
        description: "Impossible de calculer le devis interville pour le moment",
        variant: "destructive"
      })
    } finally {
      setQuoteLoading(false)
    }
  }

  const loadLivreurs = async () => {
    if (!canQueryLivreurs) return
    setLoading(true)
    try {
      const safeLat = resolvedLat
      const safeLon = resolvedLon
      
      const response = await deliveryApi.getLivreursDisponibles(safeLat, safeLon) as any
      const livreurs = Array.isArray(response) ? response : (response.data || [])
      
      const transformedLivreurs = livreurs.map((livreur: any) => ({
        id: livreur.id,
        nom: livreur.nom,
        telephone: livreur.telephone,
        latitude: livreur.latitude || 0,
        longitude: livreur.longitude || 0,
        distance: livreur.distance || 999,
        rating: 4.5,
        totalDeliveries: 50,
        status: "DISPONIBLE" as const,
        zone: livreur.ville || livreur.zone || "Proximité" // Utiliser la ville du livreur
      }))
      
      // Filtrer les livreurs par ville pour livraison locale
      if (infoLivraison && infoLivraison.memeVille) {
        const villeMarchand = infoLivraison.merchantVille
        const livreursVilleMarchand = transformedLivreurs.filter((l: Livreur) => 
          l.zone?.toLowerCase().trim() === villeMarchand?.toLowerCase().trim()
        )
        
        // Si aucun livreur dans la ville exacte, afficher tous les livreurs disponibles
        if (livreursVilleMarchand.length === 0) {
          console.log(`Aucun livreur trouvé pour ${villeMarchand}, affichage de tous les livreurs disponibles`)
          setLivreursPickup(transformedLivreurs)
        } else {
          console.log(`Livraison locale à ${villeMarchand}: ${livreursVilleMarchand.length} livreurs filtrés`)
          setLivreursPickup(livreursVilleMarchand)
        }
        setLivreursDelivery([])
      } else {
        // Filtrer les livreurs par ville pour livraison inter-villes
        const livreursVilleMarchand = transformedLivreurs.filter((l: Livreur) => 
          l.zone?.toLowerCase().trim() === merchantVille.toLowerCase().trim()
        )
        const livreursVilleClient = transformedLivreurs.filter((l: Livreur) => 
          l.zone?.toLowerCase().trim() === clientVille.toLowerCase().trim()
        )
        
        // Si aucun livreur dans les villes exactes, afficher tous
        setLivreursPickup(livreursVilleMarchand.length > 0 ? livreursVilleMarchand : transformedLivreurs)
        setLivreursDelivery(livreursVilleClient.length > 0 ? livreursVilleClient : transformedLivreurs)
        console.log(`Livraison inter-villes: ${livreursVilleMarchand.length} livreurs à ${merchantVille}, ${livreursVilleClient.length} à ${clientVille}`)
      }
      
      // Données de démonstration si vide
      if (transformedLivreurs.length === 0) {
        const demoPickup: Livreur[] = [
          {
            id: 1,
            nom: 'Ahmed Benali',
            telephone: '+237 6 12 34 56 78',
            latitude: safeLat + 0.005,
            longitude: safeLon + 0.005,
            distance: 1.2,
            rating: 4.8,
            totalDeliveries: 156,
            status: "DISPONIBLE",
            zone: merchantVille
          },
          {
            id: 2,
            nom: 'Sophie Dubois',
            telephone: '+237 6 98 76 54 32',
            latitude: safeLat - 0.003,
            longitude: safeLon + 0.008,
            distance: 2.1,
            rating: 4.6,
            totalDeliveries: 89,
            status: "DISPONIBLE",
            zone: merchantVille
          }
        ]
        
        const demoDelivery: Livreur[] = [
          {
            id: 3,
            nom: 'Carlos Rodriguez',
            telephone: '+237 7 11 22 33 44',
            latitude: safeLat + 0.5,
            longitude: safeLon + 0.5,
            distance: 50,
            rating: 4.9,
            totalDeliveries: 203,
            status: "DISPONIBLE",
            zone: clientVille
          },
          {
            id: 4,
            nom: 'Marie Martin',
            telephone: '+237 6 55 66 77 88',
            latitude: safeLat + 0.6,
            longitude: safeLon + 0.4,
            distance: 55,
            rating: 4.7,
            totalDeliveries: 145,
            status: "DISPONIBLE",
            zone: clientVille
          }
        ]
        
        setLivreursPickup(demoPickup)
        setLivreursDelivery(demoDelivery)
      }
    } catch (error) {
      console.error('Erreur chargement livreurs:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les livreurs disponibles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const assignerDeuxLivreurs = async () => {
    if (!selectedPickup || !selectedDelivery) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner un livreur pour chaque étape",
        variant: "destructive"
      })
      return
    }

    setAssigning(true)
    try {
      const response = await deliveryApi.assignerDeuxLivreurs(
        commandeId,
        merchantEmail,
        selectedPickup,
        selectedDelivery,
        {
          quartierAgenceDepart: agenceDepartQuartier || undefined,
          quartierAgenceArrivee: agenceArriveeQuartier || undefined,
          quartierLivreurFinal: livreurFinalQuartier || undefined,
          poidsKg: Number(poidsKg) > 0 ? Number(poidsKg) : undefined,
          volumeM3: Number(volumeM3) > 0 ? Number(volumeM3) : undefined
        }
      ) as any
      
      const data = response.data || response
      
      toast({
        title: "Livreurs assignés",
        description: "Les deux livreurs ont été notifiés de leur assignation",
      })
      
      onAssigned(data)
    } catch (error) {
      console.error('Erreur assignation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les livreurs",
        variant: "destructive"
      })
    } finally {
      setAssigning(false)
    }
  }

  const assignerUnSeulLivreur = async (livreurId: number) => {
    setAssigning(true)
    try {
      const response = await deliveryApi.assignerLivreur(commandeId, 1, merchantEmail, livreurId) as any
      const data = response.data || response
      
      toast({
        title: "Livreur assigné",
        description: "Le livreur a été notifié de la nouvelle assignation",
      })
      
      onAssigned(data)
    } catch (error) {
      console.error('Erreur assignation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le livreur",
        variant: "destructive"
      })
    } finally {
      setAssigning(false)
    }
  }

  const renderLivreurCard = (livreur: Livreur, isSelected: boolean, onSelect: () => void, type: 'pickup' | 'delivery' | 'single') => (
    <div 
      key={livreur.id} 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/30'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-blue-500' : 'bg-blue-100'
            }`}>
              <Truck className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{livreur.nom}</h4>
                {isSelected && <Badge className="bg-blue-500">Sélectionné</Badge>}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {livreur.telephone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {livreur.zone || `${livreur.distance.toFixed(1)} km`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {livreur.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{livreur.rating.toFixed(1)}</span>
              </div>
            )}
            {livreur.totalDeliveries && (
              <span>{livreur.totalDeliveries} livraisons</span>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{Math.round(livreur.distance * 3 + 15)} min
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isDifferentCity) {
    // Livraison locale - un seul livreur
    const villeAffichage = infoLivraison?.merchantVille || merchantVille
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Livraison Locale - {villeAffichage}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Le client est dans la même ville ({infoLivraison?.clientVille || clientVille}). Un seul livreur suffit.
          </p>
        </CardHeader>
        <CardContent>
          <DeliveryMap
            center={getCityCoordinates(villeAffichage) || { lat: merchantLat || 3.848, lon: merchantLon || 11.5021 }}
            zoom={12}
            markers={[
              {
                id: "merchant-city",
                label: `Marchand (${villeAffichage})`,
                lat: merchantLat || (getCityCoordinates(villeAffichage)?.lat ?? 3.848),
                lon: merchantLon || (getCityCoordinates(villeAffichage)?.lon ?? 11.5021),
                markerType: "merchant",
              },
              ...livreursPickup.map((l) => ({
                id: `pickup-${l.id}`,
                label: `${l.nom} - ${l.zone || villeAffichage}`,
                lat: l.latitude,
                lon: l.longitude,
                markerType: "delivery" as const,
              })),
            ]}
          />
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Recherche des livreurs...</span>
            </div>
          ) : livreursPickup.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Aucun livreur disponible pour le moment</p>
              <Button variant="outline" onClick={loadLivreurs}>
                Actualiser
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {livreursPickup.map((livreur) => 
                renderLivreurCard(
                  livreur, 
                  selectedPickup === livreur.id, 
                  () => setSelectedPickup(livreur.id),
                  'single'
                )
              )}
              
              <Button 
                onClick={() => selectedPickup && assignerUnSeulLivreur(selectedPickup)}
                disabled={!selectedPickup || assigning}
                className="w-full mt-4"
              >
                {assigning ? 'Attribution...' : 'Assigner le livreur'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Livraison inter-villes - deux livreurs
  const villeClientAffichage = infoLivraison?.clientVille || clientVille
  const villeMarchandAffichage = infoLivraison?.merchantVille || merchantVille
  const marchantCoords =
    (infoLivraison?.merchantLatitude != null && infoLivraison?.merchantLongitude != null
      ? { lat: Number(infoLivraison.merchantLatitude), lon: Number(infoLivraison.merchantLongitude) }
      : null) ||
    getCityCoordinates(villeMarchandAffichage) ||
    { lat: merchantLat || 3.848, lon: merchantLon || 11.5021 }

  const clientCoords =
    (infoLivraison?.clientLatitude != null && infoLivraison?.clientLongitude != null
      ? { lat: Number(infoLivraison.clientLatitude), lon: Number(infoLivraison.clientLongitude) }
      : null) ||
    getCityCoordinates(villeClientAffichage) ||
    { lat: 4.0511, lon: 9.7679 }

  const liveLivreurCoords =
    (infoLivraison?.livreurLatitude != null && infoLivraison?.livreurLongitude != null)
      ? { lat: Number(infoLivraison.livreurLatitude), lon: Number(infoLivraison.livreurLongitude) }
      : null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Livraison Inter-Villes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Client à {villeClientAffichage}, marchand à {villeMarchandAffichage}. Deux livreurs nécessaires.
        </p>
      </CardHeader>
      <CardContent>
        <DeliveryMap
          center={marchantCoords}
          zoom={8}
          drawRoute
          markers={[
            {
              id: "merchant-city",
              label: `Départ marchand (${villeMarchandAffichage})`,
              lat: marchantCoords.lat,
              lon: marchantCoords.lon,
              markerType: "merchant",
            },
            ...livreursPickup.map((l) => ({
              id: `pickup-${l.id}`,
              label: `Pickup: ${l.nom}`,
              lat: l.latitude,
              lon: l.longitude,
              markerType: "delivery" as const,
            })),
            {
              id: "client-city",
              label: `Ville client (${villeClientAffichage})`,
              lat: clientCoords.lat,
              lon: clientCoords.lon,
              markerType: "client",
            },
            ...(liveLivreurCoords ? [{
              id: "livreur-live",
              label: "Position livreur en temps réel",
              lat: liveLivreurCoords.lat,
              lon: liveLivreurCoords.lon,
              markerType: "live" as const,
            }] : []),
            ...livreursDelivery.map((l) => ({
              id: `delivery-${l.id}`,
              label: `Final: ${l.nom}`,
              lat: l.latitude,
              lon: l.longitude,
              markerType: "delivery" as const,
            })),
          ]}
        />
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Recherche des livreurs...</span>
          </div>
        ) : (
          <Tabs defaultValue="pickup" className="w-full">
            <div className="bg-muted/40 border rounded-lg p-4 mb-4 space-y-3">
              <h4 className="font-medium">Paramètres interville (agences)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Quartier agence départ ({villeMarchandAffichage})</label>
                  <input
                    className="w-full mt-1 rounded border px-3 py-2 text-sm bg-background"
                    value={agenceDepartQuartier}
                    onChange={(e) => setAgenceDepartQuartier(e.target.value)}
                    placeholder="Ex: Akwa"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Quartier agence arrivée ({villeClientAffichage})</label>
                  <input
                    className="w-full mt-1 rounded border px-3 py-2 text-sm bg-background"
                    value={agenceArriveeQuartier}
                    onChange={(e) => setAgenceArriveeQuartier(e.target.value)}
                    placeholder="Ex: Centre ville"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Quartier de départ livreur final</label>
                  <input
                    className="w-full mt-1 rounded border px-3 py-2 text-sm bg-background"
                    value={livreurFinalQuartier}
                    onChange={(e) => setLivreurFinalQuartier(e.target.value)}
                    placeholder="Ex: Mvog-Ada"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Poids estimé (kg)</label>
                  <input
                    className="w-full mt-1 rounded border px-3 py-2 text-sm bg-background"
                    value={poidsKg}
                    onChange={(e) => setPoidsKg(e.target.value)}
                    placeholder="Ex: 2"
                    type="number"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Volume estimé (m3)</label>
                  <input
                    className="w-full mt-1 rounded border px-3 py-2 text-sm bg-background"
                    value={volumeM3}
                    onChange={(e) => setVolumeM3(e.target.value)}
                    placeholder="Ex: 0.08"
                    type="number"
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={calculerDevisInterville} disabled={quoteLoading}>
                {quoteLoading ? "Calcul devis..." : "Calculer devis détaillé"}
              </Button>
              {isDifferentCity && !selectedDelivery ? (
                <p className="text-xs text-amber-700">
                  Sélection du livreur final obligatoire pour un devis interville précis.
                </p>
              ) : null}
              {quote ? (
                <div className="text-sm bg-blue-50 border border-blue-100 rounded p-3 space-y-1">
                  <p><strong>Total:</strong> {Number(quote.coutLivraison || 0).toLocaleString()} FCFA</p>
                  <p>Pickup local: {Number(quote.coutPickupLocal || 0).toLocaleString()} FCFA ({Number(quote.distancePickupKm || 0).toLocaleString()} km)</p>
                  <p>Interville: {Number(quote.coutLinehaulInterville || 0).toLocaleString()} FCFA ({Number(quote.distanceLinehaulKm || 0).toLocaleString()} km)</p>
                  <p>Final local: {Number(quote.coutFinalLocal || 0).toLocaleString()} FCFA ({Number(quote.distanceFinalKm || 0).toLocaleString()} km)</p>
                  <p>Assurance: {Number(quote.coutAssurance || 0).toLocaleString()} FCFA</p>
                  <p>Suppléments: {Number(quote.coutSupplements || 0).toLocaleString()} FCFA</p>
                </div>
              ) : null}
            </div>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pickup" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Récupération ({merchantVille})
                {selectedPickup && <Badge variant="secondary" className="ml-2">✓</Badge>}
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Livraison ({clientVille})
                {selectedDelivery && <Badge variant="secondary" className="ml-2">✓</Badge>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pickup" className="space-y-3 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Étape 1:</strong> Sélectionnez le livreur qui récupérera la commande chez vous à {villeMarchandAffichage}
                </p>
              </div>
              
              {livreursPickup.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun livreur disponible à {villeMarchandAffichage}
                </p>
              ) : (
                livreursPickup.map((livreur) => 
                  renderLivreurCard(
                    livreur, 
                    selectedPickup === livreur.id, 
                    () => setSelectedPickup(livreur.id),
                    'pickup'
                  )
                )
              )}
            </TabsContent>
            
            <TabsContent value="delivery" className="space-y-3 mt-4">
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  <strong>Étape 2:</strong> Sélectionnez le livreur qui livrera au client à {villeClientAffichage}
                </p>
              </div>
              
              {livreursDelivery.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun livreur disponible à {villeClientAffichage}
                </p>
              ) : (
                livreursDelivery.map((livreur) => 
                  renderLivreurCard(
                    livreur, 
                    selectedDelivery === livreur.id, 
                    () => setSelectedDelivery(livreur.id),
                    'delivery'
                  )
                )
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {!loading && (
          <div className="mt-6 space-y-4">
            {selectedPickup && selectedDelivery && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">Récapitulatif</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Récupération</p>
                    <p className="font-medium">
                      {livreursPickup.find(l => l.id === selectedPickup)?.nom}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Livraison</p>
                    <p className="font-medium">
                      {livreursDelivery.find(l => l.id === selectedDelivery)?.nom}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={assignerDeuxLivreurs}
              disabled={!selectedPickup || !selectedDelivery || assigning}
              className="w-full"
              size="lg"
            >
              {assigning ? 'Attribution...' : 'Assigner les deux livreurs'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
