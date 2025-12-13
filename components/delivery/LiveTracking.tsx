"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Clock, Phone } from 'lucide-react'

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
}

export default function LiveTracking({ commandeId, livreurInfo }: LiveTrackingProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Simulation WebSocket (à remplacer par vraie connexion)
    const interval = setInterval(() => {
      // Simulation de mouvement du livreur
      setTrackingData({
        latitude: 48.8566 + (Math.random() - 0.5) * 0.01,
        longitude: 2.3522 + (Math.random() - 0.5) * 0.01,
        timestamp: Date.now(),
        status: 'EN_ROUTE'
      })
      setConnected(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [commandeId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_ROUTE': return 'bg-blue-500'
      case 'ARRIVE': return 'bg-green-500'
      case 'LIVRE': return 'bg-gray-500'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'EN_ROUTE': return 'En route'
      case 'ARRIVE': return 'Arrivé'
      case 'LIVRE': return 'Livré'
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

            {/* Simulation d'une mini-carte */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">
                Carte interactive disponible<br />
                <span className="text-xs">Position mise à jour en temps réel</span>
              </p>
            </div>

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