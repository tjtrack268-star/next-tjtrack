"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, MoreVertical, UserCheck, UserX, Mail, Store, Truck, ShieldCheck, Loader2, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useAllUsers, useApproveUser, useUserAnalytics } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { AdminGuard } from "@/components/admin-guard"
import { useConfirm } from "@/hooks/use-confirm"
import { useDebounce } from "@/hooks/use-debounce"

const roleConfig = {
  CLIENT: { label: "Client", icon: Users, color: "bg-blue-500" },
  COMMERCANT: { label: "Commerçant", icon: Store, color: "bg-green-500" },
  FOURNISSEUR: { label: "Fournisseur", icon: Truck, color: "bg-orange-500" },
  ADMIN: { label: "Admin", icon: ShieldCheck, color: "bg-purple-500" },
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const { user } = useAuth()
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm()
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: 20,
    ...(roleFilter && roleFilter !== "all" && { role: roleFilter }),
    ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
    ...(debouncedSearch && { search: debouncedSearch })
  }), [currentPage, roleFilter, statusFilter, debouncedSearch])

  const { data, isLoading, error, refetch } = useAllUsers(queryParams)
  const { data: userStats } = useUserAnalytics()
  const users = data?.users || []
  const totalPages = Math.ceil((data?.total || 0) / 20)
  const approveUserMutation = useApproveUser()

  const handleApprove = async (userId: string, userName: string) => {
    const confirmed = await confirm({
      title: "Approuver l'utilisateur",
      description: `Êtes-vous sûr de vouloir approuver ${userName} ? Cette action ne peut pas être annulée.`,
      confirmText: "Approuver",
      cancelText: "Annuler"
    })
    
    if (!confirmed) return
    
    try {
      await approveUserMutation.mutateAsync({ userId, approvedBy: user?.email || "admin" })
      toast({
        title: "Utilisateur approuvé",
        description: `${userName} a été approuvé avec succès`,
      })
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'utilisateur",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminGuard>
    )
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="text-center py-12">
          <p className="text-destructive">Erreur lors du chargement des utilisateurs</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Administrez les comptes utilisateurs</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(roleConfig).map(([role, config]) => {
            const roleData = userStats?.roleDistribution?.find(r => r.role === role)
            const count = roleData?.count || 0
            return (
              <Card key={role} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}/10`}>
                      <config.icon className={`h-5 w-5 ${config.color.replace("bg-", "text-")}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{config.label}s</p>
                      <p className="text-2xl font-bold">{count}</p>
                      {roleData && (
                        <p className="text-xs text-muted-foreground">{roleData.percentage.toFixed(1)}%</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search and Filters */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="COMMERCANT">Commerçant</SelectItem>
                  <SelectItem value="FOURNISSEUR">Fournisseur</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="verified">Vérifié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tous les utilisateurs ({data?.total || 0})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-center">Vérifié</TableHead>
                  <TableHead className="text-center">Approuvé</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userItem) => {
                  const primaryRole = userItem.roles?.[0] || 'CLIENT'
                  const roleInfo = roleConfig[primaryRole as keyof typeof roleConfig] || roleConfig.CLIENT
                  return (
                    <TableRow key={String(userItem.userId || userItem.email)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {String(userItem.name || userItem.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{userItem.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{userItem.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${roleInfo.color}/10`}>
                            <roleInfo.icon className={`h-3 w-3 ${roleInfo.color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="text-sm">{roleInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {userItem.isAccountVerified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Vérifié
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <UserX className="h-3 w-3 mr-1" />
                            Non vérifié
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {userItem.isApproved ? (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Approuvé
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-200 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!userItem.isApproved && (
                              <DropdownMenuItem
                                onClick={() => handleApprove(userItem.userId || userItem.email, userItem.name || userItem.email)}
                                disabled={approveUserMutation.isPending}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Contacter
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}