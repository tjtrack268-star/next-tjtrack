"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, Store, Truck, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"

export default function AdminCommunicationPage() {
  const [activeTab, setActiveTab] = useState("messages")

  const conversations = [
    { id: 1, user: "Boutique ABC", role: "COMMERCANT", subject: "Demande d'approbation produit", status: "urgent", lastMessage: "Il y a 5 min", unread: 3 },
    { id: 2, user: "Fournisseur XYZ", role: "FOURNISSEUR", subject: "Problème de stock", status: "normal", lastMessage: "Il y a 1h", unread: 1 },
    { id: 3, user: "Jean Dupont", role: "CLIENT", subject: "Réclamation commande #1234", status: "urgent", lastMessage: "Il y a 2h", unread: 2 },
    { id: 4, user: "Livreur Express", role: "LIVREUR", subject: "Retard de livraison", status: "normal", lastMessage: "Il y a 3h", unread: 0 },
  ]

  const notifications = [
    { id: 1, type: "merchant_approval", message: "Nouvelle demande d'approbation: Boutique Mode", time: "Il y a 10 min" },
    { id: 2, type: "product_review", message: "Produit signalé: T-shirt Rouge", time: "Il y a 30 min" },
    { id: 3, type: "payment_issue", message: "Problème de paiement: Commande #5678", time: "Il y a 1h" },
    { id: 4, type: "supplier_request", message: "Nouveau fournisseur: Tech Solutions", time: "Il y a 2h" },
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'COMMERCANT': return <Store className="h-4 w-4" />
      case 'FOURNISSEUR': return <Truck className="h-4 w-4" />
      case 'CLIENT': return <Users className="h-4 w-4" />
      case 'LIVREUR': return <Truck className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'urgent' ? 'destructive' : 'secondary'
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Centre de Communication</h1>
          <p className="text-muted-foreground">Gérez toutes vos interactions avec les utilisateurs</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Messages Non Lus</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Urgents</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Demandes Commerçants</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Résolus Aujourd'hui</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="broadcast">Diffusion</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversations Actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-4">
                        {getRoleIcon(conv.role)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{conv.user}</h4>
                            <Badge variant="outline">{conv.role}</Badge>
                            {conv.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{conv.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(conv.status) as any}>
                          {conv.status === 'urgent' ? 'Urgent' : 'Normal'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{conv.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications Système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">{notif.message}</p>
                          <p className="text-sm text-muted-foreground">{notif.time}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Traiter
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Diffusion de Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button className="h-20 flex-col gap-2">
                    <Store className="h-6 w-6" />
                    <span>Message aux Commerçants</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2" variant="outline">
                    <Truck className="h-6 w-6" />
                    <span>Message aux Fournisseurs</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2" variant="outline">
                    <Users className="h-6 w-6" />
                    <span>Message aux Clients</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2" variant="outline">
                    <Mail className="h-6 w-6" />
                    <span>Newsletter Générale</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  )
}