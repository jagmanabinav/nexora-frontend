/**
 * Centralized API Service Layer
 * Handles all backend communication with FastAPI backend
 * Consistent error handling and retry logic
 *
 * Backend: FastAPI running on http://localhost:8000/api/v1
 * Endpoints are organized by resource (auth, applications, billing, rbac, advanced)
 */

interface ApiResponse<T = unknown> {
  data?: T
  success?: boolean
  error?: {
    code: string
    message: string
    details?: Record<string, string>
  }
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  retries?: number
  skipErrorHandling?: boolean
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Retry with exponential backoff
 * Retries failed requests with increasing delays
 * Skips retry on 4xx client errors (except 408, 429)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx) except timeout (408) and rate limit (429)
      if (error instanceof ApiError) {
        const isRetryableClientError = error.statusCode === 408 || error.statusCode === 429
        if (error.statusCode >= 400 && error.statusCode < 500 && !isRetryableClientError) {
          throw error
        }
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      const delayMs = initialDelayMs * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError || new Error('Unknown error in retry loop')
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

/**
 * Core API request function with error handling
 * Integrates with FastAPI backend at http://localhost:8000/api/v1
 */
async function makeRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, retries = 3, skipErrorHandling = false } = options

  // FastAPI backend configuration
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  const url = `${apiBaseUrl}${endpoint}`

  const token = getAuthToken()
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add authorization token if available
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestOptions.body = JSON.stringify(body)
  }

  return retryWithBackoff(async () => {
    const response = await fetch(url, requestOptions)
    const contentType = response.headers.get('content-type')
    
    let data: unknown = null
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      // Handle FastAPI error response format
      const errorData = typeof data === 'object' ? (data as Record<string, unknown>) : {}
      const detail = (errorData as Record<string, unknown>)?.detail

      throw new ApiError(
        response.status,
        (errorData as Record<string, unknown>)?.error_code?.toString() || 'UNKNOWN_ERROR',
        typeof detail === 'string' ? detail : `HTTP ${response.status}: ${response.statusText}`,
        typeof (errorData as Record<string, unknown>)?.errors === 'object'
          ? (errorData as Record<string, unknown>)?.errors as Record<string, string>
          : undefined
      )
    }

    // FastAPI returns data directly or wrapped in response object
    return (data as ApiResponse<T>) || { data }
  }, retries)
}

/**
 * API Client - Organized by resource
 */
export const api = {
  // Fabric Batches
  fabricBatches: {
    list: async (page = 1, limit = 10, search = '') =>
      makeRequest('/fabric-batches', {
        method: 'GET',
      }),

    get: async (id: string) =>
      makeRequest(`/fabric-batches/${id}`),

    create: async (data: unknown) =>
      makeRequest('/fabric-batches', {
        method: 'POST',
        body: data,
      }),

    update: async (id: string, data: unknown) =>
      makeRequest(`/fabric-batches/${id}`, {
        method: 'PUT',
        body: data,
      }),

    delete: async (id: string) =>
      makeRequest(`/fabric-batches/${id}`, {
        method: 'DELETE',
      }),
  },

  // Processing Operations
  processes: {
    list: async (page = 1, limit = 10, status = '') =>
      makeRequest('/processes', {
        method: 'GET',
      }),

    get: async (id: string) =>
      makeRequest(`/processes/${id}`),

    create: async (data: unknown) =>
      makeRequest('/processes', {
        method: 'POST',
        body: data,
      }),

    update: async (id: string, data: unknown) =>
      makeRequest(`/processes/${id}`, {
        method: 'PUT',
        body: data,
      }),

    delete: async (id: string) =>
      makeRequest(`/processes/${id}`, {
        method: 'DELETE',
      }),
  },

  // Customers
  customers: {
    list: async (page = 1, limit = 10, status = '') =>
      makeRequest('/customers', {
        method: 'GET',
      }),

    get: async (id: string) =>
      makeRequest(`/customers/${id}`),

    create: async (data: unknown) =>
      makeRequest('/customers', {
        method: 'POST',
        body: data,
      }),

    update: async (id: string, data: unknown) =>
      makeRequest(`/customers/${id}`, {
        method: 'PUT',
        body: data,
      }),

    delete: async (id: string) =>
      makeRequest(`/customers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Invoices
  invoices: {
    list: async (page = 1, limit = 10, status = '') =>
      makeRequest('/invoices', {
        method: 'GET',
      }),

    get: async (id: string) =>
      makeRequest(`/invoices/${id}`),

    create: async (data: unknown) =>
      makeRequest('/invoices', {
        method: 'POST',
        body: data,
      }),

    update: async (id: string, data: unknown) =>
      makeRequest(`/invoices/${id}`, {
        method: 'PUT',
        body: data,
      }),

    delete: async (id: string) =>
      makeRequest(`/invoices/${id}`, {
        method: 'DELETE',
      }),
  },

  // Reports
  reports: {
    metrics: async (timeRange = 'month') =>
      makeRequest(`/reports/metrics?time_range=${timeRange}`, {
        method: 'GET',
      }),

    trends: async (timeRange = 'month') =>
      makeRequest(`/reports/trends?time_range=${timeRange}`, {
        method: 'GET',
      }),

    export: async (format = 'pdf') =>
      makeRequest('/reports/export', {
        method: 'POST',
        body: { format },
      }),
  },
}

export type { ApiResponse, ApiRequestOptions }
