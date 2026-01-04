"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0"

interface DocumentUploadProps {
  userId: number
  profileType: "LIVREUR" | "COMMERCANT"
  onComplete?: () => void
}

export default function DocumentUpload({ userId, profileType, onComplete }: DocumentUploadProps) {
  const { toast } = useToast()
  const [cniNumber, setCniNumber] = useState("")
  const [cniRecto, setCniRecto] = useState<File | null>(null)
  const [cniVerso, setCniVerso] = useState<File | null>(null)
  const [photoProfil, setPhotoProfil] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file: File, endpoint: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId.toString())
    formData.append("profileType", profileType)

    const token = localStorage.getItem("tj-track-token")
    const response = await fetch(`${API_BASE_URL}/profile-documents/${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    if (!response.ok) throw new Error("Erreur upload")
    return response.json()
  }

  const handleSubmit = async () => {
    if (!cniNumber || !cniRecto || !cniVerso || !photoProfil) {
      toast({
        title: "Documents incomplets",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      const token = localStorage.getItem("tj-track-token")
      await fetch(
        `${API_BASE_URL}/profile-documents/save-cni-number?userId=${userId}&profileType=${profileType}&cniNumber=${cniNumber}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      )

      await uploadFile(cniRecto, "upload-cni-recto")
      await uploadFile(cniVerso, "upload-cni-verso")
      await uploadFile(photoProfil, "upload-photo-profil")

      toast({
        title: "Documents envoyés",
        description: "Vos documents seront vérifiés sous 24-48h"
      })

      if (onComplete) onComplete()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi des documents",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents d'inscription
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Numéro CNI, photos recto/verso CNI et photo 4x4
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cniNumber">Numéro de CNI *</Label>
          <Input
            id="cniNumber"
            placeholder="Ex: 123456789"
            value={cniNumber}
            onChange={(e) => setCniNumber(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cniRecto">Photo CNI Recto *</Label>
          <Input
            id="cniRecto"
            type="file"
            accept="image/*"
            onChange={(e) => setCniRecto(e.target.files?.[0] || null)}
            disabled={uploading}
          />
          {cniRecto && <p className="text-xs text-muted-foreground">{cniRecto.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cniVerso">Photo CNI Verso *</Label>
          <Input
            id="cniVerso"
            type="file"
            accept="image/*"
            onChange={(e) => setCniVerso(e.target.files?.[0] || null)}
            disabled={uploading}
          />
          {cniVerso && <p className="text-xs text-muted-foreground">{cniVerso.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="photoProfil">Photo 4x4 *</Label>
          <Input
            id="photoProfil"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoProfil(e.target.files?.[0] || null)}
            disabled={uploading}
          />
          {photoProfil && <p className="text-xs text-muted-foreground">{photoProfil.name}</p>}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">Photos claires et lisibles • JPG/PNG max 10MB • Vérification sous 24-48h</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={uploading || !cniNumber || !cniRecto || !cniVerso || !photoProfil}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Envoyer les documents
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
