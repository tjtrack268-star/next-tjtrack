"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  User,
  Phone,
  MapPin,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import DeliveryAssignment from "./DeliveryAssignment"
import DualDeliveryAssignment from "./DualDeliveryAssignment"

interface MerchantOrder {
  id: number
  numeroCommande: string
  statut: "CONFIRMEE" | "EN_PREPARATION" | "PRETE" | "ASSIGNEE" | "EN_COURS" | "LIVREE"
  montantTotal: number
  dateCommande: string
  client: {
    nom: string
    prenom: string
    telephone: string
    email: string
  }
  adresseLivraison: {
    nom: string
    prenom: string
    telephone: string
    adresse: string
    ville: string
    codePostal: string
  }
  items: Array<{
    id: number
    designation: string
    quantite: number
    prixUnitaire: number
  }>
  livreur?: {
    id: number
    nom: string
    telephone: string
    statut: string
  }
  refusMotif?: string
  fraisLivraison: number
}

const statusConfig = {
  "CONFIRMEE": { label: "Confirmée", color: "bg-blue-500", icon: CheckCircle },
  "EN_PREPARATION": { label: "En préparation", color: "bg-orange-500", icon: Package },
  "PRETE": { label: "Prête à livrer", color: "bg-purple-500", icon: Package },
  "ASSIGNEE": { label: "Assignée au livreur", color: "bg-yellow-500", icon: Truck },
  "EN_COURS": { label: "En cours de livraison", color: "bg-blue-600", icon: Truck },
  "LIVREE": { label: "Livrée", color: "bg-green-500", icon: CheckCircle },
}

export default function MerchantOrderManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<MerchantOrder | null>(null)

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["merchantOrders", user?.userId],
    queryFn: async () => {
      const response = await apiClient.get(`/commandes/merchant/${user?.userId}`)
      return Array.isArray(response) ? response : (response.data || [])
    },
    enabled: !!user?.userId,
  })

  const markReadyMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiClient.put(`/commandes/${orderId}/prete`)
    },
    onSuccess: () => {
      toast({
        title: "Commande prête",
        description: "La commande est maintenant prête pour l'assignation",
      })
      queryClient.invalidateQueries({ queryKey: ["merchantOrders"] })
    }
  })

  const reassignMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiClient.put(`/commandes/${orderId}/reassigner`)
    },
    onSuccess: () => {
      toast({
        title: "Commande réassignée",
        description: "La commande sera assignée à un nouveau livreur",
      })
      queryClient.invalidateQueries({ queryKey: ["merchantOrders"] })
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

  const filteredOrders = orders?.filter((order: MerchantOrder) => {
    const matchesSearch = order.numeroCommande.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.statut === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const handleMarkReady = (orderId: number) => {
    markReadyMutation.mutate(orderId)
  }

  const handleReassign = (orderId: number) => {
    reassignMutation.mutate(orderId)
  }

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const getOrdersByStatus = (status: string) => {
    return orders?.filter((order: MerchantOrder) => order.statut === status).length || 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Commandes</h1>
          <p className="text-muted-foreground">
            Gérez vos commandes et assignez les livraisons
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">En préparation</p>
                  <p className="text-2xl font-bold">{getOrdersByStatus("EN_PREPARATION")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Prêtes</p>
                  <p className="text-2xl font-bold">{getOrdersByStatus("PRETE")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">En livraison</p>
                  <p className="text-2xl font-bold">{getOrdersByStatus("EN_COURS")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Livrées</p>
                  <p className="text-2xl font-bold">{getOrdersByStatus("LIVREE")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro de commande ou nom client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="CONFIRMEE">Confirmées</SelectItem>
              <SelectItem value="EN_PREPARATION">En préparation</SelectItem>
              <SelectItem value="PRETE">Prêtes</SelectItem>
              <SelectItem value="ASSIGNEE">Assignées</SelectItem>
              <SelectItem value="EN_COURS">En cours</SelectItem>
              <SelectItem value="LIVREE">Livrées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || statusFilter !== "all" 
                    ? "Aucune commande ne correspond à vos critères de recherche"
                    : "Vous n'avez pas encore de commandes"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order: MerchantOrder) => {
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
                          Passée le {formatDate(order.dateCommande)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${statusColor} text-white`}>
                          {statusLabel}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(order.montantTotal)}</p>
                          <p className="text-sm text-muted-foreground">
                            Frais livraison: {formatPrice(order.fraisLivraison)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Client
                        </h4>
                        <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                          <p className="font-medium">
                            {order.client.prenom} {order.client.nom}
                          </p>
                          <p className="text-sm text-muted-foreground">{order.client.email}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => callPhone(order.client.telephone)}
                            className="w-full"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {order.client.telephone}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Adresse de livraison
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => callPhone(order.adresseLivraison.telephone)}
                            className="w-full"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {order.adresseLivraison.telephone}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Articles commandés</h4>
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

                    {/* Delivery Info */}
                    {order.livreur && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Livreur assigné</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{order.livreur.nom}</p>
                            <p className="text-sm text-blue-600">{order.livreur.telephone}</p>
                          </div>
                          <Badge variant="outline" className="text-blue-600">
                            {order.livreur.statut}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Refusal Info */}
                    {order.refusMotif && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Commande refusée</p>
                            <p className="text-sm text-red-700">{order.refusMotif}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      {order.statut === "EN_PREPARATION" && (
                        <Button
                          onClick={() => handleMarkReady(order.id)}
                          disabled={markReadyMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {markReadyMutation.isPending ? "Marquage..." : "Marquer prête"}
                        </Button>
                      )}

                      {order.statut === "PRETE" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedOrder(order)} className="flex-1">
                              <Truck className="h-4 w-4 mr-2" />
                              Assigner un livreur
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Assigner un livreur - Commande #{order.numeroCommande}</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <DualDeliveryAssignment
                                commandeId={selectedOrder.id}
                                merchantEmail={user?.userId || ""}
                                merchantLat={0} // TODO: Get from merchant profile
                                merchantLon={0} // TODO: Get from merchant profile
                                clientVille={selectedOrder.adresseLivraison.ville}
                                merchantVille="Yaoundé" // TODO: Get from merchant profile
                                onAssigned={(result) => {
                                  toast({
                                    title: "Livreur(s) assigné(s)",
                                    description: result.livreurDeliveryNom 
                                      ? `${result.livreurPickupNom} (pickup) et ${result.livreurDeliveryNom} (delivery) ont été assignés`
                                      : `${result.livreurNom} a été assigné à cette commande`,
                                  })
                                  queryClient.invalidateQueries({ queryKey: ["merchantOrders"] })
                                  setSelectedOrder(null)
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      )}

                      {(order.statut === "ASSIGNEE" && order.refusMotif) && (
                        <Button
                          onClick={() => handleReassign(order.id)}
                          disabled={reassignMutation.isPending}
                          variant="outline"
                          className="flex-1"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          {reassignMutation.isPending ? "Réassignation..." : "Réassigner"}
                        </Button>
                      )}

                      {order.livreur && order.statut !== "LIVREE" && (
                        <Button
                          variant="outline"
                          onClick={() => callPhone(order.livreur!.telephone)}
                          className="flex-1"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Contacter le livreur
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}