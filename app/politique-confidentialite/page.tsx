import { Header } from "@/components/layout/header"

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour: 22 février 2026
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Données collectées</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Nous collectons les informations nécessaires au fonctionnement de la plateforme:
            identité, contact, commandes, paiements et suivi de livraison.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Finalités</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Les données sont utilisées pour gérer votre compte, traiter les commandes, améliorer le service
            et assurer la sécurité de la plateforme.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Partage des données</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Les informations strictement nécessaires peuvent être partagées avec les parties prenantes
            (marchands, livreurs, prestataires de paiement) dans le cadre du service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Conservation et sécurité</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Nous appliquons des mesures de sécurité techniques et organisationnelles adaptées et conservons
            les données selon les obligations légales et opérationnelles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Vos droits</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données selon la réglementation applicable.
          </p>
        </section>
      </main>
    </div>
  )
}

