"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Phone,
  MapPin,
  MessageCircle,
  User,
  Store,
  Navigation,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"

interface DeliveryOrder {
  id: number
  numeroCommande: string
  statut: "ASSIGNEE" | "ACCEPTEE" | "EN_COURS" | "LIVREE" | "REFUSEE"
  montantTotal: number
  dateCommande: string
  dateLivraisonPrevue?: string
  adresseLivraison: {
    nom: string
    prenom: string
    telephone: string
    adresse: string
    ville: string
    codePostal: string
  }
  client: {
    nom: string
    telephone: string
    email: string
  }
  merchant: {
    nom: string
    telephone: string
    adresse: string
    ville: string
  }
  items: Array<{
    id: number
    designation: string
    quantite: number
    prixUnitaire: number
  }>
  fraisLivraison: number
  commentaire?: string
}

const statusConfig = {
  "ASSIGNEE": { label: "Nouvelle assignation", color: "bg-blue-500", icon: Package },
  "ACCEPTEE": { label: "Acceptée", color: "bg-green-500", icon: CheckCircle },
  "EN_COURS": { label: "En cours de livraison", color: "bg-orange-500", icon: Truck },
  "LIVREE": { label: "Livrée", color: "bg-emerald-500", icon: CheckCircle },
  "REFUSEE": { label: "Refusée", color: "bg-red-500", icon: XCircle },
}

const refusalReasons = [
  "Occupé avec une autre commande",
  "Pas disponible",
  "Zone de livraison trop éloignée",
  "Problème technique",
  "Autre"
]

export default function LivreurDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState("nouvelles")
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null)
  const [refusalReason, setRefusalReason] = useState("")
  const [customReason, setCustomReason] = useState("")

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["deliveryOrders", user?.userId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/commandes/livreur`)
        return Array.isArray(response) ? response : (response.data || [])
      } catch (error) {
        console.error('Error fetching delivery orders:', error)
        // Return empty array for now to prevent crashes
        return []
      }
    },
    enabled: !!user?.userId,
    retry: 3,
    retryDelay: 1000,
  })

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiClient.put(`/livraisons/${orderId}/accepter`)
    },
    onSuccess: () => {
      toast({
        title: "Commande acceptée",
        description: "Vous avez accepté cette livraison",
      })
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la commande",
        variant: "destructive",
      })
    }
  })

  const refuseOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number, reason: string }) => {
      return await apiClient.put(`/livraisons/${orderId}/refuser`, { motif: reason })
    },
    onSuccess: () => {
      toast({
        title: "Commande refusée",
        description: "Le marchand a été notifié de votre refus",
      })
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
      setSelectedOrder(null)
      setRefusalReason("")
      setCustomReason("")
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de refuser la commande",
        variant: "destructive",
      })
    }
  })

  const startDeliveryMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiClient.put(`/livraisons/${orderId}/demarrer`)
    },
    onSuccess: () => {
      toast({
        title: "Livraison démarrée",
        description: "Le client a été notifié du départ",
      })
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
    }
  })

  const completeDeliveryMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiClient.put(`/livraisons/${orderId}/terminer`)
    },
    onSuccess: () => {
      toast({
        title: "Livraison terminée",
        description: "La commande a été marquée comme livrée",
      })
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
    }
  })

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"
  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  const filteredOrders = orders?.filter((order: DeliveryOrder) => {
    if (selectedTab === "nouvelles") return order.statut === "ASSIGNEE"
    if (selectedTab === "acceptees") return order.statut === "ACCEPTEE"
    if (selectedTab === "en-cours") return order.statut === "EN_COURS"
    if (selectedTab === "terminees") return ["LIVREE", "REFUSEE"].includes(order.statut)
    return true
  }) || []

  const handleAcceptOrder = (orderId: number) => {
    acceptOrderMutation.mutate(orderId)
  }

  const handleRefuseOrder = () => {
    if (!selectedOrder) return
    
    const reason = refusalReason === "Autre" ? customReason : refusalReason
    if (!reason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif du refus",
        variant: "destructive",
      })
      return
    }

    refuseOrderMutation.mutate({
      orderId: selectedOrder.id,
      reason: reason.trim()
    })
  }

  const handleStartDelivery = (orderId: number) => {
    startDeliveryMutation.mutate(orderId)
  }

  const handleCompleteDelivery = (orderId: number) => {
    completeDeliveryMutation.mutate(orderId)
  }

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Livreur</h1>
          <p className="text-muted-foreground">
            Gérez vos livraisons et communiquez avec les marchands et clients
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nouvelles" className="relative">
              Nouvelles
              {filteredOrders.filter((o: DeliveryOrder) => o.statut === "ASSIGNEE").length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {filteredOrders.filter((o: DeliveryOrder) => o.statut === "ASSIGNEE").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="acceptees">
              Acceptées ({filteredOrders.filter((o: DeliveryOrder) => o.statut === "ACCEPTEE").length})
            </TabsTrigger>
            <TabsTrigger value="en-cours">
              En cours ({filteredOrders.filter((o: DeliveryOrder) => o.statut === "EN_COURS").length})
            </TabsTrigger>
            <TabsTrigger value="terminees">
              Terminées ({filteredOrders.filter((o: DeliveryOrder) => ["LIVREE", "REFUSEE"].includes(o.statut)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                  <p className="text-muted-foreground text-center">
                    {selectedTab === "nouvelles" 
                      ? "Aucune nouvelle assignation"
                      : `Aucune commande dans cette catégorie`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order: DeliveryOrder) => {
                const StatusIcon = statusConfig[order.statut]?.icon || Package
                const statusColor = statusConfig[order.statut]?.color || "bg-gray-500"
                const statusLabel = statusConfig[order.statut]?.label || order.statut

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <StatusIcon className="h-5 w-5" />
                            Commande #{order.numeroCommande}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Assignée le {formatDate(order.dateCommande)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${statusColor} text-white`}>
                            {statusLabel}
                          </Badge>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(order.montantTotal)}</p>
                            <p className="text-sm text-muted-foreground">
                              Frais: {formatPrice(order.fraisLivraison)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            Marchand
                          </h4>
                          <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                            <p className="font-medium">{order.merchant.nom}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.merchant.adresse}, {order.merchant.ville}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => callPhone(order.merchant.telephone)}
                              className="w-full"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              {order.merchant.telephone}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Client
                          </h4>
                          <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                            <p className="font-medium">
                              {order.adresseLivraison.prenom} {order.adresseLivraison.nom}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.adresseLivraison.adresse}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.adresseLivraison.ville} {order.adresseLivraison.codePostal}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => callPhone(order.adresseLivraison.telephone)}
                                className="flex-1"
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Appeler
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMaps(`${order.adresseLivraison.adresse}, ${order.adresseLivraison.ville}`)}
                                className="flex-1"
                              >
                                <Navigation className="h-4 w-4 mr-2" />
                                GPS
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Articles à livrer</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                              <span className="text-sm">{item.designation}</span>
                              <span className="text-sm font-medium">
                                {item.quantite} × {formatPrice(item.prixUnitaire)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.dateLivraisonPrevue && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            Livraison prévue: {formatDate(order.dateLivraisonPrevue)}
                          </span>
                        </div>
                      )}

                      {order.commentaire && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Instructions spéciales:</p>
                              <p className="text-sm text-yellow-700">{order.commentaire}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t">
                        {order.statut === "ASSIGNEE" && (
                          <>
                            <Button
                              onClick={() => handleAcceptOrder(order.id)}
                              disabled={acceptOrderMutation.isPending}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {acceptOrderMutation.isPending ? "Acceptation..." : "Accepter"}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => setSelectedOrder(order)}
                                  disabled={refuseOrderMutation.isPending}
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Refuser
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Refuser la commande #{order.numeroCommande}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Motif du refus</label>
                                    <Select value={refusalReason} onValueChange={setRefusalReason}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un motif" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {refusalReasons.map((reason) => (
                                          <SelectItem key={reason} value={reason}>
                                            {reason}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {refusalReason === "Autre" && (
                                    <div>
                                      <label className="text-sm font-medium">Précisez le motif</label>
                                      <Textarea
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder="Expliquez la raison du refus..."
                                        className="mt-1"
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedOrder(null)
                                        setRefusalReason("")
                                        setCustomReason("")
                                      }}
                                      className="flex-1"
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleRefuseOrder}
                                      disabled={refuseOrderMutation.isPending}
                                      className="flex-1"
                                    >
                                      {refuseOrderMutation.isPending ? "Refus..." : "Confirmer le refus"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        {order.statut === "ACCEPTEE" && (
                          <Button
                            onClick={() => handleStartDelivery(order.id)}
                            disabled={startDeliveryMutation.isPending}
                            className="w-full"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            {startDeliveryMutation.isPending ? "Démarrage..." : "Démarrer la livraison"}
                          </Button>
                        )}

                        {order.statut === "EN_COURS" && (
                          <Button
                            onClick={() => handleCompleteDelivery(order.id)}
                            disabled={completeDeliveryMutation.isPending}
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {completeDeliveryMutation.isPending ? "Finalisation..." : "Marquer comme livrée"}
                          </Button>
                        )}

                        {order.statut === "LIVREE" && (
                          <div className="w-full text-center py-2">
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Livraison terminée
                            </Badge>
                          </div>
                        )}

                        {order.statut === "REFUSEE" && (
                          <div className="w-full text-center py-2">
                            <Badge variant="outline" className="text-red-600">
                              <XCircle className="h-4 w-4 mr-1" />
                              Commande refusée
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}