"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Truck, Clock, CheckCircle } from 'lucide-react'
import { useCommandesMerchant } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'

function DeliveryAssignmentComponent({ commandeId, onAssigned }: { commandeId: number, onAssigned: (result: any) => void }) {
  const [livreurs, setLivreurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLivreurs()
  }, [])

  const loadLivreurs = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1.0/commandes/livreurs-disponibles?lat=48.8566&lon=2.3522`)
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
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1.0/commandes/${commandeId}/assigner-livreur?clientId=1&merchantId=1`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (data.success) {
        onAssigned(data.data)
      }
    } catch (error) {
      console.error('Erreur assignation:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des livreurs...</div>
  }

  return (
    <div className="space-y-3">
      {livreurs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun livreur disponible dans votre zone</p>
        </div>
      ) : (
        livreurs.map((livreur) => (
          <div key={livreur.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">{livreur.nom}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{livreur.telephone}</span>
                  <span>{livreur.distance?.toFixed(1)} km</span>
                </div>
              </div>
            </div>
            <Button onClick={() => assignerLivreur(livreur.id)}>
              Assigner
            </Button>
          </div>
        ))
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
      dateCommande: String(c.dateCommande || new Date().toISOString())
    }
  }).filter((c) => ['CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE'].includes(c.statut))

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'CONFIRMEE': return 'bg-blue-500'
      case 'EN_PREPARATION': return 'bg-yellow-500'
      case 'EXPEDIEE': return 'bg-green-500'
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
                            <p className="font-medium">{commande.montantTotal}€</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-medium">
                              {new Date(commande.dateCommande).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6">
                        {commande.statut === 'CONFIRMEE' || commande.statut === 'EN_PREPARATION' ? (
                          <Button onClick={() => handleAssignDelivery(commande)}>
                            <Truck className="h-4 w-4 mr-2" />
                            Assigner Livreur
                          </Button>
                        ) : commande.statut === 'EXPEDIEE' ? (
                          <Badge variant="outline" className="text-green-600">
                            <Truck className="h-4 w-4 mr-1" />
                            En livraison
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
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Truck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Livreurs Disponibles</h3>
                      <p className="text-gray-600 mb-6">Sélectionnez un livreur pour cette commande</p>
                      
                      <DeliveryAssignmentComponent 
                        commandeId={selectedCommande.id}
                        onAssigned={handleDeliveryAssigned}
                      />

                    </div>
                  </div>
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