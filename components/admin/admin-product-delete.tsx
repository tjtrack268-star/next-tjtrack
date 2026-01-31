"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { useQueryClient } from "@tanstack/react-query"

interface AdminProductDeleteProps {
  productId: number
  productName: string
}

export function AdminProductDelete({ productId, productName }: AdminProductDeleteProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (!reason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif de suppression",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await apiClient.delete(`/admin/produits/${productId}`, { reason })
      toast({
        title: "Produit supprimé",
        description: "Le commerçant a été notifié par email"
      })
      queryClient.invalidateQueries({ queryKey: ["ecommerceProducts"] })
      setOpen(false)
      setReason("")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-600 text-white z-20"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de supprimer "{productName}". Le commerçant recevra un email avec le motif.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Motif de suppression *</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Produit non conforme, contenu inapproprié, violation des conditions..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
