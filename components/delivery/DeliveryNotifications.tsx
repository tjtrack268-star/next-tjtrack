"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, AlertTriangle, Info, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Notification {
  id: number
  type: string
  title: string
  message: string
  orderId?: number
  orderNumber?: string
  timestamp: string
  read: boolean
  priority: "LOW" | "MEDIUM" | "HIGH"
}

const notificationConfig: Record<string, { icon: any, color: string, textColor: string }> = {
  ORDER: { icon: Truck, color: "bg-blue-500", textColor: "text-blue-600" },
  ORDER_ASSIGNED: { icon: Truck, color: "bg-blue-500", textColor: "text-blue-600" },
  ORDER_ACCEPTED: { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-600" },
  ORDER_REFUSED: { icon: AlertTriangle, color: "bg-red-500", textColor: "text-red-600" },
  DELIVERY_STARTED: { icon: Truck, color: "bg-orange-500", textColor: "text-orange-600" },
  DELIVERY_COMPLETED: { icon: CheckCircle, color: "bg-emerald-500", textColor: "text-emerald-600" },
  CHAT: { icon: Info, color: "bg-purple-500", textColor: "text-purple-600" },
  MESSAGE: { icon: Info, color: "bg-purple-500", textColor: "text-purple-600" },
  SYSTEM: { icon: Info, color: "bg-gray-500", textColor: "text-gray-600" },
}

export default function DeliveryNotifications() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications()
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user?.userId])

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get(`/notifications/livreur/${user?.userId}`) as any
      const notifs = Array.isArray(response) ? response : (response.data || [])
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.put(`/notifications/livreur/${user?.userId}/read-all`)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    console.log('=== NOTIFICATION CLICK ====')
    console.log('Notification:', notification)
    console.log('User role:', user?.role)
    console.log('Notification type:', notification.type)
    console.log('Order ID:', notification.orderId)
    
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    setIsOpen(false)
    
    // Navigate based on notification type and user role
    const notifType = notification.type.toUpperCase()
    console.log('Notification type uppercase:', notifType)
    
    if (notifType === 'ORDER' || notifType.startsWith('ORDER_')) {
      // Order notifications
      if (notification.orderId) {
        console.log('Navigating for ORDER notification...')
        if (user?.role === 'COMMERCANT') {
          const url = `/merchant/orders/${notification.orderId}`
          console.log('Navigating to:', url)
          router.push(url)
        } else if (user?.role === 'LIVREUR') {
          console.log('Navigating to: /delivery/orders')
          router.push('/delivery/orders')
        } else if (user?.role === 'CLIENT') {
          console.log('Navigating to: /orders')
          router.push('/orders')
        }
      } else {
        console.log('No orderId found')
      }
    } else if (notifType === 'CHAT' || notifType === 'MESSAGE') {
      // Chat/Message notifications
      console.log('Navigating to: /messages')
      router.push('/messages')
    } else if (notifType === 'DELIVERY') {
      // Delivery notifications
      if (user?.role === 'LIVREUR') {
        console.log('Navigating to: /delivery/orders')
        router.push('/delivery/orders')
      } else {
        console.log('Navigating to: /orders')
        router.push('/orders')
      }
    } else {
      console.log('Unknown notification type, no navigation')
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`
    return date.toLocaleDateString("fr-FR")
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Tout marquer lu
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const config = notificationConfig[notification.type] || notificationConfig['SYSTEM']
                const Icon = config.icon

                return (
                  <Card 
                    key={notification.id} 
                    className={`m-2 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${config.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              {notification.orderNumber && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Commande #{notification.orderNumber}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                className="text-xs h-6 px-2"
                              >
                                Marquer lu
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}