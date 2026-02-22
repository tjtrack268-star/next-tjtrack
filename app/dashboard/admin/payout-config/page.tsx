"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { usePayoutConfig, useTestCinetPayConnection, useUpdatePayoutConfig } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

export default function AdminPayoutConfigPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { data, isLoading } = usePayoutConfig()
  const updateConfig = useUpdatePayoutConfig()
  const testConnection = useTestCinetPayConnection()

  const [form, setForm] = useState({
    provider: "cinetpay",
    realEnabled: false,
    autoProcessOnDistribution: true,
    adminName: "",
    adminPhone: "",
    cinetpayTransferBaseUrl: "https://client.cinetpay.com",
    cinetpayTransferLang: "fr",
    cinetpayTransferNotifyUrl: "",
    cinetpayApiKey: "",
    cinetpayTransferPassword: "",
  })

  useEffect(() => {
    if (!data) return
    setForm((prev) => ({
      ...prev,
      provider: data.provider || "cinetpay",
      realEnabled: !!data.realEnabled,
      autoProcessOnDistribution: data.autoProcessOnDistribution !== false,
      adminName: data.adminName || "",
      adminPhone: data.adminPhone || "",
      cinetpayTransferBaseUrl: data.cinetpayTransferBaseUrl || "https://client.cinetpay.com",
      cinetpayTransferLang: data.cinetpayTransferLang || "fr",
      cinetpayTransferNotifyUrl: data.cinetpayTransferNotifyUrl || "",
    }))
  }, [data])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateConfig.mutateAsync({
        data: form,
        updatedBy: user?.email || "admin",
      })
      setForm((prev) => ({ ...prev, cinetpayApiKey: "", cinetpayTransferPassword: "" }))
      toast({ title: "Configuration mise à jour" })
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" })
    }
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuration Live Payout</h1>
          <p className="text-muted-foreground">Piloter CinetPay Transfer sans redéploiement</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres CinetPay</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom admin bénéficiaire</Label>
                    <Input value={form.adminName} onChange={(e) => setForm((p) => ({ ...p, adminName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone admin</Label>
                    <Input value={form.adminPhone} onChange={(e) => setForm((p) => ({ ...p, adminPhone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Base URL Transfer</Label>
                    <Input value={form.cinetpayTransferBaseUrl} onChange={(e) => setForm((p) => ({ ...p, cinetpayTransferBaseUrl: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Input value={form.cinetpayTransferLang} onChange={(e) => setForm((p) => ({ ...p, cinetpayTransferLang: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Notify URL Transfer</Label>
                    <Input value={form.cinetpayTransferNotifyUrl} onChange={(e) => setForm((p) => ({ ...p, cinetpayTransferNotifyUrl: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nouvelle API Key CinetPay (optionnel)</Label>
                    <Input
                      type="password"
                      placeholder={data?.hasCinetpayApiKey ? data.cinetpayApiKeyMasked : "Non configuré"}
                      value={form.cinetpayApiKey}
                      onChange={(e) => setForm((p) => ({ ...p, cinetpayApiKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nouveau mot de passe transfer (optionnel)</Label>
                    <Input
                      type="password"
                      placeholder={data?.hasCinetpayTransferPassword ? data.cinetpayTransferPasswordMasked : "Non configuré"}
                      value={form.cinetpayTransferPassword}
                      onChange={(e) => setForm((p) => ({ ...p, cinetpayTransferPassword: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-8 py-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.realEnabled}
                      onChange={(e) => setForm((p) => ({ ...p, realEnabled: e.target.checked }))}
                    />
                    Activer les virements réels
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.autoProcessOnDistribution}
                      onChange={(e) => setForm((p) => ({ ...p, autoProcessOnDistribution: e.target.checked }))}
                    />
                    Traitement auto après distribution
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={updateConfig.isPending}>
                    {updateConfig.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={testConnection.isPending}
                    onClick={async () => {
                      try {
                        const res = await testConnection.mutateAsync()
                        toast({ title: res.success ? "Connexion OK" : "Connexion KO", description: res.message, variant: res.success ? "default" : "destructive" })
                      } catch (err: any) {
                        toast({ title: "Erreur test", description: err.message, variant: "destructive" })
                      }
                    }}
                  >
                    {testConnection.isPending ? "Test..." : "Tester la connexion CinetPay"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}

