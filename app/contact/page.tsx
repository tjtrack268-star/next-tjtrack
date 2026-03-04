"use client"

import { FormEvent, useState } from "react"
import { Mail, Phone } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ApiResponse } from "@/types/api"

type ContactPayload = {
  name: string
  email: string
  role: string
  phone: string
  subject: string
  message: string
}

const DEFAULT_FORM: ContactPayload = {
  name: "",
  email: "",
  role: "CLIENT",
  phone: "",
  subject: "",
  message: "",
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactPayload>(DEFAULT_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiClient.post<ApiResponse<string>>("/support/contact", form)
      setSuccess(response.message || "Votre message a ete envoye au service client.")
      setForm(DEFAULT_FORM)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Echec d'envoi du message."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Contact us</CardTitle>
            <p className="text-sm text-muted-foreground">
              En cas de souci (client, commercant, livreur), envoyez votre message. Notre service client vous repondra.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Profil</Label>
                  <select
                    id="role"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="CLIENT">Client</option>
                    <option value="COMMERCANT">Commercant</option>
                    <option value="LIVREUR">Livreur</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+237..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Sujet *</Label>
                <Input
                  id="subject"
                  required
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ex: Probleme de livraison"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Decrivez le probleme avec les details utiles..."
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>service.client@tjtracks.com</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Support TJ-Track</span>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
