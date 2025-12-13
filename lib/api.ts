const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0"
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')

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

  private async request<T>(endpoint: string, config: RequestConfig = {}, retries = 3): Promise<T> {
    const { params, ...fetchConfig } = config
    const url = this.buildUrl(endpoint, params)

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...config.headers,
    }

    if (this.token) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Erreur HTTP: ${response.status}`,
          status: response.status 
        }))
        
        // Retry on server errors (5xx) or network issues
        if (response.status >= 500 && retries > 0) {
          console.warn(`Retrying request to ${endpoint}, attempts left: ${retries - 1}`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s before retry
          return this.request<T>(endpoint, config, retries - 1)
        }
        
        throw new Error(error.message || `Erreur HTTP: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: La requête a pris trop de temps')
      }
      
      // Retry on network errors
      if (retries > 0 && error instanceof TypeError) {
        console.warn(`Network error, retrying ${endpoint}, attempts left: ${retries - 1}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
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
      body: data ? JSON.stringify(data) : undefined,
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

  async delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", params })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
