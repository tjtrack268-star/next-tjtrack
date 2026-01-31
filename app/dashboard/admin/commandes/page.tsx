"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Clock, CheckCircle, Truck, Package, MoreVertical, Eye, Edit, AlertTriangle } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ pending: 0, processing: 0, shipped: 0, delivered: 0 })
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      console.log('📥 Chargement des commandes...')
      const response = await apiClient.get<any>("/commandes")
      console.log('📦 Réponse API:', response)
      
      // L'API retourne un objet ApiResponse avec data
      const data = response.data || response
      console.log('✅ Commandes:', data)
      
      setOrders(Array.isArray(data) ? data : [])
      
      // Calculer les stats
      const ordersArray = Array.isArray(data) ? data : []
      const newStats = {
        pending: ordersArray.filter(o => o.statut === 'EN_ATTENTE').length,
        processing: ordersArray.filter(o => o.statut === 'EN_COURS').length,
        shipped: ordersArray.filter(o => o.statut === 'EXPEDIEE').length,
        delivered: ordersArray.filter(o => o.statut === 'LIVREE').length
      }
      setStats(newStats)
    } catch (err) {
      console.error('❌ Erreur:', err)
      toast({ title: "Erreur de chargement", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.put(`/commandes/${orderId}/statut`, { statut: newStatus })
      toast({ title: "Statut mis à jour" })
      loadOrders()
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'secondary'
      case 'EN_COURS': return 'default'
      case 'EXPEDIEE': return 'outline'
      case 'LIVREE': return 'default'
      default: return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente'
      case 'EN_COURS': return 'En cours'
      case 'EXPEDIEE': return 'Expédiée'
      case 'LIVREE': return 'Livrée'
      default: return status
    }
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">Suivez et gérez toutes les commandes</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold">{stats.processing}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Expédiées</p>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Livrées</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucune commande
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.numeroCommande}</TableCell>
                      <TableCell>{order.client?.name || order.emailClient || 'Client'}</TableCell>
                      <TableCell>{order.items?.length || 0} articles</TableCell>
                      <TableCell>{order.montantTotal} FCFA</TableCell>
                      <TableCell>{new Date(order.dateCommande).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.statut) as any}>
                          {getStatusLabel(order.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {order.statut === 'EN_ATTENTE' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'EN_COURS')}>
                                <Package className="h-4 w-4 mr-2" />
                                Marquer en cours
                              </DropdownMenuItem>
                            )}
                            {order.statut === 'EN_COURS' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'EXPEDIEE')}>
                                <Truck className="h-4 w-4 mr-2" />
                                Marquer expédiée
                              </DropdownMenuItem>
                            )}
                            {order.statut === 'EXPEDIEE' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'LIVREE')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer livrée
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog détails commande */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la commande</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">N° Commande</p>
                    <p className="font-medium">{selectedOrder.numeroCommande}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedOrder.client?.name || selectedOrder.emailClient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant total</p>
                    <p className="font-medium">{selectedOrder.montantTotal} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge variant={getStatusColor(selectedOrder.statut) as any}>
                      {getStatusLabel(selectedOrder.statut)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Adresse de livraison</p>
                  <p className="text-sm">
                    {selectedOrder.adresseLivraison?.rue}<br/>
                    {selectedOrder.adresseLivraison?.ville}, {selectedOrder.adresseLivraison?.codePostal}<br/>
                    Tél: {selectedOrder.adresseLivraison?.telephone}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Articles</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.article?.designation} x {item.quantite}</span>
                        <span>{item.sousTotal} FCFA</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}
