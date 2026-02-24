"use client"

import { useCallback, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Clock, Phone } from 'lucide-react'
import DeliveryMap from '@/components/maps/DeliveryMap'
import { apiClient } from '@/lib/api'
import { useDeliveryWebSocket } from '@/hooks/use-delivery-websocket'

interface LiveTrackingProps {
  commandeId: number
  livreurInfo?: {
    nom: string
    telephone: string
  }
}

interface TrackingData {
  latitude: number
  longitude: number
  timestamp: number
  status: string
  merchantLatitude?: number
  merchantLongitude?: number
  clientLatitude?: number
  clientLongitude?: number
}

export default function LiveTracking({ commandeId, livreurInfo }: LiveTrackingProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [connected, setConnected] = useState(false)
  const onSocketMessage = useCallback((payload: any) => {
    if (payload?.latitude == null || payload?.longitude == null) return
    setTrackingData((prev) => ({
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      timestamp: payload?.timestamp ? Number(payload.timestamp) : Date.now(),
      status: String(payload?.status || prev?.status || "EN_COURS"),
      merchantLatitude: prev?.merchantLatitude,
      merchantLongitude: prev?.merchantLongitude,
      clientLatitude: prev?.clientLatitude,
      clientLongitude: prev?.clientLongitude,
    }))
    setConnected(true)
  }, [])

  useDeliveryWebSocket({ commandeId, enabled: true, onMessage: onSocketMessage })

  useEffect(() => {
    const loadLive = async () => {
      try {
        const response = await apiClient.get<any>(`/commandes/${commandeId}/info-livraison`)
        const info = response?.data || response
        const lat = info?.livreurLatitude ?? info?.latitude
        const lon = info?.livreurLongitude ?? info?.longitude
        if (lat == null || lon == null) {
          setConnected(false)
          return
        }
        setTrackingData({
          latitude: Number(lat),
          longitude: Number(lon),
          timestamp: info?.positionUpdatedAt ? new Date(info.positionUpdatedAt).getTime() : Date.now(),
          status: String(info?.statut || 'EN_ROUTE'),
          merchantLatitude: info?.merchantLatitude != null ? Number(info.merchantLatitude) : undefined,
          merchantLongitude: info?.merchantLongitude != null ? Number(info.merchantLongitude) : undefined,
          clientLatitude: info?.clientLatitude != null ? Number(info.clientLatitude) : undefined,
          clientLongitude: info?.clientLongitude != null ? Number(info.clientLongitude) : undefined,
        })
        setConnected(true)
      } catch (error) {
        setConnected(false)
      }
    }

    loadLive()
    const interval = setInterval(loadLive, 10000)

    return () => clearInterval(interval)
  }, [commandeId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_ROUTE': return 'bg-blue-500'
      case 'EN_COURS': return 'bg-blue-500'
      case 'ARRIVE': return 'bg-green-500'
      case 'LIVRE': return 'bg-gray-500'
      case 'LIVREE': return 'bg-gray-500'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'EN_ROUTE': return 'En route'
      case 'EN_COURS': return 'En cours'
      case 'ARRIVE': return 'Arrivé'
      case 'LIVRE': return 'Livré'
      case 'LIVREE': return 'Livré'
      default: return 'En attente'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Suivi en Temps Réel
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {livreurInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Livreur assigné</h4>
            <div className="flex items-center justify-between">
              <span>{livreurInfo.nom}</span>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{livreurInfo.telephone}</span>
              </div>
            </div>
          </div>
        )}

        {trackingData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(trackingData.status)} text-white`}>
                {getStatusText(trackingData.status)}
              </Badge>
              <span className="text-sm text-gray-600">
                <Clock className="h-4 w-4 inline mr-1" />
                {new Date(trackingData.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">Position actuelle</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Lat: {trackingData.latitude.toFixed(6)}</p>
                <p>Lng: {trackingData.longitude.toFixed(6)}</p>
              </div>
            </div>

            <DeliveryMap
              center={{ lat: trackingData.latitude, lon: trackingData.longitude }}
              zoom={14}
              markers={[
                ...(trackingData.merchantLatitude != null && trackingData.merchantLongitude != null ? [{
                  id: "merchant-live",
                  label: "Marchand",
                  lat: trackingData.merchantLatitude,
                  lon: trackingData.merchantLongitude,
                  markerType: "merchant" as const,
                }] : []),
                {
                  id: "livreur-live",
                  label: "Livreur en temps réel",
                  lat: trackingData.latitude,
                  lon: trackingData.longitude,
                  markerType: "live",
                },
                ...(trackingData.clientLatitude != null && trackingData.clientLongitude != null ? [{
                  id: "client-live",
                  label: "Client",
                  lat: trackingData.clientLatitude,
                  lon: trackingData.clientLongitude,
                  markerType: "client" as const,
                }] : []),
              ]}
              drawRoute
            />

            <div className="text-xs text-gray-500 text-center">
              Dernière mise à jour: {new Date(trackingData.timestamp).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>En attente des données de localisation...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
