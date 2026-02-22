"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { apiClient } from "@/lib/api"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const transactionId = searchParams.get("transaction_id")
  const orderId = searchParams.get("order_id")
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("Vérification du paiement...")

  useEffect(() => {
    const verify = async () => {
      try {
        if (sessionId) {
          const payment = await apiClient.post<{ paymentStatus: string }>("/payments/visa/confirm", {
            sessionId
          })
          if (payment.paymentStatus === "COMPLETED") {
            setIsSuccess(true)
            setMessage("Paiement confirmé avec succès")
          } else {
            setMessage("Paiement en attente de confirmation")
          }
          return
        }

        if (transactionId) {
          const payment = await apiClient.get<{ paymentStatus: string }>(`/payments/${transactionId}`)
          if (payment.paymentStatus === "COMPLETED") {
            setIsSuccess(true)
            setMessage("Paiement mobile confirmé")
          } else {
            setMessage("Paiement mobile en cours de confirmation")
          }
          return
        }

        if (orderId) {
          const status = await apiClient.get<{ paymentStatus: string }>(`/payments/order/${orderId}/status`)
          if (status.paymentStatus === "COMPLETED") {
            setIsSuccess(true)
            setMessage("Paiement confirmé")
          } else {
            setMessage("Paiement en attente")
          }
          return
        }

        setMessage("Aucune référence de paiement trouvée")
      } catch (err: any) {
        setMessage(err?.message || "Impossible de vérifier le paiement")
      } finally {
        setIsVerifying(false)
      }
    }

    verify()
  }, [sessionId, transactionId, orderId])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-card rounded-2xl border p-8 text-center shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-green-500/10">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">{isSuccess ? "Paiement réussi !" : "Paiement en cours"}</h1>
          <p className="text-muted-foreground mb-8">
            {isSuccess
              ? "Votre commande a été confirmée et sera traitée dans les plus brefs délais."
              : message}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Voir mes commandes
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
