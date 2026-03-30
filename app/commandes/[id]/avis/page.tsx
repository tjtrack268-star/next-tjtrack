"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Star, ArrowLeft } from "lucide-react"

import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function LeaveReviewPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const orderId = useMemo(() => Number(params?.id), [params?.id])
  const [note, setNote] = useState<number>(0)
  const [commentaire, setCommentaire] = useState("")
  const [recommande, setRecommande] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const invalidOrderId = !Number.isFinite(orderId) || orderId <= 0

  const submitReview = async () => {
    if (invalidOrderId) {
      toast({
        title: "Commande invalide",
        description: "Impossible de retrouver la commande.",
        variant: "destructive",
      })
      return
    }

    if (note < 1 || note > 5) {
      toast({
        title: "Note requise",
        description: "Veuillez choisir une note entre 1 et 5.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.post(`/commandes/${orderId}/avis`, {
        note,
        commentaire: commentaire.trim(),
        recommande,
      })

      toast({
        title: "Merci pour votre avis",
        description: "Votre évaluation a été enregistrée.",
      })
      router.push("/dashboard/mes-commandes")
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer l'avis.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/dashboard/mes-commandes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux commandes
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Laisser un avis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Commande #{invalidOrderId ? "-" : orderId}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium">Votre note</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="rounded p-1"
                    onClick={() => setNote(value)}
                    aria-label={`Donner ${value} étoile${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-7 w-7 ${value <= note ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Commentaire</p>
              <Textarea
                placeholder="Partagez votre expérience..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="recommande"
                type="checkbox"
                checked={recommande}
                onChange={(e) => setRecommande(e.target.checked)}
              />
              <label htmlFor="recommande" className="text-sm">
                Je recommande ce produit
              </label>
            </div>

            <div className="flex justify-end">
              <Button onClick={submitReview} disabled={isSubmitting || invalidOrderId}>
                {isSubmitting ? "Envoi en cours..." : "Publier mon avis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
