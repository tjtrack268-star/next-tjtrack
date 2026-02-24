"use client"

import { useCallback, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, Truck, Package, CheckCircle } from 'lucide-react'
import DeliveryMap from '@/components/maps/DeliveryMap'
import { apiClient } from '@/lib/api'
import { useDeliveryWebSocket } from '@/hooks/use-delivery-websocket'

interface ClientTrackingProps {
  commandeId: number
  numeroCommande: string
}

interface TrackingInfo {
  statut: string
  livreur?: {
    nom: string
    telephone: string
    latitude: number
    longitude: number
  }
  tempsEstime?: string
  etapes: {
    nom: string
    statut: 'completed' | 'current' | 'pending'
    timestamp?: string
  }[]
  merchantLatitude?: number
  merchantLongitude?: number
  clientLatitude?: number
  clientLongitude?: number
  positionUpdatedAt?: string
}

export default function ClientTracking({ commandeId, numeroCommande }: ClientTrackingProps) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const onSocketMessage = useCallback((payload: any) => {
    if (payload?.latitude == null || payload?.longitude == null) return
    setTracking((prev) => {
      if (!prev) return prev
      const updatedLivreur = {
        nom: prev.livreur?.nom || "Livreur assigné",
        telephone: prev.livreur?.telephone || "-",
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
      }
      return {
        ...prev,
        livreur: updatedLivreur,
        positionUpdatedAt: payload?.timestamp
          ? new Date(Number(payload.timestamp)).toISOString()
          : prev.positionUpdatedAt,
      }
    })
  }, [])

  useDeliveryWebSocket({ commandeId, enabled: true, onMessage: onSocketMessage })

  useEffect(() => {
    loadTrackingInfo()
    const interval = setInterval(loadTrackingInfo, 10000) // Actualiser toutes les 10s
    return () => clearInterval(interval)
  }, [commandeId])

  const loadTrackingInfo = async () => {
    try {
      const response = await apiClient.get<any>(`/commandes/${commandeId}/info-livraison`)
      const info = response?.data || response
      const statut = info?.statut || 'EN_COURS'
      const steps = [
        { nom: 'Commande confirmée', key: 'CONFIRMEE' },
        { nom: 'En préparation', key: 'EN_PREPARATION' },
        { nom: 'Expédiée', key: 'EXPEDIEE' },
        { nom: 'Livrée', key: 'LIVREE' },
      ]
      const currentStepIndex = Math.max(
        0,
        steps.findIndex((s) => s.key === statut)
      )
      setTracking({
        statut,
        livreur: (info?.livreurLatitude != null && info?.livreurLongitude != null) ? {
          nom: 'Livreur assigné',
          telephone: '-',
          latitude: Number(info.livreurLatitude),
          longitude: Number(info.livreurLongitude)
        } : undefined,
        tempsEstime: statut === 'LIVREE' ? undefined : 'Mise à jour en temps réel',
        etapes: steps.map((step, index) => ({
          nom: step.nom,
          statut: index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'current' : 'pending'
        })),
        merchantLatitude: info?.merchantLatitude != null ? Number(info.merchantLatitude) : undefined,
        merchantLongitude: info?.merchantLongitude != null ? Number(info.merchantLongitude) : undefined,
        clientLatitude: info?.clientLatitude != null ? Number(info.clientLatitude) : undefined,
        clientLongitude: info?.clientLongitude != null ? Number(info.clientLongitude) : undefined,
        positionUpdatedAt: info?.positionUpdatedAt
      })
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement suivi:', error)
      setLoading(false)
    }
  }

  const getEtapeIcon = (nom: string) => {
    switch (nom) {
      case 'Commande confirmée': return <Package className="h-4 w-4" />
      case 'En préparation': return <Clock className="h-4 w-4" />
      case 'Expédiée': return <Truck className="h-4 w-4" />
      case 'Livrée': return <CheckCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getEtapeColor = (statut: string) => {
    switch (statut) {
      case 'completed': return 'bg-green-500 text-white'
      case 'current': return 'bg-blue-500 text-white animate-pulse'
      case 'pending': return 'bg-gray-200 text-gray-500'
      default: return 'bg-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Chargement du suivi...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Suivi de commande {numeroCommande}</span>
            {tracking?.tempsEstime && (
              <Badge className="bg-green-500 text-white">
                <Clock className="h-4 w-4 mr-1" />
                Arrivée dans {tracking.tempsEstime}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Informations livreur */}
      {tracking?.livreur && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Votre livreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{tracking.livreur.nom}</h4>
                  <p className="text-sm text-gray-600">Livreur professionnel</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étapes de livraison */}
      <Card>
        <CardHeader>
          <CardTitle>Statut de la livraison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tracking?.etapes.map((etape, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEtapeColor(etape.statut)}`}>
                  {getEtapeIcon(etape.nom)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${etape.statut === 'current' ? 'text-blue-600' : ''}`}>
                    {etape.nom}
                  </h4>
                  {etape.timestamp && (
                    <p className="text-sm text-gray-600">{etape.timestamp}</p>
                  )}
                </div>
                {etape.statut === 'current' && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    En cours
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Position en temps réel */}
      {tracking?.livreur && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Position en temps réel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeliveryMap
              center={{
                lat: tracking.livreur.latitude,
                lon: tracking.livreur.longitude
              }}
              zoom={12}
              drawRoute
              markers={[
                ...(tracking.merchantLatitude != null && tracking.merchantLongitude != null ? [{
                  id: "merchant",
                  label: "Point marchand",
                  lat: tracking.merchantLatitude,
                  lon: tracking.merchantLongitude,
                  markerType: "merchant" as const,
                }] : []),
                {
                  id: "livreur",
                  label: `Livreur: ${tracking.livreur.nom}`,
                  lat: tracking.livreur.latitude,
                  lon: tracking.livreur.longitude,
                  markerType: "live" as const,
                },
                ...(tracking.clientLatitude != null && tracking.clientLongitude != null ? [{
                  id: "client",
                  label: "Point livraison client",
                  lat: tracking.clientLatitude,
                  lon: tracking.clientLongitude,
                  markerType: "client" as const,
                }] : []),
              ]}
            />
            <p className="text-xs text-gray-500 mt-3">
              Position actuelle: {tracking.livreur.latitude.toFixed(6)}, {tracking.livreur.longitude.toFixed(6)}
            </p>
            {tracking.positionUpdatedAt && (
              <p className="text-xs text-gray-500">
                Dernière mise à jour: {new Date(tracking.positionUpdatedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
