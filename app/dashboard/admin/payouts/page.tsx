"use client"

import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePayoutOverview, usePayoutTransactions, useProcessPendingPayouts, useRetryPayout } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { Banknote, CheckCircle2, Clock, RefreshCcw, XCircle } from "lucide-react"

export default function AdminPayoutsPage() {
  const { toast } = useToast()
  const { data: overview, isLoading } = usePayoutOverview()
  const { data: transactions } = usePayoutTransactions()
  const processPending = useProcessPendingPayouts()
  const retryPayout = useRetryPayout()

  const formatMoney = (value: number | undefined) =>
    `${Number(value || 0).toLocaleString("fr-FR")} FCFA`

  const statusBadge = (status: string) => {
    if (status === "SUCCESS") return <Badge className="bg-green-600 text-white">Succès</Badge>
    if (status === "FAILED") return <Badge variant="destructive">Échec</Badge>
    if (status === "PROCESSING") return <Badge className="bg-blue-600 text-white">En cours</Badge>
    return <Badge variant="secondary">En attente</Badge>
  }

  const providerLabel = (provider: string) => {
    if (provider === "ORANGE_MONEY") return "Orange Money"
    if (provider === "MTN_MONEY") return "MTN Money"
    if (provider === "WALLET") return "Wallet"
    return provider
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payouts & Répartition</h1>
            <p className="text-muted-foreground">Virements automatiques Marchand / Livreur / Admin</p>
          </div>
          <Button
            onClick={async () => {
              try {
                const res = await processPending.mutateAsync(100)
                toast({ title: "Traitement terminé", description: `${res.processed} payout(s) traités` })
              } catch (e: any) {
                toast({ title: "Erreur", description: e.message, variant: "destructive" })
              }
            }}
            disabled={processPending.isPending}
          >
            <Banknote className="h-4 w-4 mr-2" />
            {processPending.isPending ? "Traitement..." : "Lancer les virements"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{overview?.pendingCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Réussis</p>
                  <p className="text-2xl font-bold">{overview?.successCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Échecs</p>
                  <p className="text-2xl font-bold">{overview?.failedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Montants</p>
                <p className="text-sm">En attente: <strong>{formatMoney(overview?.pendingAmount)}</strong></p>
                <p className="text-sm">Payé: <strong>{formatMoney(overview?.successAmount)}</strong></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transactions de payout</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : !(transactions && transactions.length) ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Aucune transaction</TableCell></TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.orderId}</TableCell>
                      <TableCell>{tx.beneficiaryName || tx.beneficiaryKey}</TableCell>
                      <TableCell>{tx.beneficiaryType}</TableCell>
                      <TableCell>{providerLabel(tx.provider)}</TableCell>
                      <TableCell>{formatMoney(tx.amount)}</TableCell>
                      <TableCell>{statusBadge(tx.status)}</TableCell>
                      <TableCell>{tx.createdAt ? new Date(tx.createdAt).toLocaleString("fr-FR") : "-"}</TableCell>
                      <TableCell className="text-right">
                        {tx.status === "FAILED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await retryPayout.mutateAsync(tx.id)
                                toast({ title: "Retry lancé", description: `Payout #${tx.id} relancé` })
                              } catch (e: any) {
                                toast({ title: "Erreur", description: e.message, variant: "destructive" })
                              }
                            }}
                            disabled={retryPayout.isPending}
                          >
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}

