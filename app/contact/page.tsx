"use client"

import { FormEvent, useState } from "react"
import { Mail, Phone, MessageSquare, Clock3, ShieldCheck, LifeBuoy } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-10">
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative z-10">
            <Badge className="mb-3 bg-primary text-primary-foreground">Support TJ-Track</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Besoin d'aide ?</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Notre equipe traite les demandes clients, commercants et livreurs. Envoyez votre message et nous revenons vers vous rapidement.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/10">
            <CardContent className="p-4 space-y-2">
              <Mail className="h-5 w-5 text-primary" />
              <p className="font-medium">Email support</p>
              <p className="text-sm text-muted-foreground break-all">service.client@tjtracks.com</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="p-4 space-y-2">
              <Phone className="h-5 w-5 text-primary" />
              <p className="font-medium">Assistance</p>
              <p className="text-sm text-muted-foreground">Support TJ-Track</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="p-4 space-y-2">
              <Clock3 className="h-5 w-5 text-primary" />
              <p className="font-medium">Disponibilite</p>
              <p className="text-sm text-muted-foreground">Reponse sous 24-48h</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="p-4 space-y-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="font-medium">Suivi securise</p>
              <p className="text-sm text-muted-foreground">Traitement confidentiel</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <Card className="border-primary/10 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LifeBuoy className="h-5 w-5 text-primary" />
                Avant d'ecrire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Ajoutez votre numero de commande si votre demande concerne une livraison.</p>
              <p>Pour les soucis techniques, decrivez l'appareil, le navigateur et l'action effectuee.</p>
              <p>Vous pouvez laisser un numero pour etre rappele par l'equipe support.</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Nous contacter
              </CardTitle>
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
        </section>
      </main>
    </div>
  )
}
