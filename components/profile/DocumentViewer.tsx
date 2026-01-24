"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { buildImageUrl } from "@/lib/image-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://147.93.9.170:8080/api/v1.0"

interface DocumentStatus {
  cniNumber?: string
  hasCniRecto: boolean
  hasCniVerso: boolean
  hasPhotoProfil: boolean
  documentsValides?: boolean
  cniPhotoRecto?: string
  cniPhotoVerso?: string
  photoProfil?: string
  success: boolean
}

interface DocumentViewerProps {
  userId: number
  profileType: "LIVREUR" | "COMMERCANT"
}

export default function DocumentViewer({ userId, profileType }: DocumentViewerProps) {
  const [status, setStatus] = useState<DocumentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchDocumentStatus()
  }, [userId, profileType])

  const fetchDocumentStatus = async () => {
    try {
      const token = localStorage.getItem("tj-track-token")
      const response = await fetch(
        `${API_BASE_URL}/profile-documents/status/${userId}/${profileType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Aucun document trouvé</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = () => {
    if (status.documentsValides === true) {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Validés</Badge>
    }
    if (status.documentsValides === false) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejetés</Badge>
    }
    if (status.hasCniRecto && status.hasCniVerso && status.hasPhotoProfil) {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
    }
    return <Badge variant="outline">Incomplets</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents d'identité
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.cniNumber && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Numéro CNI</p>
              <p className="text-lg font-mono">{status.cniNumber}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CNI Recto */}
            <div className="space-y-2">
              <p className="text-sm font-medium">CNI Recto</p>
              {status.hasCniRecto && status.cniPhotoRecto ? (
                <div 
                  className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(buildImageUrl(status.cniPhotoRecto!))}
                >
                  <Image
                    src={buildImageUrl(status.cniPhotoRecto) || "/placeholder.svg"}
                    alt="CNI Recto"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Non fourni</p>
                </div>
              )}
            </div>

            {/* CNI Verso */}
            <div className="space-y-2">
              <p className="text-sm font-medium">CNI Verso</p>
              {status.hasCniVerso && status.cniPhotoVerso ? (
                <div 
                  className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(buildImageUrl(status.cniPhotoVerso!))}
                >
                  <Image
                    src={buildImageUrl(status.cniPhotoVerso) || "/placeholder.svg"}
                    alt="CNI Verso"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Non fourni</p>
                </div>
              )}
            </div>

            {/* Photo Profil */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Photo 4x4</p>
              {status.hasPhotoProfil && status.photoProfil ? (
                <div 
                  className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(buildImageUrl(status.photoProfil!))}
                >
                  <Image
                    src={buildImageUrl(status.photoProfil) || "/placeholder.svg"}
                    alt="Photo Profil"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Non fourni</p>
                </div>
              )}
            </div>
          </div>

          {status.documentsValides === false && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                Vos documents ont été rejetés. Veuillez les soumettre à nouveau.
              </p>
            </div>
          )}

          {!status.hasCniRecto || !status.hasCniVerso || !status.hasPhotoProfil ? (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                Documents incomplets. Veuillez uploader tous les documents requis.
              </p>
            </div>
          ) : status.documentsValides === null || status.documentsValides === undefined ? (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Vos documents sont en cours de vérification. Vous serez notifié sous 24-48h.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Modal pour agrandir l'image */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu du document</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full h-[600px]">
              <Image
                src={selectedImage}
                alt="Document"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
