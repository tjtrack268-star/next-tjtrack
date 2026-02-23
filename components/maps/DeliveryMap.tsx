"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import type { MapMarker } from "./DeliveryMapClient"

const DeliveryMapClient = dynamic(() => import("./DeliveryMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
      <MapPin className="h-4 w-4 mr-2" />
      Chargement de la carte...
    </div>
  ),
})

interface DeliveryMapProps {
  center: { lat: number; lon: number }
  zoom?: number
  markers: MapMarker[]
  className?: string
  drawRoute?: boolean
}

export default function DeliveryMap(props: DeliveryMapProps) {
  return <DeliveryMapClient {...props} />
}
