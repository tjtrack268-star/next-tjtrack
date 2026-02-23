"use client"

import { useMemo } from "react"
import { divIcon } from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"

export type MapMarker = {
  id: string
  label: string
  lat: number
  lon: number
  markerType?: "merchant" | "client" | "delivery" | "live"
}

interface DeliveryMapClientProps {
  center: { lat: number; lon: number }
  zoom?: number
  markers: MapMarker[]
  className?: string
  drawRoute?: boolean
}

export default function DeliveryMapClient({
  center,
  zoom = 12,
  markers,
  className = "h-72 w-full rounded-lg overflow-hidden border",
  drawRoute = false,
}: DeliveryMapClientProps) {
  const route = drawRoute ? markers.map((m) => [m.lat, m.lon] as [number, number]) : []
  const markerIcons = useMemo(() => {
    return markers.reduce<Record<string, ReturnType<typeof divIcon>>>((acc, marker) => {
      const type = marker.markerType || "delivery"
      acc[marker.id] = divIcon({
        className: "tj-map-marker-wrapper",
        html: `<span class="tj-map-marker tj-map-marker-${type} ${type === "live" ? "tj-map-marker-pulse" : ""}"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })
      return acc
    }, {})
  }, [markers])

  return (
    <div className={className}>
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lon]}
            icon={markerIcons[marker.id]}
          >
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
        {drawRoute && route.length >= 2 && <Polyline positions={route} pathOptions={{ color: "#2563eb", weight: 4 }} />}
      </MapContainer>
    </div>
  )
}
