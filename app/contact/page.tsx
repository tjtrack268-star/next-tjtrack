"use client"

import { FormEvent, useState } from "react"
import { Mail, Phone, MessageSquare, Clock3, ShieldCheck, LifeBuoy, CheckCircle2, Sparkles } from "lucide-react"
import Link from "next/link"
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

const QUICK_TEMPLATES = [
  {
    label: "Livraison en retard",
    role: "CLIENT",
    subject: "Retard de livraison",
    message: "Bonjour, ma commande est en retard. Numero de commande: ",
  },
  {
    label: "Stock / mise en ligne",
    role: "COMMERCANT",
    subject: "Probleme stock produit en ligne",
    message: "Bonjour, je rencontre un souci de stock/mise en ligne sur l'article: ",
  },
  {
    label: "Probleme livreur",
    role: "LIVREUR",
    subject: "Probleme mission livraison",
    message: "Bonjour, j'ai un souci sur la mission numero: ",
  },
]

export default function ContactPage() {
  const [form, setForm] = useState<ContactPayload>(DEFAULT_FORM)
  const [priority, setPriority] = useState<"NORMALE" | "URGENTE" | "CRITIQUE">("NORMALE")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const applyTemplate = (template: (typeof QUICK_TEMPLATES)[number]) => {
    setForm((prev) => ({
      ...prev,
      role: template.role,
      subject: template.subject,
      message: template.message,
    }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const priorityPrefix = priority === "NORMALE" ? "" : `[${priority}] `
      const payload: ContactPayload = {
        ...form,
        subject: `${priorityPrefix}${form.subject}`.trim(),
      }
      const response = await apiClient.post<ApiResponse<string>>("/support/contact", payload)
      setSuccess(response.message || "Votre message a ete envoye au service client.")
      setForm(DEFAULT_FORM)
      setPriority("NORMALE")
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
        <section
          className="relative overflow-hidden rounded-3xl border border-primary/20 p-6 md:p-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(31,173,159,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.12), transparent 35%), linear-gradient(160deg, rgba(15,23,42,0.02), rgba(31,173,159,0.08))",
          }}
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl animate-pulse" />
          <div className="relative z-10">
            <Badge className="mb-3 bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Support TJ-Track
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Une equipe support qui suit vos demandes jusqu'a resolution</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-base md:text-lg">
              Notre equipe traite les demandes clients, commercants et livreurs. Envoyez votre message et nous revenons vers vous rapidement.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="secondary">Reponse humaine</Badge>
              <Badge variant="secondary">Suivi de ticket</Badge>
              <Badge variant="secondary">Priorisation des urgences</Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://wa.me/237673311016?text=Bonjour%20TJ-Track%2C%20j%27ai%20besoin%20d%27assistance."
                target="_blank"
                rel="noreferrer"
              >
                <Button className="transition-transform hover:-translate-y-0.5">Contacter via WhatsApp</Button>
              </a>
              <a href="mailto:service.client@tjtracks.com">
                <Button variant="outline" className="transition-transform hover:-translate-y-0.5">Envoyer un email</Button>
              </a>
              <Link href="#contact-form">
                <Button variant="ghost">Remplir le formulaire</Button>
              </Link>
            </div>
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
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p>Ajoutez votre numero de commande si votre demande concerne une livraison.</p>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p>Pour les soucis techniques, decrivez l'appareil, le navigateur et l'action effectuee.</p>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p>Vous pouvez laisser un numero pour etre rappele par l'equipe support.</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">
                  Plus votre message est precis, plus le delai de resolution diminue.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="contact-form" className="border-primary/10 shadow-sm scroll-mt-24">
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
                <div className="space-y-2">
                  <Label>Raccourcis de demande</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TEMPLATES.map((template) => (
                      <Button
                        key={template.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="transition-transform hover:-translate-y-0.5"
                        onClick={() => applyTemplate(template)}
                      >
                        {template.label}
                      </Button>
                    ))}
                  </div>
                </div>

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
                  <Label htmlFor="priority">Niveau de priorite</Label>
                  <select
                    id="priority"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "NORMALE" | "URGENTE" | "CRITIQUE")}
                  >
                    <option value="NORMALE">Normale</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
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
