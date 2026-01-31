"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye,
  Star,
  Download,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

function useUserOrders() {
  return useQuery({
    queryKey: ["userOrders"],
    queryFn: async () => {
      const response = await apiClient.get("/commandes/client") as any
      return Array.isArray(response) ? response : (response.data || [])
    },
  })
}

const statusConfig = {
  "EN_ATTENTE": { label: "En attente", color: "bg-yellow-500", icon: Clock },
  "CONFIRMEE": { label: "Confirmée", color: "bg-blue-500", icon: CheckCircle },
  "EN_PREPARATION": { label: "En préparation", color: "bg-orange-500", icon: Package },
  "EXPEDIEE": { label: "Expédiée", color: "bg-purple-500", icon: Truck },
  "EN_ATTENTE_CONFIRMATION": { label: "Livrée - À confirmer", color: "bg-amber-500", icon: Clock },
  "LIVREE": { label: "Livrée", color: "bg-green-500", icon: CheckCircle },
  "ANNULEE": { label: "Annulée", color: "bg-red-500", icon: XCircle },
}

const paymentStatusConfig = {
  "EN_ATTENTE": { label: "En attente", color: "bg-yellow-500" },
  "PAYE": { label: "Payé", color: "bg-green-500" },
  "PARTIAL": { label: "Partiel", color: "bg-orange-500" },
  "ECHUE": { label: "Échu", color: "bg-red-500" },
}

export default function MyOrdersPage() {
  const { toast } = useToast()
  const { data: orders, isLoading, error, refetch } = useUserOrders()
  const [selectedTab, setSelectedTab] = useState("all")

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"
  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR")

  const filteredOrders = Array.isArray(orders) ? orders.filter((order: any) => {
    if (selectedTab === "all") return true
    if (selectedTab === "pending") return ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION"].includes(order.statut)
    if (selectedTab === "shipped") return ["EXPEDIEE"].includes(order.statut)
    if (selectedTab === "delivered") return ["LIVREE"].includes(order.statut)
    if (selectedTab === "cancelled") return ["ANNULEE"].includes(order.statut)
    return true
  }) : []

  const handleTrackOrder = (orderNumber: string) => {
    window.open(`/suivi/${orderNumber}`, '_blank')
  }

  const handleReorder = async (orderId: number) => {
    try {
      toast({
        title: "Commande ajoutée au panier",
        description: "Tous les articles ont été ajoutés à votre panier",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de recommander",
        variant: "destructive",
      })
    }
  }

  const handleDownloadInvoice = (orderId: number) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/commandes/${orderId}/facture`, '_blank')
  }

  const handleLeaveReview = (orderId: number) => {
    window.location.href = `/commandes/${orderId}/avis`
  }

  const handleConfirmDelivery = async (orderId: number) => {
    try {
      await apiClient.put(`/commandes/livraisons/${orderId}/confirmer-reception`)
      toast({
        title: "Livraison confirmée",
        description: "Merci d'avoir confirmé la réception de votre commande",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la livraison",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes commandes</h1>
        <p className="text-muted-foreground">
          Suivez vos commandes et gérez vos achats
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Toutes ({Array.isArray(orders) ? orders.length : 0})
          </TabsTrigger>
          <TabsTrigger value="pending">
            En cours ({Array.isArray(filteredOrders) ? filteredOrders.filter((o: any) => ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION"].includes(o.statut)).length : 0})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Expédiées ({Array.isArray(filteredOrders) ? filteredOrders.filter((o: any) => o.statut === "EXPEDIEE").length : 0})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Livrées ({Array.isArray(filteredOrders) ? filteredOrders.filter((o: any) => o.statut === "LIVREE").length : 0})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Annulées ({Array.isArray(filteredOrders) ? filteredOrders.filter((o: any) => o.statut === "ANNULEE").length : 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {selectedTab === "all" 
                    ? "Vous n'avez pas encore passé de commande"
                    : `Aucune commande dans cette catégorie`
                  }
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Découvrir nos produits
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order: any) => {
              const StatusIcon = (statusConfig as any)[order.statut]?.icon || Package
              const statusColor = (statusConfig as any)[order.statut]?.color || "bg-gray-500"
              const statusLabel = (statusConfig as any)[order.statut]?.label || order.statut
              
              const paymentStatusColor = (paymentStatusConfig as any)[order.statutPaiement || "EN_ATTENTE"]?.color || "bg-gray-500"
              const paymentStatusLabel = (paymentStatusConfig as any)[order.statutPaiement || "EN_ATTENTE"]?.label || "En attente"

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Commande #{order.numeroCommande}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Passée le {formatDate(order.dateCommande)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${statusColor} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusLabel}
                        </Badge>
                        <Badge className={`${paymentStatusColor} text-white`}>
                          {paymentStatusLabel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <img
                            src={item.article.photo || "/placeholder.svg"}
                            alt={item.article.designation}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.article.designation}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantite} × {formatPrice(item.prixUnitaire)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(item.sousTotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} article(s)
                        </p>
                        {order.dateLivraisonPrevue && (
                          <p className="text-sm text-muted-foreground">
                            Livraison prévue: {formatDate(order.dateLivraisonPrevue)}
                          </p>
                        )}
                        {order.dateLivraisonEffective && (
                          <p className="text-sm text-green-600">
                            Livré le: {formatDate(order.dateLivraisonEffective)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          Total: {formatPrice(order.montantTotal)}
                        </p>
                        {order.fraisLivraison && order.fraisLivraison > 0 && (
                          <p className="text-sm text-muted-foreground">
                            (dont {formatPrice(order.fraisLivraison)} de livraison)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.adresseLivraison && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-2">Adresse de livraison</h5>
                        <p className="text-sm text-muted-foreground">
                          {order.adresseLivraison.nom} {order.adresseLivraison.prenom}<br />
                          {order.adresseLivraison.adresse}<br />
                          {order.adresseLivraison.ville}, {order.adresseLivraison.codePostal}<br />
                          {order.adresseLivraison.telephone}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrackOrder(order.numeroCommande)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Suivre
                      </Button>
                      
                      {order.statut === "EN_ATTENTE_CONFIRMATION" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConfirmDelivery(order.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmer réception
                        </Button>
                      )}
                      
                      {order.statut === "LIVREE" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveReview(order.id)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Évaluer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorder(order.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Recommander
                          </Button>
                        </>
                      )}
                      
                      {order.statutPaiement === "PAYE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(order.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Facture
                        </Button>
                      )}
                      
                      {order.statut === "EN_ATTENTE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
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
  )
}
