"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Search, MoreVertical, UserCheck, UserX, Mail, Store, Truck, ShieldCheck, Loader2, ChevronLeft, ChevronRight, Clock, Trash2, AlertCircle } from "lucide-react"
import { useAllUsers, useApproveUser, useUserAnalytics, useRejectUser, useHardDeleteUser, useBlockUser, useUserDeleteImpact } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { AdminGuard } from "@/components/admin-guard"
import { useDebounce } from "@/hooks/use-debounce"
import { useQueryClient } from "@tanstack/react-query"

const roleConfig = {
  LIVREUR: { label: "Livreur", icon: Truck, color: "bg-yellow-500", priority: 2 },
  CLIENT: { label: "Client", icon: Users, color: "bg-blue-500", priority: 5 },
  COMMERCANT: { label: "Commerçant", icon: Store, color: "bg-green-500", priority: 3 },
  FOURNISSEUR: { label: "Fournisseur", icon: Truck, color: "bg-orange-500", priority: 4 },
  ADMIN: { label: "Admin", icon: ShieldCheck, color: "bg-purple-500", priority: 1 },
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ userId: string; name: string } | null>(null)
  const [deleteReason, setDeleteReason] = useState("")
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [userToBlock, setUserToBlock] = useState<{ userId: string; name: string } | null>(null)
  const [blockReason, setBlockReason] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
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
  const rejectUserMutation = useRejectUser()
  const deleteUserMutation = useHardDeleteUser()
  const blockUserMutation = useBlockUser()
  const { data: deleteImpact, isLoading: isDeleteImpactLoading } = useUserDeleteImpact(
    userToDelete?.userId,
    deleteDialogOpen && !!userToDelete?.userId,
  )

  const handleApprove = async (userId: string) => {
    try {
      await approveUserMutation.mutateAsync({ userId, approvedBy: user?.email || "admin" })
      toast({
        title: "Utilisateur approuvé",
        description: "Le compte a été activé avec succès",
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

  const handleReject = async (userId: string) => {
    try {
      await rejectUserMutation.mutateAsync({ userId, rejectedBy: user?.email || "admin" })
      toast({
        title: "Utilisateur rejeté",
        description: "L'utilisateur a été rejeté avec succès",
        variant: "destructive",
      })
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'utilisateur",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    setUserToDelete({ userId, name: userName })
    setDeleteReason("")
    setDeleteDialogOpen(true)
  }

  const handleBlock = async (userId: string, userName: string) => {
    setUserToBlock({ userId, name: userName })
    setBlockReason("")
    setBlockDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    if (!deleteReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez saisir le motif de suppression du compte",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteUserMutation.mutateAsync({
        userId: userToDelete.userId,
        reason: deleteReason.trim(),
      })
      toast({
        title: "Compte supprimé",
        description: "Le compte a été supprimé avec succès",
      })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      setDeleteReason("")
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      })
    }
  }

  const confirmBlock = async () => {
    if (!userToBlock) return
    if (!blockReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez saisir le motif de blocage du compte",
        variant: "destructive",
      })
      return
    }

    try {
      await blockUserMutation.mutateAsync({
        userId: userToBlock.userId,
        reason: blockReason.trim(),
      })
      toast({
        title: "Compte bloqué",
        description: "Le compte a été bloqué avec succès",
      })
      setBlockDialogOpen(false)
      setUserToBlock(null)
      setBlockReason("")
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de bloquer le compte",
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
                  <SelectItem value="rejected">Rejeté</SelectItem>
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
                  // Get the highest priority role
                  const primaryRole = userItem.roles?.reduce((highest, current) => {
                    const currentConfig = roleConfig[current as keyof typeof roleConfig]
                    const highestConfig = roleConfig[highest as keyof typeof roleConfig]
                    if (!currentConfig) return highest
                    if (!highestConfig) return current
                    return currentConfig.priority < highestConfig.priority ? current : highest
                  }, userItem.roles[0]) || 'CLIENT'
                  
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
                        {userItem.isApproved === true ? (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Approuvé
                          </Badge>
                        ) : userItem.isApproved === false ? (
                          <Badge variant="destructive">
                            <UserX className="h-3 w-3 mr-1" />
                            Rejeté
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
                            {userItem.isApproved === null && (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => handleApprove(String(userItem.userId || userItem.email))}
                                  disabled={approveUserMutation.isPending}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approuver
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => handleReject(String(userItem.userId || userItem.email))}
                                  disabled={rejectUserMutation?.isPending}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Rejeter
                                </DropdownMenuItem>
                              </>
                            )}
                            {userItem.isApproved === false && (
                              <DropdownMenuItem
                                onSelect={() => {
                                  toast({
                                    title: "Fonctionnalité à venir",
                                    description: "La réinitialisation sera bientôt disponible",
                                  });
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Réinitialiser
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Contacter
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-orange-600 focus:text-orange-700"
                              onSelect={() => handleBlock(String(userItem.userId || userItem.email), userItem.name || userItem.email)}
                              disabled={blockUserMutation.isPending || userItem.isApproved === false}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Bloquer le compte
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => handleDelete(String(userItem.userId || userItem.email), userItem.name || userItem.email)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer le compte
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le compte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>{userToDelete?.name}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Attention</p>
            <p className="text-sm text-muted-foreground mt-1">
                  Le compte et ses profils liés seront supprimés définitivement si aucune dépendance métier ne bloque l'opération.
                </p>
              </div>
            </div>
          </div>
          {deleteDialogOpen && (
            <div className="p-3 rounded-lg bg-muted/40 border">
              <p className="text-sm font-medium">Impact suppression définitive</p>
              {isDeleteImpactLoading ? (
                <p className="text-xs text-muted-foreground mt-1">Analyse des dépendances...</p>
              ) : deleteImpact?.canHardDelete ? (
                <p className="text-xs text-green-700 mt-1">Aucune dépendance bloquante détectée.</p>
              ) : (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-destructive">
                    Suppression impossible actuellement ({deleteImpact?.blockingCount || 0} dépendance(s)).
                  </p>
                  {deleteImpact?.blockingReferences?.slice(0, 6).map((ref) => (
                    <p key={ref} className="text-xs text-muted-foreground">- {ref}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Motif de suppression</label>
            <Textarea
              placeholder="Exemple: Documents non conformes, fraude détectée, doublon..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Ce motif est obligatoire et sera journalisé côté serveur.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending || !deleteReason.trim() || isDeleteImpactLoading || deleteImpact?.canHardDelete === false}
            >
              {deleteUserMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquer le compte</DialogTitle>
            <DialogDescription>
              Le compte de <strong>{userToBlock?.name}</strong> sera désactivé (soft delete logique métier).
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-700">Blocage administratif</p>
                <p className="text-sm text-muted-foreground mt-1">
                  L'utilisateur ne pourra plus utiliser le compte tant qu'il n'est pas débloqué.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Motif de blocage</label>
            <Textarea
              placeholder="Exemple: activité suspecte, non-conformité des documents, abus..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Ce motif est obligatoire et sera journalisé côté serveur.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmBlock} disabled={blockUserMutation.isPending || !blockReason.trim()}>
              {blockUserMutation.isPending ? "Blocage..." : "Bloquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  )
}
