"use client"

import { useState, useEffect } from "react"
import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useAuth } from "@/contexts/auth-context"
import { safeUserName } from "@/lib/safe-render"
import { apiClient } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

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
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.put("/notifications/read-all", {})
      loadNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
                    Tout marquer lu
                  </Button>
                )}
              </div>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden md:inline">{safeUserName(user)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
