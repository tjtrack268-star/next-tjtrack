const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://147.93.9.170:8080/api/v1.0"
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000')

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private isPublicEndpoint(endpoint: string): boolean {
    const publicEndpoints = [
      '/catalogue/',
      '/ecommerce/produits',
      '/ecommerce/categories',
      '/panier/',
      '/publicite/',
      '/quartiers/',
      '/login',
      '/register',
      '/payments/',
      '/communication/',
    ]
    // /commandes/creer et /payments/* sont publics mais doivent recevoir le token si disponible
    return publicEndpoints.some(path => endpoint.includes(path))
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}, retries = 3): Promise<T> {
    const { params, ...fetchConfig } = config
    const url = this.buildUrl(endpoint, params)

    const headers: HeadersInit = {
      ...config.headers,
    }

    // Ne pas ajouter Content-Type si c'est un FormData (le navigateur le fera automatiquement)
    if (!(fetchConfig.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] = "application/json"
    }

    // Toujours envoyer le token s'il existe (même pour les endpoints publics comme /commandes/creer)
    if (this.token) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`
      console.log('🔑 Token envoyé:', this.token.substring(0, 20) + '...')
    } else {
      console.warn('⚠️ Aucun token disponible pour', endpoint)
      // Essayer de récupérer le token depuis localStorage
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('tj-track-token') : null
      if (storedToken) {
        console.log('🔄 Token récupéré depuis localStorage')
        this.token = storedToken
        ;(headers as Record<string, string>)["Authorization"] = `Bearer ${storedToken}`
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn(`Request timeout for ${endpoint} after ${API_TIMEOUT}ms`)
      controller.abort()
    }, API_TIMEOUT)

    try {
      const startTime = performance.now()
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      })
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (duration > 1000) {
        console.warn(`Slow request detected: ${endpoint} took ${duration.toFixed(2)}ms`)
      }

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { 
            message: `Erreur HTTP: ${response.status}`,
            status: response.status 
          }
        }
        
        // Log détaillé pour debug (seulement si errorData contient un message)
        if (errorData?.message) {
          console.error('❌ API Error:', {
            endpoint,
            status: response.status,
            message: errorData.message,
            method: fetchConfig.method || 'GET'
          })
        }
        
        // Gestion spéciale pour les erreurs d'authentification
        if (response.status === 401 || response.status === 403) {
          // Ne pas rediriger si c'est un endpoint public
          if (!this.isPublicEndpoint(endpoint)) {
            // Déconnecter l'utilisateur si le token est invalide
            localStorage.removeItem("tj-track-token")
            localStorage.removeItem("tj-track-user")
            document.cookie = 'tj-track-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            this.setToken(null)
            
            // Rediriger vers la page de connexion si on n'y est pas déjà
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/connexion')) {
              window.location.href = '/connexion'
            }
            
            throw new Error("Session expirée. Veuillez vous reconnecter.")
          }
          // Pour les endpoints publics, laisser passer l'erreur sans redirection
          throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
        }
        
        // Retry on server errors (5xx) or network issues
        if (response.status >= 500 && retries > 0) {
          console.warn(`Retrying request to ${endpoint}, attempts left: ${retries - 1}`)
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * (4 - retries), 3000)))
          return this.request<T>(endpoint, config, retries - 1)
        }
        
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      // Vérifier si la réponse a du contenu
      const contentLength = response.headers.get('content-length')
      const contentType = response.headers.get('content-type')
      
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        return {} as T // Retourner un objet vide pour les réponses sans contenu
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: La requête a pris trop de temps')
      }
      
      // Retry on network errors with exponential backoff
      if (retries > 0 && error instanceof TypeError) {
        const delay = Math.min(1000 * (4 - retries), 3000)
        console.warn(`Network error, retrying ${endpoint} in ${delay}ms, attempts left: ${retries - 1}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.request<T>(endpoint, config, retries - 1)
      }
      
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params })
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      params,
    })
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      params,
    })
  }

  async delete<T>(
    endpoint: string,
    data?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
      params,
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
