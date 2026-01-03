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

  const isDifferentCity = infoLivraison ? !infoLivraison.memeVille : 
    (clientVille?.toLowerCase() !== merchantVille?.toLowerCase())

  useEffect(() => {
    loadInfoLivraison()
    loadLivreurs()
  }, [merchantLat, merchantLon, commandeId])

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

  const loadLivreurs = async () => {
    setLoading(true)
    try {
      const safeLat = merchantLat || 0
      const safeLon = merchantLon || 0
      
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
        selectedDelivery
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Recherche des livreurs...</span>
          </div>
        ) : (
          <Tabs defaultValue="pickup" className="w-full">
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
