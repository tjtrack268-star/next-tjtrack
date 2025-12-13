"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ShoppingCart, Package, Store, Truck, Users, CheckCircle, AlertTriangle } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"
import { useAdminGlobalStats, useOrdersByMerchant, useOrdersByClient, useStockByMerchant, useSupplierStats } from "@/hooks/use-admin-global"

export default function AdminGlobalPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<string>("all")
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all")

  const { data: globalStats } = useAdminGlobalStats()
  const { data: ordersByMerchant } = useOrdersByMerchant()
  const { data: ordersByClient } = useOrdersByClient()
  const { data: stockByMerchant } = useStockByMerchant()
  const { data: supplierStats } = useSupplierStats()

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vue Globale</h1>
          <p className="text-muted-foreground">Informations globales sur toutes les activités de la plateforme</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold">{globalStats.orders.total}</p>
                  <p className="text-xs text-green-600">+{globalStats.orders.pending} en attente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produits</p>
                  <p className="text-2xl font-bold">{globalStats.products.total}</p>
                  <p className="text-xs text-red-600">{globalStats.products.outOfStock} ruptures</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Store className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commerçants</p>
                  <p className="text-2xl font-bold">{globalStats.merchants.total}</p>
                  <p className="text-xs text-orange-600">{globalStats.merchants.pending} en attente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clients</p>
                  <p className="text-2xl font-bold">{globalStats.clients.total}</p>
                  <p className="text-xs text-green-600">+{globalStats.clients.new} nouveaux</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Truck className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fournisseurs</p>
                  <p className="text-2xl font-bold">{globalStats.suppliers.total}</p>
                  <p className="text-xs text-yellow-600">{globalStats.suppliers.pending} en attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Commandes par Commerçant</CardTitle>
                  <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Tous les commerçants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les commerçants</SelectItem>
                      {ordersByMerchant.map((merchant) => (
                        <SelectItem key={merchant.name} value={merchant.name}>
                          {merchant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commerçant</TableHead>
                        <TableHead>Commandes</TableHead>
                        <TableHead>Revenus</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersByMerchant.map((merchant) => (
                        <TableRow key={merchant.name}>
                          <TableCell className="font-medium">{merchant.name}</TableCell>
                          <TableCell>{merchant.orders}</TableCell>
                          <TableCell>{merchant.revenue.toLocaleString()}€</TableCell>
                          <TableCell>
                            <Badge variant={merchant.status === "active" ? "default" : "secondary"}>
                              {merchant.status === "active" ? "Actif" : "En attente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top Clients</CardTitle>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Tous les clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les clients</SelectItem>
                      {ordersByClient.map((client) => (
                        <SelectItem key={client.name} value={client.name}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Commandes</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Dernière</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersByClient.map((client) => (
                        <TableRow key={client.name}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.orders}</TableCell>
                          <TableCell>{client.total}€</TableCell>
                          <TableCell>{client.lastOrder}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Produits par Commerçant</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockByMerchant}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="products" fill="#8884d8" name="Total Produits" />
                    <Bar dataKey="inStock" fill="#82ca9d" name="En Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>État des Stocks par Commerçant</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commerçant</TableHead>
                      <TableHead>Total Produits</TableHead>
                      <TableHead>En Stock</TableHead>
                      <TableHead>Stock Faible</TableHead>
                      <TableHead>Rupture</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockByMerchant.map((merchant) => (
                      <TableRow key={merchant.name}>
                        <TableCell className="font-medium">{merchant.name}</TableCell>
                        <TableCell>{merchant.products}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {merchant.inStock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            {merchant.lowStock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            {merchant.outOfStock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={merchant.outOfStock > 10 ? "destructive" : merchant.lowStock > 20 ? "secondary" : "default"}>
                            {merchant.outOfStock > 10 ? "Critique" : merchant.lowStock > 20 ? "Attention" : "Bon"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Performance des Fournisseurs</CardTitle>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tous les fournisseurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les fournisseurs</SelectItem>
                    {supplierStats.map((supplier) => (
                      <SelectItem key={supplier.name} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Commandes</TableHead>
                      <TableHead>Produits</TableHead>
                      <TableHead>Délai Livraison</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierStats.map((supplier) => (
                      <TableRow key={supplier.name}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.orders}</TableCell>
                        <TableCell>{supplier.products}</TableCell>
                        <TableCell>{supplier.delivery}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.rating >= 4.5 ? "default" : "secondary"}>
                            {supplier.rating}/5
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  )
}