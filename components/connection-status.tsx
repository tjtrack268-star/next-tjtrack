"use client"

import { useEffect, useState } from "react"
import { testBackendConnection } from "@/lib/connection-test"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"

interface ConnectionStatus {
  isConnected: boolean
  status?: number
  error?: string
  lastChecked: Date
}

export function ConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const result = await testBackendConnection()
      setConnectionStatus({
        isConnected: result.success,
        status: result.status,
        error: result.error,
        lastChecked: new Date(),
      })
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        lastChecked: new Date(),
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={connectionStatus.isConnected ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {connectionStatus.isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {connectionStatus.isConnected ? "Connecté" : "Déconnecté"}
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={checkConnection}
        disabled={isChecking}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
      </Button>
      
      {connectionStatus.error && (
        <span className="text-xs text-muted-foreground">
          {connectionStatus.error}
        </span>
      )}
    </div>
  )
}