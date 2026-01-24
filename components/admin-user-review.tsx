"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Mail, FileText, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react"
import { buildImageUrl } from "@/lib/image-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://147.93.9.170:8080/api/v1.0"

interface AdminUserReviewProps {
  user: any
  onApprove: () => void
  onReject: () => void
}

export default function AdminUserReview({ user, onApprove, onReject }: AdminUserReviewProps) {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(false)

  const profileType = user.roles?.includes("LIVREUR") ? "LIVREUR" : user.roles?.includes("COMMERCANT") ? "COMMERCANT" : null

  useEffect(() => {
    if (profileType) {
      const token = localStorage.getItem("tj-track-token")
      fetch(`${API_BASE_URL}/profile-documents/status/${user.userId}/${profileType}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(setDocuments)
        .catch(console.error)
    }
  }, [user.userId, profileType])

  const handleApprove = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("tj-track-token")
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.userId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true })
      })
      if (res.ok) {
        toast({ title: "Approuvé" })
        onApprove()
      }
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Motif requis", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem("tj-track-token")
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.userId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason })
      })
      if (res.ok) {
        toast({ title: "Rejeté" })
        onReject()
      }
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action est irréversible.`)) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem("tj-track-token")
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Utilisateur supprimé" })
        onReject()
      }
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Nom</Label><p className="font-medium">{user.name}</p></div>
              <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{user.email}</p></div>
              <div><Label className="text-muted-foreground">Rôles</Label><div className="flex gap-2 mt-1">{user.roles?.map((r: string) => <Badge key={r}>{r}</Badge>)}</div></div>
              <div><Label className="text-muted-foreground">Statut</Label><Badge className={user.isAccountVerified ? "bg-green-500" : ""}>{user.isAccountVerified ? "Vérifié" : "Non vérifié"}</Badge></div>
            </div>
            {user.phoneNumber && <div><Label className="text-muted-foreground">Téléphone</Label><p className="font-medium">{user.phoneNumber}</p></div>}
            {user.enterpriseName && <div><Label className="text-muted-foreground">Entreprise</Label><p className="font-medium">{user.enterpriseName}</p></div>}
            {user.address && <div><Label className="text-muted-foreground">Adresse</Label><p className="font-medium">{user.address}, {user.town}</p></div>}
          </CardContent>
        </Card>

        {profileType && documents && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Documents</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {documents.cniNumber && <div className="p-3 bg-muted rounded-lg"><Label>CNI: {documents.cniNumber}</Label></div>}
              <div className="grid md:grid-cols-3 gap-4">
                {documents.hasCniRecto && documents.cniPhotoRecto && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(buildImageUrl(documents.cniPhotoRecto))}>
                    <Image src={buildImageUrl(documents.cniPhotoRecto) || "/placeholder.svg"} alt="CNI Recto" fill className="object-cover" />
                  </div>
                )}
                {documents.hasCniVerso && documents.cniPhotoVerso && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(buildImageUrl(documents.cniPhotoVerso))}>
                    <Image src={buildImageUrl(documents.cniPhotoVerso) || "/placeholder.svg"} alt="CNI Verso" fill className="object-cover" />
                  </div>
                )}
                {documents.hasPhotoProfil && documents.photoProfil && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(buildImageUrl(documents.photoProfil))}>
                    <Image src={buildImageUrl(documents.photoProfil) || "/placeholder.svg"} alt="Photo" fill className="object-cover" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Motif du rejet</Label><Textarea placeholder="Expliquez..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} /></div>
            <div className="flex gap-3">
              <Button onClick={handleApprove} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-2" />Approuver</Button>
              <Button onClick={handleReject} disabled={loading} variant="destructive" className="flex-1"><XCircle className="h-4 w-4 mr-2" />Rejeter</Button>
            </div>
            <div className="pt-4 border-t">
              <Button onClick={handleDelete} disabled={loading} variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-2" />Supprimer définitivement</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Document</DialogTitle></DialogHeader>
          {selectedImage && <div className="relative w-full h-[600px]"><Image src={selectedImage} alt="Document" fill className="object-contain" /></div>}
        </DialogContent>
      </Dialog>
    </>
  )
}
