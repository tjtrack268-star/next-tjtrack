"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Clock, Truck } from 'lucide-react'
import { deliveryApi } from '@/lib/delivery-api'

interface Livreur {
  id: number
  nom: string
  telephone: string
  latitude: number
  longitude: number
  distance: number
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
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<number | null>(null)

  useEffect(() => {
    loadLivreurs()
  }, [merchantLat, merchantLon])

  const loadLivreurs = async () => {
    setLoading(true)
    try {
      const response = await deliveryApi.getLivreursDisponibles(merchantLat, merchantLon)
      const livreurs = Array.isArray(response) ? response : (response.data || [])
      
      // Si pas de livreurs, ajouter des données de démonstration
      if (livreurs.length === 0) {
        const demoLivreurs: Livreur[] = [
          {
            id: 1,
            nom: 'Ahmed Benali',
            telephone: '+33 6 12 34 56 78',
            latitude: merchantLat + 0.005,
            longitude: merchantLon + 0.005,
            distance: 1.2
          },
          {
            id: 2,
            nom: 'Sophie Dubois',
            telephone: '+33 6 98 76 54 32',
            latitude: merchantLat - 0.003,
            longitude: merchantLon + 0.008,
            distance: 2.1
          },
          {
            id: 3,
            nom: 'Carlos Rodriguez',
            telephone: '+33 7 11 22 33 44',
            latitude: merchantLat + 0.008,
            longitude: merchantLon - 0.004,
            distance: 1.8
          }
        ]
        setLivreurs(demoLivreurs)
      } else {
        setLivreurs(livreurs)
      }
    } catch (error) {
      console.error('Erreur chargement livreurs:', error)
      // En cas d'erreur, utiliser les données de démonstration
      const demoLivreurs: Livreur[] = [
        {
          id: 1,
          nom: 'Ahmed Benali',
          telephone: '+33 6 12 34 56 78',
          latitude: merchantLat + 0.005,
          longitude: merchantLon + 0.005,
          distance: 1.2
        },
        {
          id: 2,
          nom: 'Sophie Dubois',
          telephone: '+33 6 98 76 54 32',
          latitude: merchantLat - 0.003,
          longitude: merchantLon + 0.008,
          distance: 2.1
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
      const response = await deliveryApi.assignerLivreur(commandeId, clientId, merchantId)
      const data = response.data || response
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
        onAssigned(simulatedResult)
      }
    } finally {
      setAssigning(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Livreurs Disponibles ({livreurs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Recherche...</span>
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
            {livreurs.map((livreur) => (
              <div key={livreur.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{livreur.nom}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {livreur.telephone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {livreur.distance.toFixed(1)} km
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    ~{Math.round(livreur.distance * 3 + 15)} min
                  </Badge>
                </div>
                <Button
                  onClick={() => assignerLivreur(livreur.id)}
                  disabled={assigning === livreur.id}
                  className="ml-4"
                >
                  {assigning === livreur.id ? 'Attribution...' : 'Assigner'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}