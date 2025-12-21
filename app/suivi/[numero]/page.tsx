"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Calendar,
  User,
  CreditCard,
  ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { apiClient } from "@/lib/api"
import type { Commande } from "@/types/api"

function useOrderTracking(orderNumber: string) {
  return useQuery({
    queryKey: ["orderTracking", orderNumber],
    queryFn: () => apiClient.get<Commande>(`/ecommerce/suivi/${orderNumber}`),
    enabled: !!orderNumber,
  })
}

const trackingSteps = [
  { key: "EN_ATTENTE", label: "Commande reçue", icon: Package },
  { key: "CONFIRMEE", label: "Confirmée", icon: CheckCircle },
  { key: "EN_PREPARATION", label: "En préparation", icon: Clock },
  { key: "EXPEDIEE", label: "Expédiée", icon: Truck },
  { key: "LIVREE", label: "Livrée", icon: CheckCircle },
]

const statusConfig = {
  "EN_ATTENTE": { label: "En attente", color: "bg-yellow-500" },
  "CONFIRMEE": { label: "Confirmée", color: "bg-blue-500" },
  "EN_PREPARATION": { label: "En préparation", color: "bg-orange-500" },
  "EXPEDIEE": { label: "Expédiée", color: "bg-purple-500" },
  "LIVREE": { label: "Livrée", color: "bg-green-500" },
  "ANNULEE": { label: "Annulée", color: "bg-red-500" },
}

export default function OrderTrackingPage() {
  const params = useParams()
  const orderNumber = params.numero as string
  const { data: order, isLoading, error } = useOrderTracking(orderNumber)

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"
  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const getCurrentStepIndex = (status: string) => {
    return trackingSteps.findIndex(step => step.key === status)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Commande non trouvée</h1>
          <p className="text-muted-foreground mb-4">
            Vérifiez le numéro de commande et réessayez
          </p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex(order.statut)
  const statusColor = statusConfig[order.statut]?.color || "bg-gray-500"
  const statusLabel = statusConfig[order.statut]?.label || order.statut

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Suivi de commande</h1>
              <p className="text-muted-foreground">#{order.numeroCommande}</p>
            </div>
            <Badge className={`${statusColor} text-white`}>
              {statusLabel}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>État de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingSteps.map((step, index) => {
                    const StepIcon = step.icon
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const isLast = index === trackingSteps.length - 1

                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`
                            h-10 w-10 rounded-full flex items-center justify-center
                            ${isCompleted 
                              ? isCurrent 
                                ? statusColor + " text-white" 
                                : "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                            }
                          `}>
                            <StepIcon className="h-5 w-5" />
                          </div>
                          {!isLast && (
                            <div className={`
                              w-0.5 h-12 mt-2
                              ${isCompleted ? "bg-green-500" : "bg-muted"}
                            `} />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h3 className={`font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </h3>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Dernière mise à jour: {formatDate(order.dateCommande)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {order.statut === "EXPEDIEE" && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-600">En cours de livraison</h4>
                    </div>
                    <p className="text-sm text-blue-600">
                      Votre commande est en route. Livraison prévue le {order.dateLivraisonPrevue ? formatDate(order.dateLivraisonPrevue) : "bientôt"}.
                    </p>
                  </div>
                )}

                {order.statut === "LIVREE" && order.dateLivraisonEffective && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-600">Commande livrée</h4>
                    </div>
                    <p className="text-sm text-green-600">
                      Livrée le {formatDate(order.dateLivraisonEffective)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Articles commandés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <img
                        src={item.article.photo || "/placeholder.svg"}
                        alt={item.article.designation}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.article.designation}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantité: {item.quantite} × {formatPrice(item.prixUnitaire)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.sousTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.montantTotal - (order.fraisLivraison || 0))}</span>
                  </div>
                  {order.fraisLivraison && order.fraisLivraison > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Frais de livraison</span>
                      <span>{formatPrice(order.fraisLivraison)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.montantTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date de commande</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.dateCommande)}
                    </p>
                  </div>
                </div>
                
                {order.modePaiement && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Mode de paiement</p>
                      <p className="text-sm text-muted-foreground">
                        {order.modePaiement.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                {order.statutPaiement && (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Statut du paiement</p>
                      <p className="text-sm text-muted-foreground">
                        {order.statutPaiement === "PAYE" ? "Payé" : order.statutPaiement}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {order.adresseLivraison && (
              <Card>
                <CardHeader>
                  <CardTitle>Adresse de livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">
                        {order.adresseLivraison.nom} {order.adresseLivraison.prenom}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm">
                        {order.adresseLivraison.adresse}
                        {order.adresseLivraison.complementAdresse && (
                          <><br />{order.adresseLivraison.complementAdresse}</>
                        )}
                        <br />
                        {order.adresseLivraison.ville}, {order.adresseLivraison.codePostal}
                        <br />
                        {order.adresseLivraison.pays}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{order.adresseLivraison.telephone}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Une question sur votre commande ? Notre équipe est là pour vous aider.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Nous contacter
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Signaler un problème
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}