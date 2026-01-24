"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // Simuler une vérification
      setTimeout(() => {
        setIsVerifying(false)
      }, 2000)
    }
  }, [sessionId])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Vérification du paiement...</p>
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
          <h1 className="text-3xl font-bold mb-4">Paiement réussi !</h1>
          <p className="text-muted-foreground mb-8">
            Votre commande a été confirmée et sera traitée dans les plus brefs délais.
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
