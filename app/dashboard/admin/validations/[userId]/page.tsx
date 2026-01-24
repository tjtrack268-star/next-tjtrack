"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, Trash2, FileText, AlertCircle, Mail, Phone, MapPin, Building, User, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePendingUsers, useApproveUser, useRejectUser, useDeleteUser, useUserDocuments } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { buildImageUrl } from "@/lib/image-utils"
import Image from "next/image"

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: pendingUsers = [] } = usePendingUsers()
  const selectedUser = pendingUsers.find(u => String(u.userId) === userId)
  const { data: documents = [] } = useUserDocuments(selectedUser?.email || "", !!selectedUser)
  const approveUserMutation = useApproveUser()
  const rejectUserMutation = useRejectUser()
  const deleteUserMutation = useDeleteUser()

  const handleApprove = async () => {
    if (!selectedUser) return
    try {
      await approveUserMutation.mutateAsync({ userId: String(selectedUser.userId), approvedBy: user?.email || "admin" })
      toast({
        title: "Utilisateur approuvé",
        description: "Le compte a été activé avec succès",
      })
      router.push("/dashboard/admin/validations")
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
        userId: String(selectedUser.userId),
        rejectedBy: user?.email || "admin",
      })
      toast({
        title: "Demande rejetée",
        description: "L'utilisateur a été notifié du rejet",
        variant: "destructive",
      })
      router.push("/dashboard/admin/validations")
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'utilisateur",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedUser?.userId) return
    try {
      await deleteUserMutation.mutateAsync(String(selectedUser.userId))
      toast({
        title: "Utilisateur supprimé",
        description: "Le compte a été définitivement supprimé",
      })
      router.push("/dashboard/admin/validations")
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      })
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Détails de l'utilisateur</h1>
          <p className="text-muted-foreground">Vérifiez les informations avant validation</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Nom complet</Label>
                <p className="font-medium">{String(selectedUser.name || "N/A")}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{String(selectedUser.email || "N/A")}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Téléphone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{String(selectedUser.phoneNumber || "N/A")}</p>
                </div>
              </div>
              {selectedUser.enterpriseName && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Entreprise</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{String(selectedUser.enterpriseName)}</p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-muted-foreground">Ville</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{String(selectedUser.town || "N/A")}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Date d'inscription</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {selectedUser.createdAt ? new Date(String(selectedUser.createdAt)).toLocaleDateString("fr-FR") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Rôles demandés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {selectedUser.roles?.map((role) => (
                  <Badge key={role} variant="outline" className="text-base px-4 py-2">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents CNI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="p-8 rounded-lg bg-muted text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun document téléchargé</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden border-2">
                      <div className="relative aspect-video bg-muted">
                        <Image
                          src={buildImageUrl(doc.objectName)}
                          alt={doc.documentType}
                          fill
                          className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setEnlargedImage(buildImageUrl(doc.objectName))}
                        />
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{doc.documentType}</span>
                          <Badge variant={doc.status === "APPROVED" ? "default" : doc.status === "REJECTED" ? "destructive" : "secondary"}>
                            {doc.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card sticky top-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gradient-primary text-white"
                size="lg"
                onClick={handleApprove}
                disabled={approveUserMutation.isPending}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approuver
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setShowRejectDialog(true)}
                disabled={rejectUserMutation.isPending}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Rejeter
              </Button>
              <div className="pt-3 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  size="lg"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteUserMutation.isPending}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Supprimer définitivement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">{String(selectedUser.enterpriseName || selectedUser.name || "")}</p>
              <p className="text-sm text-muted-foreground">{String(selectedUser.email || "")}</p>
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
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer définitivement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Action irréversible</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cette action supprimera définitivement le compte de <strong>{String(selectedUser.name || "")}</strong> et toutes ses données associées.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteUserMutation.isPending}>
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl">
          <div className="relative aspect-video bg-muted">
            {enlargedImage && (
              <Image
                src={enlargedImage}
                alt="Document agrandi"
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
