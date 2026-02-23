"use client"

import { useEffect, useRef } from "react"
import { Client, type IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"

type DeliverySocketMessage = {
  commandeId?: number
  latitude?: number
  longitude?: number
  timestamp?: number
  status?: string
}

interface UseDeliveryWebSocketOptions {
  commandeId?: number
  enabled?: boolean
  onMessage: (message: DeliverySocketMessage) => void
}

function getWsHttpEndpoint(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "https://api.tjtracks.com/api/v1.0"
  return `${base}/ws-delivery`
}

export function useDeliveryWebSocket({ commandeId, enabled = true, onMessage }: UseDeliveryWebSocketOptions) {
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!enabled || !commandeId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(getWsHttpEndpoint()),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    })

    client.onConnect = () => {
      client.subscribe(`/topic/delivery/${commandeId}`, (frame: IMessage) => {
        try {
          const payload = JSON.parse(frame.body)
          onMessage(payload)
        } catch {
          // Ignore malformed websocket payloads
        }
      })
    }

    client.activate()
    clientRef.current = client

    return () => {
      clientRef.current?.deactivate()
      clientRef.current = null
    }
  }, [commandeId, enabled, onMessage])
}
