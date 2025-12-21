/**
 * Utilitaire pour construire les URLs d'images depuis MinIO
 */

const MINIO_BASE_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000'
const MINIO_BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET || 'tjtrack-files'

/**
 * Construit l'URL complète d'une image MinIO
 * @param imagePath - Le chemin de l'image (ex: "products/abc-123.jpg")
 * @returns L'URL complète de l'image ou null si pas d'image
 */
export function buildImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Construire l'URL MinIO
  return `${MINIO_BASE_URL}/${MINIO_BUCKET}/${imagePath}`
}

/**
 * Construit les URLs pour un tableau d'images
 * @param imagePaths - Tableau de chemins d'images
 * @returns Tableau d'URLs complètes
 */
export function buildImageUrls(imagePaths: (string | null | undefined)[]): string[] {
  return imagePaths
    .map(buildImageUrl)
    .filter((url): url is string => url !== null)
}