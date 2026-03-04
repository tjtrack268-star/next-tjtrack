import Image from "next/image"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-gradient-to-b from-primary to-primary/80 text-white dark:from-primary dark:to-primary/80">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Objet de l'aide</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/conditions-utilisation" className="hover:text-white transition-colors">Paiements</Link>
              </li>
              <li>
                <Link href="/conditions-utilisation" className="hover:text-white transition-colors">Expédition</Link>
              </li>
              <li>
                <Link href="/mes-commandes" className="hover:text-white transition-colors">Annulation et retour</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Signaler un souci</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Votre édition de lien</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Point relais</Link>
              </li>
              <li>
                <Link href="/conditions-utilisation" className="hover:text-white transition-colors">Information d'achat</Link>
              </li>
              <li>
                <Link href="/conditions-utilisation" className="hover:text-white transition-colors">Politique de livraison</Link>
              </li>
              <li>
                <Link href="/mes-commandes" className="hover:text-white transition-colors">Vérifier le statut de livraison</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Programme partenaire</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/inscription" className="hover:text-white transition-colors">Devenir vendeur</Link>
              </li>
              <li>
                <Link href="/inscription" className="hover:text-white transition-colors">Ouverture vitrine</Link>
              </li>
              <li>
                <Link href="/inscription" className="hover:text-white transition-colors">Devenir partenaire</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Faire de la publicité</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Mentions légales</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/conditions-utilisation" className="hover:text-white transition-colors">
                  Politique de retour
                </Link>
              </li>
              <li>
                <Link href="/conditions-utilisation" className="hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="hover:text-white transition-colors">
                  Sécurité
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-tjtracks.png"
              alt="TJ-Track Logo"
              width={150}
              height={150}
              className="rounded-lg object-contain"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">CB</span>
            </div>
            <img src="/mastercard-logo.png" alt="Mastercard" className="h-8" />
            <img src="/visa-logo-generic.png" alt="Visa" className="h-8" />
            <div className="h-8 w-16 bg-yellow-400 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-primary">E-CARD</span>
            </div>
            <img src="/apple-pay-logo.png" alt="Apple Pay" className="h-8" />
            <img src="/paypal-logo.png" alt="PayPal" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  )
}
