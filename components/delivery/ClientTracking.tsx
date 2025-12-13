"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, Truck, Package, CheckCircle } from 'lucide-react'

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
}

export default function ClientTracking({ commandeId, numeroCommande }: ClientTrackingProps) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrackingInfo()
    const interval = setInterval(loadTrackingInfo, 30000) // Actualiser toutes les 30s
    return () => clearInterval(interval)
  }, [commandeId])

  const loadTrackingInfo = async () => {
    try {
      // Simulation des données de suivi
      setTracking({
        statut: 'EXPEDIEE',
        livreur: {
          nom: 'Jean Dupont',
          telephone: '+33 6 12 34 56 78',
          latitude: 48.8566,
          longitude: 2.3522
        },
        tempsEstime: '25 min',
        etapes: [
          { nom: 'Commande confirmée', statut: 'completed', timestamp: '14:30' },
          { nom: 'En préparation', statut: 'completed', timestamp: '14:45' },
          { nom: 'Expédiée', statut: 'current', timestamp: '15:10' },
          { nom: 'Livrée', statut: 'pending' }
        ]
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
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-medium mb-2">Livreur en route</h4>
              <p className="text-sm text-gray-600 mb-4">
                Position mise à jour en temps réel
              </p>
              <div className="text-xs text-gray-500">
                Lat: {tracking.livreur.latitude.toFixed(6)}<br />
                Lng: {tracking.livreur.longitude.toFixed(6)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}