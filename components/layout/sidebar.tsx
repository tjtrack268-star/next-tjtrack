"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  BarChart3,
  AlertTriangle,
  Settings,
  Users,
  FileText,
  TrendingUp,
  Box,
  Megaphone,
  Store,
  ShieldCheck,
  LogOut,
  Home,
  MessageSquare,
  Percent,
  Search,
  Ticket,
  Globe,
  Menu,
  X,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { safeUserName, safeUserRole } from "@/lib/safe-render"
import { useSidebarBadges } from "@/hooks/use-sidebar-badges"

type AppRole = "ADMIN" | "COMMERCANT" | "LIVREUR" | "FOURNISSEUR" | "CLIENT"

function normalizeRole(role?: string): AppRole {
  const normalized = String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")

  if (normalized === "ADMIN" || normalized === "MANAGER") return "ADMIN"
  if (normalized === "COMMERCANT" || normalized === "MERCHANT") return "COMMERCANT"
  if (normalized === "LIVREUR" || normalized === "DELIVERY") return "LIVREUR"
  if (normalized === "FOURNISSEUR" || normalized === "SUPPLIER") return "FOURNISSEUR"
  return "CLIENT"
}

function resolvePrimaryRole(roles?: string[]): AppRole {
  const normalized = (roles || []).map(normalizeRole)
  if (normalized.includes("ADMIN")) return "ADMIN"
  if (normalized.includes("COMMERCANT")) return "COMMERCANT"
  if (normalized.includes("LIVREUR")) return "LIVREUR"
  if (normalized.includes("FOURNISSEUR")) return "FOURNISSEUR"
  return "CLIENT"
}

const getMenuItems = (role?: string, badges?: any) => {
  const baseItems = [
    {
      title: "Accueil",
      href: "/",
      icon: Home,
    },
    {
      title: "Catalogue",
      href: "/catalogue",
      icon: Package,
    },
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ]

  const normalizedRole = normalizeRole(role)

  if (normalizedRole === "ADMIN") {
    return [
      ...baseItems,
      {
        title: "Administration",
        items: [
          { name: "Utilisateurs", href: "/dashboard/admin/utilisateurs", icon: Users },
          { name: "Validations", href: "/dashboard/admin/validations", icon: ShieldCheck, badge: badges?.validations || 0 },
          { name: "Validation campagnes", href: "/dashboard/admin/validation-campagnes", icon: Megaphone },
          { name: "Communication", href: "/dashboard/admin/communication", icon: MessageSquare, badge: badges?.communication || 0 },
        ],
      },
      {
        title: "E-commerce",
        items: [
          { name: "Produits", href: "/dashboard/admin/produits", icon: Package },
          { name: "Commandes", href: "/dashboard/admin/commandes", icon: ShoppingBag },
          { name: "Payouts", href: "/dashboard/admin/payouts", icon: Banknote },
          { name: "Promotions", href: "/dashboard/admin/promotions", icon: Percent },
          { name: "Tarifs Livraison", href: "/dashboard/admin/tarifs-livraison", icon: Truck },
        ],
      },
      {
        title: "Livraison",
        items: [
          { name: "Calculateur", href: "/dashboard/calculateur-livraison", icon: BarChart3 },
        ],
      },
      {
        title: "Analytics & Rapports",
        items: [
          { name: "Dashboard Complet", href: "/dashboard/admin/dashboard", icon: BarChart3 },
          { name: "Vue Globale", href: "/dashboard/admin/global", icon: Globe },
          { name: "Analytics", href: "/dashboard/admin/analytics", icon: TrendingUp },
          { name: "Statistiques", href: "/dashboard/statistiques", icon: FileText },
          { name: "Rapports", href: "/dashboard/rapports", icon: FileText },
        ],
      },
      {
        title: "Support & Contenu",
        items: [
          { name: "Tickets Support", href: "/dashboard/admin/support", icon: Ticket, badge: badges?.support || 0 },
          { name: "Gestion Contenu", href: "/dashboard/admin/contenu", icon: FileText },
          { name: "SEO Manager", href: "/dashboard/admin/seo", icon: Search },
        ],
      },
      {
        title: "Stock Global",
        items: [
          { name: "Inventaire", href: "/dashboard/inventaire", icon: Box },
          { name: "Articles", href: "/dashboard/articles", icon: Package },
          { name: "Alertes", href: "/dashboard/alertes", icon: AlertTriangle, badge: badges?.alertes || 0 },
        ],
      },
      {
        title: "Configuration",
        items: [
          { name: "Paramètres", href: "/dashboard/parametres", icon: Settings },
          { name: "Config Payout", href: "/dashboard/admin/payout-config", icon: Banknote },
        ],
      },
    ]
  }

  if (normalizedRole === "COMMERCANT") {
    return [
      ...baseItems,
      {
        title: "Ma Boutique",
        items: [
          { name: "Mes Produits", href: "/dashboard/merchant/produits", icon: Package },
          { name: "Mon Stock", href: "/dashboard/merchant/stock", icon: Box },
          { name: "Publicité", href: "/dashboard/merchant/publicite", icon: Megaphone },
        ],
      },
      {
        title: "Ventes",
        items: [
          { name: "Commandes Clients", href: "/dashboard/commandes", icon: ShoppingBag },
          { name: "Livraisons", href: "/dashboard/merchant/livraisons", icon: Truck },
          { name: "Statistiques", href: "/dashboard/statistiques", icon: BarChart3 },
          { name: "Mes Commandes", href: "/dashboard/mes-commandes", icon: Package },
        ],
      },
      {
        title: "Approvisionnement",
        items: [
          { name: "Commandes Fournisseurs", href: "/dashboard/commandes-fournisseur", icon: Truck },
          { name: "Fournisseurs", href: "/dashboard/fournisseurs", icon: Users },
        ],
      },
      {
        title: "Communication",
        href: "/dashboard/communication",
        icon: MessageSquare,
      },
      {
        title: "Configuration",
        href: "/dashboard/parametres",
        icon: Settings,
      },
    ]
  }

  if (normalizedRole === "LIVREUR") {
    return [
      ...baseItems,
      {
        title: "Mes Livraisons",
        items: [
          { name: "Dashboard Livreur", href: "/dashboard/livreur", icon: Truck },
          { name: "Nouvelles Assignations", href: "/dashboard/livreur?tab=nouvelles", icon: Package, badge: badges?.nouvelles || 0 },
          { name: "En Cours", href: "/dashboard/livreur?tab=en-cours", icon: Truck },
          { name: "Historique", href: "/dashboard/livreur?tab=terminees", icon: FileText },
          { name: "Mes Commandes", href: "/dashboard/mes-commandes", icon: ShoppingBag },
        ],
      },
      {
        title: "Communication",
        href: "/dashboard/communication",
        icon: MessageSquare,
      },
      {
        title: "Configuration",
        href: "/dashboard/parametres",
        icon: Settings,
      },
    ]
  }

  if (normalizedRole === "FOURNISSEUR") {
    return [
      ...baseItems,
      {
        title: "Mon Catalogue",
        items: [
          { name: "Mes Articles", href: "/dashboard/supplier/articles", icon: Package },
          { name: "Mon Stock", href: "/dashboard/supplier/stock", icon: Box },
        ],
      },
      {
        title: "Commandes",
        items: [
          { name: "Commandes Reçues", href: "/dashboard/supplier/commandes", icon: ShoppingBag },
          { name: "Historique", href: "/dashboard/supplier/historique", icon: TrendingUp },
          { name: "Mes Commandes", href: "/dashboard/mes-commandes", icon: Package },
        ],
      },
      {
        title: "Communication",
        href: "/dashboard/communication",
        icon: MessageSquare,
      },
      {
        title: "Configuration",
        href: "/dashboard/parametres",
        icon: Settings,
      },
    ]
  }

  // Default CLIENT menu
  return [
    ...baseItems,
    {
      title: "Mes Achats",
      items: [
        { name: "Mes Commandes", href: "/dashboard/mes-commandes", icon: ShoppingBag },
        { name: "Mes Favoris", href: "/favoris", icon: Store },
      ],
    },
    {
      title: "Communication",
      href: "/dashboard/communication",
      icon: MessageSquare,
    },
    {
      title: "Configuration",
      href: "/dashboard/parametres",
      icon: Settings,
    },
  ]
}

// Sidebar content component for reuse
function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const badges = useSidebarBadges()
  const primaryRole = resolvePrimaryRole(user?.roles)
  const menuItems = getMenuItems(primaryRole, badges)

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <Package className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-sidebar-foreground">TJ-Track</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-4">
            {"items" in section ? (
              <>
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items?.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onItemClick}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </>
            ) : (
              <Link
                href={section.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  pathname === section.href
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <section.icon className="h-4 w-4" />
                <span>{section.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs text-muted-foreground">Thème</span>
          <ThemeToggle />
        </div>
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <Users className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{safeUserName(user)}</p>
                <p className="text-xs text-muted-foreground truncate">{safeUserRole(user)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={() => {
                logout()
                onItemClick?.()
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        ) : (
          <Link href="/connexion" onClick={onItemClick}>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Se connecter
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

// Mobile sidebar toggle button
export function MobileSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-[70] bg-background/90 backdrop-blur-sm border shadow-sm pointer-events-auto"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] glass-sidebar p-0">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <SidebarContent onItemClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

// Desktop sidebar
export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-sidebar border-r border-sidebar-border hidden lg:block">
      <SidebarContent />
    </aside>
  )
}
