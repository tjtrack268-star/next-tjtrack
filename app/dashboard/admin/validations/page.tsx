"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Store, Truck, MapPin, Phone, Mail, Loader2, Users, Eye } from "lucide-react"
import { usePendingUsers } from "@/hooks/use-api"

const roleConfig = {
  LIVREUR: { label: "Livreur", icon: Truck, color: "bg-yellow-500", priority: 2 },
  COMMERCANT: { label: "Commerçant", icon: Store, color: "bg-green-500", priority: 3 },
  FOURNISSEUR: { label: "Fournisseur", icon: Truck, color: "bg-orange-500", priority: 4 },
  CLIENT: { label: "Client", icon: Users, color: "bg-blue-500", priority: 5 },
}

export default function AdminValidationsPage() {
  const router = useRouter()
  const { data: pendingUsers = [], isLoading, error, refetch } = usePendingUsers()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erreur lors du chargement des demandes</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validations en attente</h1>
        <p className="text-muted-foreground">Approuvez ou rejetez les demandes d'inscription</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Store className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commerçants</p>
                <p className="text-2xl font-bold">{pendingUsers.filter((u) => u.roles?.includes("COMMERCANT")).length}</p>
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
                <p className="text-sm text-muted-foreground">Livreurs</p>
                <p className="text-2xl font-bold">{pendingUsers.filter((u) => u.roles?.includes("LIVREUR")).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users List */}
      {pendingUsers.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucune demande en attente</h3>
            <p className="text-muted-foreground">Toutes les demandes ont été traitées</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingUsers.map((pendingUser) => {
            // Get the highest priority role for display
            const primaryRole = pendingUser.roles?.reduce((highest, current) => {
              const currentConfig = roleConfig[current as keyof typeof roleConfig]
              const highestConfig = roleConfig[highest as keyof typeof roleConfig]
              if (!currentConfig) return highest
              if (!highestConfig) return current
              return currentConfig.priority < highestConfig.priority ? current : highest
            }, pendingUser.roles[0]) || 'CLIENT'
            
            const roleInfo = roleConfig[primaryRole as keyof typeof roleConfig] || roleConfig.CLIENT
            
            return (
            <Card
              key={String(pendingUser.userId || pendingUser.email)}
              className="glass-card hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {pendingUser.roles?.map((role) => {
                      const config = roleConfig[role as keyof typeof roleConfig]
                      if (!config) return null
                      return (
                        <Badge key={role} variant="outline" className="gap-1">
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      )
                    })}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pendingUser.createdAt ? new Date(String(pendingUser.createdAt)).toLocaleDateString("fr-FR") : "N/A"}
                  </span>
                </div>
                <CardTitle className="text-lg mt-2">{String(pendingUser.enterpriseName || pendingUser.name || "N/A")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{String(pendingUser.email || "")}</span>
                  </div>
                  {pendingUser.phoneNumber && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{String(pendingUser.phoneNumber || "")}</span>
                    </div>
                  )}
                  {pendingUser.town && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{String(pendingUser.town || "")}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 gradient-primary text-white"
                    onClick={() => router.push(`/dashboard/admin/validations/${pendingUser.userId}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
          })}
        </div>
      )}
    </div>
  )
}
