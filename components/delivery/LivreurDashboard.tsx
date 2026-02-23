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
  RefreshCw,
  UserPlus
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
  statut: "ASSIGNEE" | "ASSIGNEE_PICKUP" | "ASSIGNEE_FINAL" | "ACCEPTEE" | "ACCEPTEE_FINAL" | "EN_COURS" | "EN_COURS_PICKUP" | "EN_TRANSIT_VERS_FINAL" | "LIVREE" | "REFUSEE"
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
    ville: string
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
  livreurPickup?: {
    nom: string
    telephone: string
  }
  livreurFinal?: {
    id: number
    nom: string
    telephone: string
  }
  isPickupDelivery?: boolean
  expedieVersLivreurFinal?: boolean
}

const statusConfig = {
  "ASSIGNEE": { label: "Nouvelle assignation", color: "bg-blue-500", icon: Package },
  "ASSIGNEE_PICKUP": { label: "Assigné pour récupération", color: "bg-blue-600", icon: Package },
  "ASSIGNEE_FINAL": { label: "Assigné pour livraison finale", color: "bg-purple-500", icon: Package },
  "ACCEPTEE": { label: "Acceptée", color: "bg-green-500", icon: CheckCircle },
  "ACCEPTEE_FINAL": { label: "Acceptée (livraison finale)", color: "bg-green-600", icon: CheckCircle },
  "EN_COURS": { label: "En cours de livraison", color: "bg-orange-500", icon: Truck },
  "EN_COURS_PICKUP": { label: "En cours de récupération", color: "bg-orange-600", icon: Truck },
  "EN_TRANSIT_VERS_FINAL": { label: "En transit vers vous", color: "bg-purple-600", icon: Truck },
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
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedLivreurFinal, setSelectedLivreurFinal] = useState("")
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tjtracks.com/api/v1.0"

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["deliveryOrders", user?.userId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/commandes/livreur`) as any
        console.log('🔍 Raw API response:', response)
        const ordersData = Array.isArray(response) ? response : (response.data || [])
        console.log('📦 Processed orders:', ordersData)
        // Log détaillé de chaque commande
        ordersData.forEach((order: any) => {
          console.log(`📋 Order #${order.numeroCommande}:`, {
            id: order.id,
            statut: order.statut,
            livreurPickup: order.livreurPickup,
            livreurFinal: order.livreurFinal,
            expedieVersLivreurFinal: order.expedieVersLivreurFinal,
            hasPickup: !!order.livreurPickup,
            hasFinal: !!order.livreurFinal
          })
        })
        return ordersData
      } catch (error) {
        console.error('Error fetching delivery orders:', error)
        throw error
      }
    },
    enabled: !!user?.userId,
    retry: 1,
    retryDelay: 1000,
  })

  const { data: livreurs } = useQuery({
    queryKey: ["livreurs"],
    queryFn: async () => {
      const response = await apiClient.get(`/livreur/disponibles`) as any
      return response.data || []
    },
  })

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiClient.put(`/commandes/livraisons/${orderId}/accepter`)
    },
    onSuccess: () => {
      toast({
        title: "Commande acceptée",
        description: "Vous avez accepté cette livraison",
      })
      // Refresh all tabs to update counts
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
      // Switch to accepted tab to show the accepted order
      setSelectedTab("acceptees")
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
      return await apiClient.put(`/commandes/livraisons/${orderId}/refuser`, { motif: reason })
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
      return await apiClient.put(`/commandes/livraisons/${orderId}/demarrer`)
    },
    onSuccess: () => {
      toast({
        title: "Livraison démarrée",
        description: "Le client a été notifié du départ",
      })
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
      // Switch to en-cours tab to show the order in progress
      setSelectedTab("en-cours")
    }
  })

  const completeDeliveryMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiClient.put(`/commandes/livraisons/${orderId}/terminer`)
    },
    onSuccess: () => {
      toast({
        title: "Livraison terminée",
        description: "La commande a été marquée comme livrée",
      })
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
      // Switch to terminees tab to show the completed order
      setSelectedTab("terminees")
    }
  })

  const assignLivreurFinalMutation = useMutation({
    mutationFn: async ({ livraisonId, livreurFinalId }: { livraisonId: number, livreurFinalId: number }) => {
      return await apiClient.post(`/livraisons/${livraisonId}/assigner-final`, { livreurFinalId })
    },
    onSuccess: () => {
      toast({
        title: "Livreur final assigné",
        description: "Le livreur final a été notifié",
      })
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
      setShowAssignDialog(false)
      setSelectedLivreurFinal("")
      setSelectedOrder(null)
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le livreur final",
        variant: "destructive",
      })
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
    console.log(`Filtering order ${order.id} with status ${order.statut} for tab ${selectedTab}`) // Debug log
    if (selectedTab === "nouvelles") return ["ASSIGNEE", "ASSIGNEE_PICKUP", "ASSIGNEE_FINAL", "EN_TRANSIT_VERS_FINAL"].includes(order.statut)
    if (selectedTab === "acceptees") return ["ACCEPTEE", "ACCEPTEE_FINAL"].includes(order.statut)
    if (selectedTab === "en-cours") return ["EN_COURS", "EN_COURS_PICKUP"].includes(order.statut)
    if (selectedTab === "terminees") return ["LIVREE", "REFUSEE"].includes(order.statut)
    return true
  }) || []

  console.log(`Filtered orders for tab ${selectedTab}:`, filteredOrders) // Debug log

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

  const handleAssignLivreurFinal = () => {
    if (!selectedOrder || !selectedLivreurFinal) return
    // Récupérer l'ID de la livraison depuis la commande
    assignLivreurFinalMutation.mutate({
      livraisonId: selectedOrder.id, // Utiliser l'ID de la commande comme ID de livraison
      livreurFinalId: parseInt(selectedLivreurFinal)
    })
  }

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const downloadFacture = async (orderId: number) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tj-track-token") : null
      const response = await fetch(`${API_BASE_URL}/commandes/${orderId}/facture`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) {
        let message = `Erreur ${response.status}`
        try {
          const errorData = await response.json()
          message = errorData?.message || message
        } catch {
          // Ignore parse error and keep default message
        }
        throw new Error(message)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `facture-${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast({
        title: "Téléchargement impossible",
        description: error?.message || "Impossible de télécharger la facture",
        variant: "destructive",
      })
    }
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
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold mb-4">Erreur de connexion</h1>
          <p className="text-muted-foreground">Impossible de se connecter au serveur</p>
          <p className="text-sm text-red-500">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard Livreur</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos livraisons et communiquez avec les marchands et clients
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto whitespace-nowrap gap-2 p-1">
            <TabsTrigger value="nouvelles" className="relative flex-none min-w-[130px]">
              Nouvelles
              {orders?.filter((o: DeliveryOrder) => ["ASSIGNEE", "ASSIGNEE_PICKUP", "ASSIGNEE_FINAL", "EN_TRANSIT_VERS_FINAL"].includes(o.statut)).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {orders?.filter((o: DeliveryOrder) => ["ASSIGNEE", "ASSIGNEE_PICKUP", "ASSIGNEE_FINAL", "EN_TRANSIT_VERS_FINAL"].includes(o.statut)).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="acceptees" className="flex-none min-w-[130px]">
              Acceptées ({orders?.filter((o: DeliveryOrder) => ["ACCEPTEE", "ACCEPTEE_FINAL"].includes(o.statut)).length || 0})
            </TabsTrigger>
            <TabsTrigger value="en-cours" className="flex-none min-w-[130px]">
              En cours ({orders?.filter((o: DeliveryOrder) => ["EN_COURS", "EN_COURS_PICKUP"].includes(o.statut)).length || 0})
            </TabsTrigger>
            <TabsTrigger value="terminees" className="flex-none min-w-[130px]">
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
              filteredOrders.map((order: DeliveryOrder, index: number) => {
                const StatusIcon = statusConfig[order.statut]?.icon || Package
                const statusColor = statusConfig[order.statut]?.color || "bg-gray-500"
                
                // Adapter le label selon le type de livreur
                let statusLabel = statusConfig[order.statut]?.label || order.statut
                
                // Debug: afficher les champs pour comprendre
                console.log(`🔍 Order ${order.id} - livreurPickup:`, order.livreurPickup, 'livreurFinal:', order.livreurFinal)
                
                if (order.statut === "EN_COURS" && order.livreurFinal) {
                  statusLabel = "En cours d'expédition"
                } else if (order.statut === "EN_COURS" && order.livreurPickup) {
                  statusLabel = "En cours de livraison"
                }

                return (
                  <Card key={`${order.id}-${order.statut}-${index}`} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <StatusIcon className="h-5 w-5" />
                            Commande #{order.numeroCommande}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Assignée le {formatDate(order.dateCommande)}
                          </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <Badge className={`${statusColor} text-white`}>
                            {statusLabel}
                          </Badge>
                          <div className="text-left sm:text-right">
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
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => callPhone(order.adresseLivraison.telephone)}
                              className="w-full sm:flex-1"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Appeler
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMaps(`${order.adresseLivraison.adresse}, ${order.adresseLivraison.ville}`)}
                              className="w-full sm:flex-1"
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

                      {(order.statut === "ASSIGNEE_FINAL" || order.statut === "ACCEPTEE_FINAL") && order.livreurPickup && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Truck className="h-4 w-4 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-purple-800">Livraison relayée</p>
                              <p className="text-sm text-purple-700">
                                Le livreur {order.livreurPickup.nom} {order.expedieVersLivreurFinal ? 'a expédié' : 'va vous transférer'} cette commande
                              </p>
                              {!order.expedieVersLivreurFinal && (
                                <p className="text-xs text-purple-600 mt-1">
                                  ⏳ En attente de l'expédition
                                </p>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => callPhone(order.livreurPickup!.telephone)}
                                className="mt-2"
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Contacter {order.livreurPickup.nom}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {(order.statut === "ACCEPTEE" || order.statut === "EN_COURS_PICKUP") && order.livreurFinal && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <UserPlus className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-800">Livreur final assigné</p>
                              <p className="text-sm text-blue-700">
                                {order.livreurFinal.nom} - {order.livreurFinal.telephone}
                              </p>
                              {order.expedieVersLivreurFinal && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ Colis expédié au livreur final
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        {/* Bouton facture disponible pour tous les statuts */}
                        {order.statut !== "REFUSEE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFacture(order.id)}
                            className="w-full sm:w-auto mb-2 sm:mb-0"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Télécharger la facture
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 border-t pt-4">
                        {(order.statut === "ASSIGNEE" || order.statut === "ASSIGNEE_PICKUP" || order.statut === "ASSIGNEE_FINAL" || order.statut === "EN_TRANSIT_VERS_FINAL") && (
                          <>
                            <Button
                              onClick={() => handleAcceptOrder(order.id)}
                              disabled={acceptOrderMutation.isPending}
                              className="w-full sm:flex-1"
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
                                  className="w-full sm:flex-1"
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
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedOrder(null)
                                        setRefusalReason("")
                                        setCustomReason("")
                                      }}
                                      className="w-full sm:flex-1"
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleRefuseOrder}
                                      disabled={refuseOrderMutation.isPending}
                                      className="w-full sm:flex-1"
                                    >
                                      {refuseOrderMutation.isPending ? "Refus..." : "Confirmer le refus"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        {order.statut === "ACCEPTEE" && order.livreurFinal && (
                          <Button
                            onClick={() => handleStartDelivery(order.id)}
                            disabled={startDeliveryMutation.isPending}
                            className="w-full"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            {startDeliveryMutation.isPending ? "Démarrage..." : "Démarrer l'expédition"}
                          </Button>
                        )}

                        {order.statut === "ACCEPTEE" && !order.livreurFinal && (
                          <Button
                            onClick={() => handleStartDelivery(order.id)}
                            disabled={startDeliveryMutation.isPending}
                            className="w-full"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            {startDeliveryMutation.isPending ? "Démarrage..." : "Démarrer la livraison"}
                          </Button>
                        )}

                        {order.statut === "ACCEPTEE_FINAL" && (
                          <div className="w-full space-y-2">
                            {!order.expedieVersLivreurFinal && (
                              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800 flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  En attente de l'expédition du livreur pickup
                                </p>
                              </div>
                            )}
                            <Button
                              onClick={() => handleStartDelivery(order.id)}
                              disabled={startDeliveryMutation.isPending || !order.expedieVersLivreurFinal}
                              className="w-full"
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              {startDeliveryMutation.isPending ? "Démarrage..." : "Démarrer la livraison"}
                            </Button>
                          </div>
                        )}

                        {order.statut === "EN_COURS" && order.livreurFinal && (
                          <Button
                            onClick={async () => {
                              try {
                                const response = await apiClient.post<{ success: boolean; message: string }>(
                                  `/commandes/${order.id}/expedier-vers-final`
                                )
                                toast({
                                  title: "Colis expédié",
                                  description: "Le livreur final a été notifié",
                                })
                                queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
                              } catch (error: any) {
                                const errorMessage = error?.message || "Impossible d'expédier le colis"
                                toast({
                                  title: "Erreur",
                                  description: errorMessage,
                                  variant: "destructive",
                                })
                              }
                            }}
                            className="w-full"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Marquer comme expédié
                          </Button>
                        )}

                        {order.statut === "EN_COURS" && order.livreurPickup && (
                          <Button
                            onClick={() => handleCompleteDelivery(order.id)}
                            disabled={completeDeliveryMutation.isPending}
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {completeDeliveryMutation.isPending ? "Finalisation..." : "Marquer comme livrée"}
                          </Button>
                        )}

                        {order.statut === "EN_COURS" && !order.livreurPickup && !order.livreurFinal && (
                          <>
                            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedOrder(order)}
                                  className="w-full sm:flex-1"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Assigner livreur final
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assigner un livreur final</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm text-muted-foreground">
                                    Sélectionnez un livreur pour la livraison finale de la commande #{order.numeroCommande}
                                  </p>
                                  <div>
                                    <label className="text-sm font-medium">Livreur final</label>
                                    <Select value={selectedLivreurFinal} onValueChange={setSelectedLivreurFinal}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un livreur" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {livreurs?.map((livreur: any) => (
                                          <SelectItem key={livreur.id} value={String(livreur.id)}>
                                            {livreur.nom} - {livreur.zone}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowAssignDialog(false)
                                        setSelectedLivreurFinal("")
                                        setSelectedOrder(null)
                                      }}
                                      className="w-full sm:flex-1"
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      onClick={handleAssignLivreurFinal}
                                      disabled={!selectedLivreurFinal || assignLivreurFinalMutation.isPending}
                                      className="w-full sm:flex-1"
                                    >
                                      {assignLivreurFinalMutation.isPending ? "Assignation..." : "Assigner"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              onClick={() => handleCompleteDelivery(order.id)}
                              disabled={completeDeliveryMutation.isPending}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {completeDeliveryMutation.isPending ? "Finalisation..." : "Marquer comme livrée"}
                            </Button>
                          </>
                        )}

                        {order.statut === "LIVREE" && (
                          <div className="w-full space-y-2">
                            <div className="text-center py-2">
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Livraison terminée
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => downloadFacture(order.id)}
                              className="w-full"
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Télécharger la facture
                            </Button>
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
