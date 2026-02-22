import { Header } from "@/components/layout/header"

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Conditions d&apos;utilisation</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour: 22 février 2026
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Objet</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Les présentes conditions encadrent l&apos;accès et l&apos;utilisation de la plateforme TJ-Track
            (site web et applications mobiles).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Comptes utilisateurs</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Vous êtes responsable des informations de votre compte et de la confidentialité de vos identifiants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Commandes et paiements</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Les commandes, paiements, livraisons et éventuels remboursements sont traités selon les règles
            opérationnelles en vigueur sur la plateforme.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Comportements interdits</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Toute utilisation frauduleuse, abusive ou contraire aux lois applicables peut entraîner la suspension
            ou la suppression du compte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Contact</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Pour toute question juridique ou contractuelle, contactez le support TJ-Track.
          </p>
        </section>
      </main>
    </div>
  )
}

