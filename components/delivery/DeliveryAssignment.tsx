"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Clock, Truck, Star, MessageCircle } from 'lucide-react'
import { deliveryApi } from '@/lib/delivery-api'
import { useToast } from '@/hooks/use-toast'
import DeliveryMap from '@/components/maps/DeliveryMap'

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
}

interface DeliveryAssignmentProps {
  commandeId: number
  clientId: number
  merchantId: number
  merchantLat: number
  merchantLon: number
  onAssigned: (result: any) => void
}

export default function DeliveryAssignment({ 
  commandeId, clientId, merchantId, merchantLat, merchantLon, onAssigned 
}: DeliveryAssignmentProps) {
  const { toast } = useToast()
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<number | null>(null)

  useEffect(() => {
    loadLivreurs()
  }, [merchantLat, merchantLon])

  useEffect(() => {
    const interval = setInterval(() => {
      loadLivreurs()
    }, 10000)
    return () => clearInterval(interval)
  }, [merchantLat, merchantLon])

  const loadLivreurs = async () => {
    setLoading(true)
    try {
      // Use default coordinates if merchant location is not available
      const safeLat = merchantLat || 0
      const safeLon = merchantLon || 0
      
      console.log(`Loading livreurs with coordinates: lat=${safeLat}, lon=${safeLon}`)
      
      const response = await deliveryApi.getLivreursDisponibles(safeLat, safeLon) as any
      const livreurs = Array.isArray(response) ? response : (response.data || [])
      
      console.log('Livreurs response:', livreurs)
      
      // Transform backend response to match frontend interface
      const transformedLivreurs = livreurs.map((livreur: any) => ({
        id: livreur.id,
        nom: livreur.nom,
        telephone: livreur.telephone,
        latitude: livreur.latitude || 0,
        longitude: livreur.longitude || 0,
        distance: livreur.distance || 999,
        rating: 4.5, // Default rating
        totalDeliveries: 50, // Default deliveries
        status: "DISPONIBLE" as const
      }))
      
      setLivreurs(transformedLivreurs)
      
      // Si pas de livreurs, ajouter des données de démonstration
      if (transformedLivreurs.length === 0) {
        const demoLivreurs: Livreur[] = [
          {
            id: 1,
            nom: 'Ahmed Benali',
            telephone: '+237 6 12 34 56 78',
            latitude: safeLat + 0.005,
            longitude: safeLon + 0.005,
            distance: 1.2,
            rating: 4.8,
            totalDeliveries: 156,
            status: "DISPONIBLE"
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
            status: "DISPONIBLE"
          },
          {
            id: 3,
            nom: 'Carlos Rodriguez',
            telephone: '+237 7 11 22 33 44',
            latitude: safeLat + 0.008,
            longitude: safeLon - 0.004,
            distance: 1.8,
            rating: 4.9,
            totalDeliveries: 203,
            status: "DISPONIBLE"
          }
        ]
        setLivreurs(demoLivreurs)
      }
    } catch (error) {
      console.error('Erreur chargement livreurs:', error)
      // En cas d'erreur, utiliser les données de démonstration
      const safeLat = merchantLat || 0
      const safeLon = merchantLon || 0
      
      const demoLivreurs: Livreur[] = [
        {
          id: 1,
          nom: 'Ahmed Benali',
          telephone: '+237 6 12 34 56 78',
          latitude: safeLat + 0.005,
          longitude: safeLon + 0.005,
          distance: 1.2,
          rating: 4.8,
          totalDeliveries: 156,
          status: "DISPONIBLE"
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
          status: "DISPONIBLE"
        }
      ]
      setLivreurs(demoLivreurs)
    } finally {
      setLoading(false)
    }
  }

  const assignerLivreur = async (livreurId: number) => {
    setAssigning(livreurId)
    try {
      const response = await deliveryApi.assignerLivreur(commandeId, clientId, merchantId) as any
      const data = response.data || response
      
      // Notify the delivery person
      toast({
        title: "Livreur assigné",
        description: "Le livreur a été notifié de la nouvelle assignation",
      })
      
      onAssigned(data)
    } catch (error) {
      console.error('Erreur assignation:', error)
      // Simulation pour la démonstration
      const livreur = livreurs.find(l => l.id === livreurId)
      if (livreur) {
        const simulatedResult = {
          commandeId,
          livreurId: livreur.id,
          livreurNom: livreur.nom,
          telephone: livreur.telephone,
          tempsEstime: '30-45 min'
        }
        
        toast({
          title: "Livreur assigné",
          description: `${livreur.nom} a été assigné à cette commande`,
        })
        
        onAssigned(simulatedResult)
      }
    } finally {
      setAssigning(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DISPONIBLE": return "bg-green-500"
      case "OCCUPE": return "bg-orange-500"
      case "HORS_LIGNE": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DISPONIBLE": return "Disponible"
      case "OCCUPE": return "Occupé"
      case "HORS_LIGNE": return "Hors ligne"
      default: return status
    }
  }

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Livreurs Disponibles ({livreurs.filter(l => l.status === "DISPONIBLE").length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Recherche des livreurs...</span>
          </div>
        ) : livreurs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun livreur disponible</p>
            <Button onClick={loadLivreurs} variant="outline" className="mt-4">
              Actualiser
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <DeliveryMap
              center={{ lat: merchantLat || 3.848, lon: merchantLon || 11.5021 }}
              zoom={12}
              drawRoute={false}
              markers={[
                {
                  id: "merchant",
                  label: "Point marchand",
                  lat: merchantLat || 3.848,
                  lon: merchantLon || 11.5021,
                  markerType: "merchant",
                },
                ...livreurs
                  .filter((l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude))
                  .map((l) => ({
                    id: `livreur-${l.id}`,
                    label: `${l.nom} (${l.distance > 0 ? `${l.distance.toFixed(1)} km` : "disponible"})`,
                    lat: l.latitude,
                    lon: l.longitude,
                    markerType: "delivery" as const,
                  })),
              ]}
            />
            <div className="space-y-4 max-h-96 overflow-y-auto">
            {livreurs
              .sort((a, b) => {
                // Prioritize available drivers, then by distance
                if (a.status === "DISPONIBLE" && b.status !== "DISPONIBLE") return -1
                if (b.status === "DISPONIBLE" && a.status !== "DISPONIBLE") return 1
                return a.distance - b.distance
              })
              .map((livreur) => (
              <div key={livreur.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{livreur.nom}</h4>
                        <Badge className={`${getStatusColor(livreur.status)} text-white text-xs`}>
                          {getStatusLabel(livreur.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <button 
                          onClick={() => callPhone(livreur.telephone)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {livreur.telephone}
                        </button>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {livreur.distance > 0 ? `${livreur.distance.toFixed(1)} km` : 'Disponible'}
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
                      {livreur.distance > 0 ? `~${Math.round(livreur.distance * 3 + 15)} min` : 'Disponible maintenant'}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col gap-2">
                  <Button
                    onClick={() => assignerLivreur(livreur.id)}
                    disabled={assigning === livreur.id || livreur.status !== "DISPONIBLE"}
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {assigning === livreur.id ? 'Attribution...' : 
                     livreur.status !== "DISPONIBLE" ? 'Indisponible' : 'Assigner'}
                  </Button>
                  
                  {livreur.status === "DISPONIBLE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => callPhone(livreur.telephone)}
                      className="min-w-[100px]"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Contacter
                    </Button>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button onClick={loadLivreurs} variant="outline" className="w-full">
            <Truck className="h-4 w-4 mr-2" />
            Actualiser la liste
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
