import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import type {
  ApiResponse,
  AuthResponse,
  User,
  Tenant,
  Role,
  Permission,
  Application,
  BillingPlan,
  Subscription,
  Invoice,
  TenantListResponse,
  TenantUser,
} from '../types'

/**
 * Centralized API Client for Nexora Platform
 * Used by all applications (Admin, FabWash, Retail, Medical)
 *
 * Features:
 * - Token management (access + refresh)
 * - Automatic request/response interceptors
 * - Error handling
 * - Request ID tracking
 */

class ApiClient {
  private client: AxiosInstance
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
        }

        // If 401 and token exists, try to refresh
        if (error.response?.status === 401 && this.refreshToken && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const response = await this.client.post('/api/v1/auth/refresh', {
              refresh_token: this.refreshToken,
            })
            const newTokens = response.data.data.tokens
            this.setTokens(newTokens.access_token, newTokens.refresh_token)
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            this.clearTokens()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    // Load tokens from storage
    this.loadTokensFromStorage()
  }

  /**
   * AUTH ENDPOINTS
   */

  auth = {
    register: async (data: {
      email: string
      password: string
      first_name: string
      last_name: string
      tenant_name: string
      tenant_slug: string
    }) => {
      const response = await this.client.post<ApiResponse<AuthResponse>>(
        '/api/v1/auth/register',
        data
      )
      const tokens = response.data.data.tokens
      this.setTokens(tokens.access_token, tokens.refresh_token)
      return response.data.data
    },

    login: async (email: string, password: string) => {
      const response = await this.client.post<ApiResponse<AuthResponse>>(
        '/api/v1/auth/login',
        { email, password }
      )
      const tokens = response.data.data.tokens
      this.setTokens(tokens.access_token, tokens.refresh_token)
      return response.data.data
    },

    logout: async () => {
      try {
        await this.client.post('/api/v1/auth/logout')
      } finally {
        this.clearTokens()
      }
    },

    getMe: async () => {
      const response = await this.client.get<ApiResponse<{ user: User; tenant: Tenant; roles: Role[] }>>(
        '/api/v1/auth/me'
      )
      return response.data.data
    },

    refreshToken: async (refreshToken: string) => {
      const response = await this.client.post<ApiResponse<AuthResponse>>(
        '/api/v1/auth/refresh',
        { refresh_token: refreshToken }
      )
      const tokens = response.data.data.tokens
      this.setTokens(tokens.access_token, tokens.refresh_token)
      return response.data.data
    },
  }

  /**
   * TENANT ENDPOINTS
   */

  tenants = {
    list: async () => {
      const response = await this.client.get<ApiResponse<TenantListResponse[]>>(
        '/api/v1/tenants'
      )
      return response.data.data
    },

    get: async (tenantId: string) => {
      const response = await this.client.get<ApiResponse<Tenant>>(
        `/api/v1/tenants/${tenantId}`
      )
      return response.data.data
    },

    create: async (data: { name: string; slug: string }) => {
      const response = await this.client.post<ApiResponse<Tenant>>(
        '/api/v1/tenants',
        data
      )
      return response.data.data
    },

    update: async (tenantId: string, data: Record<string, unknown>) => {
      const response = await this.client.put<ApiResponse<Tenant>>(
        `/api/v1/tenants/${tenantId}`,
        data
      )
      return response.data.data
    },

    delete: async (tenantId: string) => {
      await this.client.delete(`/api/v1/tenants/${tenantId}`)
    },

    listUsers: async (tenantId: string) => {
      const response = await this.client.get<ApiResponse<TenantUser[]>>(
        `/api/v1/tenants/${tenantId}/users`
      )
      return response.data.data
    },

    addUser: async (tenantId: string, email: string) => {
      const response = await this.client.post<ApiResponse<TenantUser>>(
        `/api/v1/tenants/${tenantId}/users`,
        { email }
      )
      return response.data.data
    },

    removeUser: async (tenantId: string, userId: string) => {
      await this.client.delete(`/api/v1/tenants/${tenantId}/users/${userId}`)
    },
  }

  /**
   * APPLICATION ENDPOINTS
   */

  applications = {
    list: async () => {
      const response = await this.client.get<ApiResponse<Application[]>>(
        '/api/v1/applications'
      )
      return response.data.data
    },

    get: async (appId: string) => {
      const response = await this.client.get<ApiResponse<Application>>(
        `/api/v1/applications/${appId}`
      )
      return response.data.data
    },

    create: async (data: {
      name: string
      description: string
      webhook_url?: string
    }) => {
      const response = await this.client.post<ApiResponse<Application>>(
        '/api/v1/applications',
        data
      )
      return response.data.data
    },

    update: async (appId: string, data: Record<string, unknown>) => {
      const response = await this.client.put<ApiResponse<Application>>(
        `/api/v1/applications/${appId}`,
        data
      )
      return response.data.data
    },

    delete: async (appId: string) => {
      await this.client.delete(`/api/v1/applications/${appId}`)
    },
  }

  /**
   * RBAC ENDPOINTS
   */

  rbac = {
    roles: {
      list: async () => {
        const response = await this.client.get<ApiResponse<Role[]>>(
          '/api/v1/roles'
        )
        return response.data.data
      },

      get: async (roleId: string) => {
        const response = await this.client.get<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}`
        )
        return response.data.data
      },

      create: async (data: { name: string; description: string }) => {
        const response = await this.client.post<ApiResponse<Role>>(
          '/api/v1/roles',
          data
        )
        return response.data.data
      },

      update: async (roleId: string, data: Record<string, unknown>) => {
        const response = await this.client.put<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}`,
          data
        )
        return response.data.data
      },

      delete: async (roleId: string) => {
        await this.client.delete(`/api/v1/roles/${roleId}`)
      },

      getPermissions: async (roleId: string) => {
        const response = await this.client.get<ApiResponse<Permission[]>>(
          `/api/v1/roles/${roleId}/permissions`
        )
        return response.data.data
      },

      assignPermission: async (roleId: string, permissionId: string) => {
        const response = await this.client.post<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}/permissions`,
          { permission_id: permissionId }
        )
        return response.data.data
      },

      revokePermission: async (roleId: string, permissionId: string) => {
        await this.client.delete(
          `/api/v1/roles/${roleId}/permissions/${permissionId}`
        )
      },
    },

    permissions: {
      list: async () => {
        const response = await this.client.get<ApiResponse<Permission[]>>(
          '/api/v1/permissions'
        )
        return response.data.data
      },

      get: async (permissionId: string) => {
        const response = await this.client.get<ApiResponse<Permission>>(
          `/api/v1/permissions/${permissionId}`
        )
        return response.data.data
      },
    },

    users: {
      assignRole: async (userId: string, roleId: string) => {
        const response = await this.client.post(
          `/api/v1/users/${userId}/roles`,
          { role_id: roleId }
        )
        return response.data.data
      },

      revokeRole: async (userId: string, roleId: string) => {
        await this.client.delete(`/api/v1/users/${userId}/roles/${roleId}`)
      },

      getPermissions: async (userId: string) => {
        const response = await this.client.get<ApiResponse<Permission[]>>(
          `/api/v1/users/${userId}/permissions`
        )
        return response.data.data
      },
    },
  }

  /**
   * BILLING ENDPOINTS
   */

  billing = {
    plans: {
      list: async () => {
        const response = await this.client.get<ApiResponse<BillingPlan[]>>(
          '/api/v1/billing/plans'
        )
        return response.data.data
      },

      get: async (planId: string) => {
        const response = await this.client.get<ApiResponse<BillingPlan>>(
          `/api/v1/billing/plans/${planId}`
        )
        return response.data.data
      },

      create: async (data: Record<string, unknown>) => {
        const response = await this.client.post<ApiResponse<BillingPlan>>(
          '/api/v1/billing/plans',
          data
        )
        return response.data.data
      },

      update: async (planId: string, data: Record<string, unknown>) => {
        const response = await this.client.put<ApiResponse<BillingPlan>>(
          `/api/v1/billing/plans/${planId}`,
          data
        )
        return response.data.data
      },

      delete: async (planId: string) => {
        await this.client.delete(`/api/v1/billing/plans/${planId}`)
      },
    },

    subscriptions: {
      list: async () => {
        const response = await this.client.get<ApiResponse<Subscription[]>>(
          '/api/v1/billing/subscriptions'
        )
        return response.data.data
      },

      get: async (subscriptionId: string) => {
        const response = await this.client.get<ApiResponse<Subscription>>(
          `/api/v1/billing/subscriptions/${subscriptionId}`
        )
        return response.data.data
      },

      create: async (data: { plan_id: string }) => {
        const response = await this.client.post<ApiResponse<Subscription>>(
          '/api/v1/billing/subscriptions',
          data
        )
        return response.data.data
      },

      cancel: async (subscriptionId: string) => {
        const response = await this.client.post<ApiResponse<Subscription>>(
          `/api/v1/billing/subscriptions/${subscriptionId}/cancel`
        )
        return response.data.data
      },
    },

    invoices: {
      list: async () => {
        const response = await this.client.get<ApiResponse<Invoice[]>>(
          '/api/v1/billing/invoices'
        )
        return response.data.data
      },

      get: async (invoiceId: string) => {
        const response = await this.client.get<ApiResponse<Invoice>>(
          `/api/v1/billing/invoices/${invoiceId}`
        )
        return response.data.data
      },

      download: async (invoiceId: string) => {
        const response = await this.client.get(
          `/api/v1/billing/invoices/${invoiceId}/download`,
          {
            responseType: 'blob',
          }
        )
        return response.data
      },
    },
  }

  /**
   * TOKEN MANAGEMENT
   */

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken
    this.refreshToken = refreshToken

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  private clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (accessToken && refreshToken) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

export default apiClient
