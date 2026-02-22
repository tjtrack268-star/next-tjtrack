"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Menu, X, Search, Bell, Package, LayoutDashboard, Heart, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useSearch } from "@/contexts/search-context"
import { cn } from "@/lib/utils"
import { safeUserName } from "@/lib/safe-render"
import { apiClient } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const navigation = [
  { name: "Catalogue", href: "/catalogue" },
  { name: "Catégories", href: "/categories" },
  { name: "Promotions", href: "/promotions" },
  { name: "Nouveautés", href: "/nouveautes" },
]

interface Notification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export function Header() {
  const { totalItems, openCart } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const { searchQuery, setSearchQuery } = useSearch()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadNotifications = async () => {
    try {
      const data = await apiClient.get<{ notifications: Notification[]; unreadCount: number }>("/notifications")
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      // Silently fail - notifications endpoint may not exist yet
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`, {})
      loadNotifications()
    } catch (err) {
      // Silently fail
    }
  }

  return (
    <header className="sticky top-0 z-[100] w-full glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo-tjtracks.png"
              alt="TJ-Track Logo"
              width={48}
              height={48}
              className="rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gradient">Track</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                className="w-full h-10 pl-10 pr-4 bg-secondary/50 border-0 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Favorites */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                          onClick={() => !notif.isRead && markAsRead(notif.id)}
                        >
                          <div className="flex items-start justify-between w-full">
                            <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-normal'}`}>
                              {notif.title}
                            </p>
                            {!notif.isRead && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                            )}
                          </div>
                          {notif.message && (
                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                          </p>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden md:inline">{safeUserName(user)}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/commandes">
                      <Package className="mr-2 h-4 w-4" />
                      Mes Commandes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/connexion">
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Connexion</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 glass-sidebar p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo_tjtrack.png"
                        alt="TJ-Track Logo"
                        width={48}
                        height={48}
                        className="rounded-lg object-contain"
                      />
                      <span className="text-xl font-bold text-sidebar-foreground">TJ-Track</span>
                    </div>
                  </div>
                  <nav className="flex-1 p-4">
                    <div className="space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-sidebar-border">
                      {isAuthenticated ? (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-primary hover:bg-sidebar-accent transition-colors"
                          >
                            <LayoutDashboard className="h-5 w-5" />
                            Espace Gestion
                          </Link>
                          <button
                            onClick={logout}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-destructive hover:bg-sidebar-accent transition-colors w-full text-left"
                          >
                            <LogOut className="h-5 w-5" />
                            Déconnexion
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/connexion"
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-primary hover:bg-sidebar-accent transition-colors"
                        >
                          <User className="h-5 w-5" />
                          Connexion
                        </Link>
                      )}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row */}
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo_tjtrack.png"
                alt="TJ-Track Logo"
                width={40}
                height={40}
                className="rounded-lg object-contain"
              />
              <span className="text-lg font-bold text-gradient">Track</span>
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 glass-sidebar p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-sidebar-border">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/logo_tjtrack.png"
                          alt="TJ-Track Logo"
                          width={48}
                          height={48}
                          className="rounded-lg object-contain"
                        />
                        <span className="text-xl font-bold text-sidebar-foreground">TJ-Track</span>
                      </div>
                    </div>
                    <nav className="flex-1 p-4">
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-sidebar-border">
                        {isAuthenticated ? (
                          <>
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-primary hover:bg-sidebar-accent transition-colors"
                            >
                              <LayoutDashboard className="h-5 w-5" />
                              Espace Gestion
                            </Link>
                            <button
                              onClick={logout}
                              className="flex items-center gap-3 rounded-lg px-4 py-3 text-destructive hover:bg-sidebar-accent transition-colors w-full text-left"
                            >
                              <LogOut className="h-5 w-5" />
                              Déconnexion
                            </button>
                          </>
                        ) : (
                          <Link
                            href="/connexion"
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-primary hover:bg-sidebar-accent transition-colors"
                          >
                            <User className="h-5 w-5" />
                            Connexion
                          </Link>
                        )}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="pb-3">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                className="w-full h-10 pl-10 pr-4 bg-secondary/50 border-0 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
