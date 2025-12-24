"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Clock, CheckCircle, Truck, Package, MoreVertical, Eye, Edit, AlertTriangle } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"
import { useOrderManagement } from "@/hooks/use-order-management"

export default function AdminOrdersPage() {
  const initialOrders = [
    { id: "CMD-001", customer: "Jean Dupont", total: 89.99, status: "pending", date: "2024-01-15", items: 3, livreurId: null },
    { id: "CMD-002", customer: "Marie Martin", total: 156.50, status: "processing", date: "2024-01-15", items: 2, livreurId: null },
    { id: "CMD-003", customer: "Pierre Durand", total: 45.00, status: "shipped", date: "2024-01-14", items: 1, livreurId: 1 },
    { id: "CMD-004", customer: "Sophie Bernard", total: 234.99, status: "delivered", date: "2024-01-14", items: 4, livreurId: 2 },
  ]
  
  const { orders, markAsShipped, canMarkAsShipped, assignDelivery } = useOrderManagement(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'processing': return 'default'
      case 'shipped': return 'outline'
      case 'delivered': return 'default'
      default: return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'processing': return 'En cours'
      case 'shipped': return 'Expédiée'
      case 'delivered': return 'Livrée'
      default: return status
    }
  }

  const handleMarkAsShipped = (order: any) => {
    markAsShipped(order.id)
  }

  const handleAssignDelivery = (order: any) => {
    setSelectedOrder(order)
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
                  <p className="text-2xl font-bold">23</p>
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
                  <p className="text-2xl font-bold">45</p>
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
                  <p className="text-2xl font-bold">67</p>
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
                  <p className="text-2xl font-bold">234</p>
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
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.items} articles</TableCell>
                    <TableCell>€{order.total}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(order.status) as any}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        {!order.livreurId && order.status !== 'delivered' && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Sans livreur
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier statut
                          </DropdownMenuItem>
                          {!order.livreurId && (
                            <DropdownMenuItem onClick={() => handleAssignDelivery(order)}>
                              <Truck className="h-4 w-4 mr-2" />
                              Affecter livreur
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsShipped(order)}
                            disabled={!canMarkAsShipped(order) || order.status === 'shipped' || order.status === 'delivered'}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Marquer expédiée
                            {!canMarkAsShipped(order) && (
                              <AlertTriangle className="h-4 w-4 ml-2 text-orange-500" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog pour affecter un livreur */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Affecter un livreur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Cette commande doit avoir un livreur assigné avant de pouvoir être marquée comme expédiée.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground">
                Commande: <strong>{selectedOrder?.id}</strong><br/>
                Client: <strong>{selectedOrder?.customer}</strong>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Simuler l'affectation d'un livreur
                    if (selectedOrder) {
                      assignDelivery(selectedOrder.id, 1)
                      setSelectedOrder(null)
                    }
                  }}
                  className="flex-1"
                >
                  Affecter automatiquement
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}