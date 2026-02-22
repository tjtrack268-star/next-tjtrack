"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Truck, Clock, CheckCircle, MapPin } from 'lucide-react'
import { useCommandesMerchant } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import DualDeliveryAssignment from '@/components/delivery/DualDeliveryAssignment'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tjtracks.com/api/v1.0"

function DeliveryAssignmentComponent({ commandeId, onAssigned }: { commandeId: number, onAssigned: (result: any) => void }) {
  const [livreurs, setLivreurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    getMerchantLocation()
  }, [])

  useEffect(() => {
    if (location) {
      loadLivreurs()
    }
  }, [location])

  const getMerchantLocation = async () => {
    try {
      // Essayer d'abord de récupérer la localisation du marchand depuis le backend
      const token = localStorage.getItem('tj-track-token')
      const response = await fetch(`${API_BASE_URL}/merchants/${user?.userId}/location`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.latitude && data.data?.longitude) {
          setLocation({ lat: data.data.latitude, lon: data.data.longitude })
          return
        }
      }
      
      // Si endpoint non disponible (404) ou pas de localisation sauvegardée, utiliser la géolocalisation du navigateur
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setLocation({ lat: latitude, lon: longitude })
          },
          (error) => {
            console.error('Erreur géolocalisation:', error)
            setLocationError('Impossible d\'obtenir votre localisation')
            // Utiliser Yaoundé, Cameroun (Etoudi) par défaut en cas d'erreur
            setLocation({ lat: 3.8480, lon: 11.5021 })
          }
        )
      } else {
        setLocationError('Géolocalisation non supportée')
        setLocation({ lat: 3.8480, lon: 11.5021 })
      }
    } catch (error) {
      console.error('Erreur récupération localisation:', error)
      // En cas d'erreur (endpoint non disponible), utiliser géolocalisation ou défaut
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setLocation({ lat: latitude, lon: longitude })
          },
          () => {
            setLocationError('Erreur de localisation')
            setLocation({ lat: 3.8480, lon: 11.5021 })
          }
        )
      } else {
        setLocationError('Erreur de localisation')
        setLocation({ lat: 3.8480, lon: 11.5021 })
      }
    }
  }

  const loadLivreurs = async () => {
    if (!location) return
    
    try {
      const token = localStorage.getItem('tj-track-token')
      const response = await fetch(`${API_BASE_URL}/ecommerce/livreur/disponibles?lat=${location.lat}&lon=${location.lon}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setLivreurs(data.data || [])
      }
    } catch (error) {
      console.error('Erreur chargement livreurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignerLivreur = async (livreurId: number) => {
    if (isAssigning) return
    
    setIsAssigning(true)
    setAssignmentError(null)
    
    try {
      if (!user?.userId) {
        throw new Error('Utilisateur non connecté')
      }
      
      const token = localStorage.getItem('tj-track-token')
      const url = `${API_BASE_URL}/commandes/${commandeId}/assigner-livreur?clientId=1&merchantEmail=${encodeURIComponent(user.userId)}&livreurId=${livreurId}`
      
      const response = await fetch(url, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Assignment failed:', response.status, errorText)
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        onAssigned(data.data)
      } else {
        throw new Error(data.message || 'Échec de l\'assignation')
      }
    } catch (error: any) {
      setAssignmentError(error.message)
    } finally {
      setIsAssigning(false)
    }
  }

  if (loading || !location) {
    return (
      <div className="text-center py-8">
        {!location ? (
          <div className="space-y-2">
            <MapPin className="h-8 w-8 mx-auto text-blue-500 animate-pulse" />
            <p>Détection de votre localisation...</p>
            {locationError && <p className="text-red-500 text-sm">{locationError}</p>}
          </div>
        ) : (
          <p>Chargement des livreurs...</p>
        )}
      </div>
    )
  }

  const saveMerchantLocation = async () => {
    if (!location) return
    
    try {
      const token = localStorage.getItem('tj-track-token')
      const response = await fetch(`${API_BASE_URL}/merchants/${user?.userId}/location`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lon
        })
      })
      
      if (response.ok) {
        console.log('Localisation sauvegardée avec succès')
      } else {
        console.log('Endpoint de sauvegarde non disponible')
      }
    } catch (error) {
      console.log('Endpoint de sauvegarde non encore déployé:', error)
    }
  }

  return (
    <div className="space-y-3">
      {assignmentError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {assignmentError}
        </div>
      )}
      
      {location && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>Position: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
          </div>
          <Button size="sm" variant="outline" onClick={saveMerchantLocation}>
            Sauvegarder position
          </Button>
        </div>
      )}
      
      {livreurs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun livreur disponible</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={getMerchantLocation}
          >
            Actualiser la position
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {livreurs.some(l => l.zone === 'Proximité') && (
            <div className="text-sm font-medium text-green-600 mb-2">
              ✓ Livreurs à proximité disponibles
            </div>
          )}
          {livreurs.some(l => l.zone === 'Autre ville') && !livreurs.some(l => l.zone === 'Proximité') && (
            <div className="text-sm font-medium text-orange-600 mb-2">
              ⚠️ Aucun livreur à proximité - Livreurs d'autres zones disponibles
            </div>
          )}
          {livreurs.map((livreur) => (
            <div key={livreur.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  livreur.zone === 'Proximité' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <Truck className={`h-5 w-5 ${
                    livreur.zone === 'Proximité' ? 'text-green-600' : 'text-orange-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium">{livreur.nom}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{livreur.telephone}</span>
                    <span>{livreur.distance?.toFixed(1)} km</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      livreur.zone === 'Proximité' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {livreur.zone}
                    </span>
                  </div>
                  {livreur.note && (
                    <p className="text-xs text-gray-500 mt-1">{livreur.note}</p>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => assignerLivreur(livreur.id)}
                disabled={isAssigning}
              >
                {isAssigning ? 'Attribution...' : 'Assigner'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface Commande {
  id: number
  numeroCommande: string
  client: { name: string }
  statut: string
  montantTotal: number
  dateCommande: string
  livreurId?: number
  livreurNom?: string
}

export default function LivraisonsPage() {
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const [showAssignment, setShowAssignment] = useState(false)
  const [assignedDelivery, setAssignedDelivery] = useState<any>(null)

  const { user } = useAuth()
  const { data: commandesResponse, isLoading, error, refetch } = useCommandesMerchant(user?.userId || "")
  const commandesData = Array.isArray(commandesResponse?.data) ? commandesResponse.data : []

  // Filtrer et mapper les commandes comme dans la page Commandes Clients
  const commandes: Commande[] = (commandesData as unknown[]).map((cmd: unknown) => {
    const c = cmd as Record<string, unknown>
    return {
      id: Number(c.id) || 0,
      numeroCommande: String(c.code || c.numeroCommande || `CMD-${c.id}`),
      client: c.client as { name: string } || { name: 'Client inconnu' },
      statut: String(c.statut || "EN_ATTENTE"),
      montantTotal: Number(c.montantTotal || c.totalTtc) || 0,
      dateCommande: String(c.dateCommande || new Date().toISOString()),
      livreurId: c.livreurId ? Number(c.livreurId) : undefined,
      livreurNom: c.livreurNom ? String(c.livreurNom) : undefined
    }
  }).filter((c) => ['CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE'].includes(c.statut))

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'CONFIRMEE': return 'bg-blue-500'
      case 'EN_PREPARATION': return 'bg-yellow-500'
      case 'EXPEDIEE': return 'bg-orange-500'
      case 'LIVREE': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }

  const handleAssignDelivery = (commande: Commande) => {
    setSelectedCommande(commande)
    setShowAssignment(true)
  }

  const handleDeliveryAssigned = (result: any) => {
    setAssignedDelivery(result)
    setShowAssignment(false)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des commandes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Erreur lors du chargement des commandes</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestion des Livraisons</h1>
        <p className="text-gray-600">Assignez des livreurs et suivez vos commandes en temps réel</p>
      </div>

      <Tabs defaultValue="commandes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="commandes">Commandes à Livrer</TabsTrigger>
          <TabsTrigger value="suivi">Suivi Temps Réel</TabsTrigger>
        </TabsList>

        <TabsContent value="commandes">
          <div className="grid gap-6">
            {commandes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Aucune commande à livrer</h3>
                  <p className="text-gray-600">Les commandes confirmées apparaîtront ici</p>
                </CardContent>
              </Card>
            ) : (
              commandes.map((commande) => (
                <Card key={commande.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={`${getStatutColor(commande.statut)} text-white`}>
                            <span className="ml-1">{commande.statut}</span>
                          </Badge>
                          <h3 className="font-medium">{commande.numeroCommande}</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Client:</span>
                            <p className="font-medium">{commande.client?.name || 'Client inconnu'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Montant:</span>
                            <p className="font-medium">{commande.montantTotal.toLocaleString()} XAF</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-medium">
                              {new Date(commande.dateCommande).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {commande.livreurId && (
                          <div className="mt-3 p-2 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                Livreur assigné: <strong>{commande.livreurNom || 'Livreur #' + commande.livreurId}</strong>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-6">
                        {(commande.statut === 'CONFIRMEE' || commande.statut === 'EN_PREPARATION') && !commande.livreurId ? (
                          <Button onClick={() => handleAssignDelivery(commande)}>
                            <Truck className="h-4 w-4 mr-2" />
                            Assigner Livreur
                          </Button>
                        ) : commande.statut === 'EN_PREPARATION' && commande.livreurId ? (
                          <Badge variant="outline" className="text-yellow-600">
                            <Clock className="h-4 w-4 mr-1" />
                            En préparation
                          </Badge>
                        ) : commande.statut === 'EXPEDIEE' ? (
                          <Badge variant="outline" className="text-orange-600">
                            <Truck className="h-4 w-4 mr-1" />
                            En cours de livraison
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Livrée
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {showAssignment && selectedCommande && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                      Assigner un livreur - {selectedCommande.numeroCommande}
                    </h2>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAssignment(false)}
                    >
                      Fermer
                    </Button>
                  </div>
                  <DualDeliveryAssignment
                    commandeId={selectedCommande.id}
                    merchantEmail={user?.userId || ""}
                    merchantLat={0}
                    merchantLon={0}
                    clientVille="" // Sera récupéré depuis l'API
                    merchantVille="" // Sera récupéré depuis l'API
                    onAssigned={(result) => {
                      handleDeliveryAssigned(result)
                      setShowAssignment(false)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suivi">
          {assignedDelivery ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Suivi en Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Livreur assigné</h4>
                    <div className="flex items-center justify-between">
                      <span>{assignedDelivery.livreurNom}</span>
                      <span className="text-sm">{assignedDelivery.telephone}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">
                      Livreur en route<br />
                      <span className="text-xs">Temps estimé: {assignedDelivery.tempsEstime}</span>
                    </p>
                  </div>
                  <Badge className="w-full justify-center bg-green-500 text-white">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Livraison en cours
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Truck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucune livraison en cours</h3>
                <p className="text-gray-600">Assignez un livreur pour commencer le suivi</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
