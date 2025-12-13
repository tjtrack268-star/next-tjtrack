"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, XCircle, Store, Truck, MapPin, Phone, Mail, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePendingUsers, useApproveUser, useRejectUser } from "@/hooks/use-api"
import type { ProfileResponse } from "@/types/api"
import { useAuth } from "@/contexts/auth-context"

export default function AdminValidationsPage() {
  const [selectedUser, setSelectedUser] = useState<ProfileResponse | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: pendingUsers = [], isLoading, error, refetch } = usePendingUsers()
  const approveUserMutation = useApproveUser()
  const rejectUserMutation = useRejectUser()

  const handleApprove = async (userId: string) => {
    try {
      await approveUserMutation.mutateAsync({ userId, approvedBy: user?.email || "admin" })
      toast({
        title: "Utilisateur approuvé",
        description: "Le compte a été activé avec succès",
      })
      setSelectedUser(null)
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'utilisateur",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    if (!selectedUser) return
    try {
      await rejectUserMutation.mutateAsync({
        userId: String(selectedUser.userId || selectedUser.email),
        rejectedBy: user?.email || "admin",
      })
      toast({
        title: "Demande rejetée",
        description: "L'utilisateur a été notifié du rejet",
        variant: "destructive",
      })
      setSelectedUser(null)
      setShowRejectDialog(false)
      setRejectReason("")
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'utilisateur",
        variant: "destructive",
      })
    }
  }

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
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fournisseurs</p>
                <p className="text-2xl font-bold">{pendingUsers.filter((u) => u.roles?.includes("FOURNISSEUR")).length}</p>
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
          {pendingUsers.map((pendingUser) => (
            <Card
              key={String(pendingUser.userId || pendingUser.email)}
              className="glass-card hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="gap-1">
                    {pendingUser.roles?.includes("COMMERCANT") ? <Store className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                    {pendingUser.roles?.includes("COMMERCANT") ? "Commerçant" : "Fournisseur"}
                  </Badge>
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
                    className="flex-1 bg-transparent"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(pendingUser)
                      setShowRejectDialog(true)
                    }}
                    disabled={rejectUserMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    className="flex-1 gradient-primary text-white"
                    onClick={() => handleApprove(String(pendingUser.userId || pendingUser.email))} 
                    disabled={approveUserMutation.isPending} >
                    {approveUserMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Approuver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">{String(selectedUser?.enterpriseName || selectedUser?.name || "")}</p>
              <p className="text-sm text-muted-foreground">{String(selectedUser?.email || "")}</p>
            </div>
            <div className="space-y-2">
              <Label>Motif du rejet</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez la raison du rejet..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejectUserMutation.isPending}>
                {rejectUserMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
