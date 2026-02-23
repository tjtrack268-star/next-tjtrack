export type LatLon = { lat: number; lon: number }

const CITY_COORDS: Record<string, LatLon> = {
  douala: { lat: 4.0511, lon: 9.7679 },
  yaounde: { lat: 3.848, lon: 11.5021 },
  garoua: { lat: 9.3265, lon: 13.398 },
  bamenda: { lat: 5.9631, lon: 10.1591 },
  bafoussam: { lat: 5.4781, lon: 10.4178 },
  limbe: { lat: 4.0233, lon: 9.2067 },
  buea: { lat: 4.156, lon: 9.2324 },
  maroua: { lat: 10.5909, lon: 14.3159 },
  bertoua: { lat: 4.5773, lon: 13.6846 },
  ngaoundere: { lat: 7.3277, lon: 13.5847 },
  kribi: { lat: 2.9373, lon: 9.907 },
  ebolowa: { lat: 2.9, lon: 11.154 },
  foumban: { lat: 5.7269, lon: 10.9006 },
  kumba: { lat: 4.6363, lon: 9.4469 },
}

export function normalizeCityKey(value?: string | null): string {
  if (!value) return ""
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function getCityCoordinates(city?: string | null): LatLon | null {
  const key = normalizeCityKey(city)
  if (!key) return null
  return CITY_COORDS[key] || null
}
