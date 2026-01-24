"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Smartphone } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethodSelectorProps {
  orderId: string
  amount: number
  onSuccess?: (payment: any) => void
}

export function PaymentMethodSelector({ orderId, amount, onSuccess }: PaymentMethodSelectorProps) {
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState<"VISA" | "ORANGE_MONEY" | "MTN_MONEY">("VISA")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      let payment
      
      if (paymentMethod === "VISA") {
        payment = await apiClient.post("/payments/visa", {
          orderId,
          amount,
          currency: "XAF"
        })
        toast({ title: "Redirection vers Stripe..." })
      } else if (paymentMethod === "ORANGE_MONEY") {
        payment = await apiClient.post("/payments/orange-money", {
          orderId,
          amount,
          phoneNumber
        })
        toast({ title: "Paiement initié", description: "Composez #150# pour valider" })
      } else if (paymentMethod === "MTN_MONEY") {
        payment = await apiClient.post("/payments/mtn-money", {
          orderId,
          amount,
          phoneNumber
        })
        toast({ title: "Paiement initié", description: "Composez *126# pour valider" })
      }
      
      onSuccess?.(payment)
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mode de paiement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-2xl font-bold">{amount.toLocaleString()} XAF</p>
          <p className="text-sm text-muted-foreground">Montant à payer</p>
        </div>

        <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="VISA" id="visa" />
            <Label htmlFor="visa" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="font-medium">Carte Visa/Mastercard</p>
                <p className="text-xs text-muted-foreground">Paiement sécurisé par Stripe</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="ORANGE_MONEY" id="orange" />
            <Label htmlFor="orange" className="flex items-center gap-2 cursor-pointer flex-1">
              <Smartphone className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Orange Money</p>
                <p className="text-xs text-muted-foreground">Paiement mobile</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="MTN_MONEY" id="mtn" />
            <Label htmlFor="mtn" className="flex items-center gap-2 cursor-pointer flex-1">
              <Smartphone className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">MTN Mobile Money</p>
                <p className="text-xs text-muted-foreground">Paiement mobile</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {(paymentMethod === "ORANGE_MONEY" || paymentMethod === "MTN_MONEY") && (
          <div>
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="6XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        )}

        <Button onClick={handlePayment} disabled={loading} className="w-full">
          {loading ? "Traitement..." : "Payer maintenant"}
        </Button>
      </CardContent>
    </Card>
  )
}
