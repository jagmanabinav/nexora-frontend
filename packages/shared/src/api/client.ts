import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";
import { normalizeApiResponse } from "./response";
import { resolveApiBaseURL } from "./config";
import type {
  ApiResponse,
  AuthResponse,
  User,
  Tenant,
  Role,
  Permission,
  Application,
  BillingPlan,
  BillingPlanCreate,
  Subscription,
  Invoice,
  TokenResponse,
  TenantApplication,
  TenantApplicationCreate,
  TenantUsersResponse,
} from "../types";

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
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshInFlight: Promise<void> | null = null;

  constructor(baseURL: string = ApiClient.getBaseURL()) {
    this.client = axios.create({
      baseURL: baseURL.replace(/\/+$/, ""),
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as
          (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
        if (!originalRequest) return Promise.reject(error);

        // If 401 and token exists, try to refresh
        const isAuthRequest = /\/auth\/(login|register|refresh)$/.test(
          originalRequest.url ?? "",
        );
        if (
          error.response?.status === 401 &&
          this.refreshToken &&
          !originalRequest._retry &&
          !isAuthRequest
        ) {
          originalRequest._retry = true;
          try {
            this.refreshInFlight ??= this.refreshAccessToken();
            await this.refreshInFlight;
            this.refreshInFlight = null;
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.refreshInFlight = null;
            this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use((response: AxiosResponse) => {
      if (
        response.data !== undefined &&
        response.config.responseType !== "blob"
      ) {
        response.data = normalizeApiResponse(response.data);
      }
      return response;
    });

    // Load tokens from storage
    this.loadTokensFromStorage();
  }

  private static getBaseURL(): string {
    return resolveApiBaseURL(
      process.env.NEXT_PUBLIC_API_URL,
      process.env.NODE_ENV,
    );
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await this.client.post<
      ApiResponse<{ tokens: TokenResponse }>
    >("/api/v1/auth/refresh", { refresh_token: this.refreshToken });
    const tokens = response.data.data.tokens;
    this.setTokens(tokens.access_token, tokens.refresh_token);
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  /**
   * AUTH ENDPOINTS
   */

  auth = {
    register: async (data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      tenant_name: string;
      tenant_slug: string;
    }) => {
      const response = await this.client.post<ApiResponse<AuthResponse>>(
        "/api/v1/auth/register",
        data,
      );
      const tokens = response.data.data.tokens;
      this.setTokens(tokens.access_token, tokens.refresh_token);
      return response.data.data;
    },

    login: async (email: string, password: string) => {
      const response = await this.client.post<ApiResponse<AuthResponse>>(
        "/api/v1/auth/login",
        { email, password },
      );
      const tokens = response.data.data.tokens;
      this.setTokens(tokens.access_token, tokens.refresh_token);
      return response.data.data;
    },

    logout: async () => {
      try {
        await this.client.post("/api/v1/auth/logout");
      } finally {
        this.clearTokens();
      }
    },

    getMe: async () => {
      const response = await this.client.get<
        ApiResponse<{
          user: User;
          tenant: Tenant;
          roles: Role[];
          permissions: string[];
        }>
      >("/api/v1/auth/me");
      return response.data.data;
    },

    refreshToken: async (refreshToken: string) => {
      const response = await this.client.post<ApiResponse<AuthResponse>>(
        "/api/v1/auth/refresh",
        { refresh_token: refreshToken },
      );
      const tokens = response.data.data.tokens;
      this.setTokens(tokens.access_token, tokens.refresh_token);
      return response.data.data;
    },
  };

  tenantApplications = {
    register: async (data: TenantApplicationCreate) => {
      const response = await this.client.post<ApiResponse<TenantApplication>>(
        "/api/v1/tenant-applications",
        data,
      );
      return response.data.data;
    },

    list: async (status: TenantApplication["status"] = "pending") => {
      const response = await this.client.get<ApiResponse<TenantApplication[]>>(
        "/api/v1/tenant-applications",
        { params: { status_filter: status } },
      );
      return response.data.data;
    },

    approve: async (applicationId: string) => {
      const response = await this.client.post<ApiResponse<TenantApplication>>(
        `/api/v1/tenant-applications/${applicationId}/approve`,
      );
      return response.data.data;
    },

    reject: async (applicationId: string, rejection_reason?: string) => {
      const response = await this.client.post<ApiResponse<TenantApplication>>(
        `/api/v1/tenant-applications/${applicationId}/reject`,
        { rejection_reason },
      );
      return response.data.data;
    },
  };

  tenantUsers = {
    list: async () => {
      const response =
        await this.client.get<ApiResponse<TenantUsersResponse>>(
          "/api/v1/users",
        );
      return response.data.data;
    },

    create: async (data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role_id?: string;
    }) => {
      const response = await this.client.post<
        ApiResponse<{ user: User; role_id: string; role_name: string }>
      >("/api/v1/users", data);
      return response.data.data;
    },
  };

  /**
   * APPLICATION ENDPOINTS
   */

  applications = {
    list: async () => {
      const response = await this.client.get<ApiResponse<Application[]>>(
        "/api/v1/applications",
      );
      return response.data.data;
    },

    get: async (appId: string) => {
      const response = await this.client.get<ApiResponse<Application>>(
        `/api/v1/applications/${appId}`,
      );
      return response.data.data;
    },

    create: async (data: {
      name: string;
      description?: string;
      webhook_url?: string;
    }) => {
      const response = await this.client.post<ApiResponse<Application>>(
        "/api/v1/applications",
        data,
      );
      return response.data.data;
    },

    update: async (appId: string, data: Record<string, unknown>) => {
      const response = await this.client.put<ApiResponse<Application>>(
        `/api/v1/applications/${appId}`,
        data,
      );
      return response.data.data;
    },

    activate: async (appId: string) => {
      const response = await this.client.post<ApiResponse<Application>>(
        `/api/v1/applications/${appId}/activate`,
      );
      return response.data.data;
    },

    deactivate: async (appId: string) => {
      const response = await this.client.post<ApiResponse<Application>>(
        `/api/v1/applications/${appId}/suspend`,
      );
      return response.data.data;
    },
  };

  /**
   * RBAC ENDPOINTS
   */

  rbac = {
    roles: {
      list: async () => {
        const response =
          await this.client.get<ApiResponse<Role[]>>("/api/v1/roles");
        return response.data.data;
      },

      get: async (roleId: string) => {
        const response = await this.client.get<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}`,
        );
        return response.data.data;
      },

      create: async (data: { name: string; description: string }) => {
        const response = await this.client.post<ApiResponse<Role>>(
          "/api/v1/roles",
          data,
        );
        return response.data.data;
      },

      update: async (roleId: string, data: Record<string, unknown>) => {
        const response = await this.client.put<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}`,
          data,
        );
        return response.data.data;
      },

      delete: async (roleId: string) => {
        await this.client.delete(`/api/v1/roles/${roleId}`);
      },

      getPermissions: async (roleId: string) => {
        const response = await this.client.get<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}`,
        );
        return response.data.data.permissions;
      },

      assignPermission: async (roleId: string, permissionId: string) => {
        const currentRole = await this.client.get<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}`,
        );
        const permissionIds = Array.from(
          new Set([
            ...currentRole.data.data.permissions.map(
              (permission) => permission.id,
            ),
            permissionId,
          ]),
        );
        const response = await this.client.post<ApiResponse<Role>>(
          `/api/v1/roles/${roleId}/permissions`,
          { permission_ids: permissionIds },
        );
        return response.data.data;
      },

      revokePermission: async (roleId: string, permissionId: string) => {
        await this.client.delete(
          `/api/v1/roles/${roleId}/permissions/${permissionId}`,
        );
      },
    },

    permissions: {
      list: async () => {
        const response = await this.client.get<ApiResponse<Permission[]>>(
          "/api/v1/permissions",
        );
        return response.data.data;
      },

      get: async (permissionId: string) => {
        const response = await this.client.get<ApiResponse<Permission[]>>(
          "/api/v1/permissions",
        );
        const permission = response.data.data.find(
          (item) => item.id === permissionId,
        );
        if (!permission)
          throw new Error(`Permission ${permissionId} was not found`);
        return permission;
      },
    },

    users: {
      assignRole: async (userId: string, roleId: string) => {
        const response = await this.client.post(
          `/api/v1/users/${userId}/roles`,
          { role_id: roleId },
        );
        return response.data.data;
      },

      revokeRole: async (userId: string, roleId: string) => {
        await this.client.delete(`/api/v1/users/${userId}/roles/${roleId}`);
      },

      getPermissions: async (userId: string) => {
        const response = await this.client.get<ApiResponse<Permission[]>>(
          `/api/v1/users/${userId}/permissions`,
        );
        return response.data.data;
      },
    },
  };

  /**
   * BILLING ENDPOINTS
   */

  billing = {
    plans: {
      list: async (applicationCode?: string) => {
        const response = await this.client.get<ApiResponse<BillingPlan[]>>(
          "/api/v1/plans",
          {
            params: applicationCode
              ? { application_code: applicationCode }
              : undefined,
          },
        );
        return response.data.data;
      },

      get: async (planId: string) => {
        const response = await this.client.get<ApiResponse<BillingPlan>>(
          `/api/v1/plans/${planId}`,
        );
        return response.data.data;
      },

      create: async (data: BillingPlanCreate) => {
        const response = await this.client.post<ApiResponse<BillingPlan>>(
          "/api/v1/plans",
          data,
        );
        return response.data.data;
      },

      update: async (planId: string, data: Record<string, unknown>) => {
        const response = await this.client.put<ApiResponse<BillingPlan>>(
          `/api/v1/plans/${planId}`,
          data,
        );
        return response.data.data;
      },
    },

    subscriptions: {
      getCurrent: async () => {
        const response = await this.client.get<ApiResponse<Subscription>>(
          "/api/v1/subscriptions",
        );
        return response.data.data;
      },

      create: async (data: {
        plan_id: string;
        billing_cycle?: "monthly" | "annual" | "lifetime";
        trial_days?: number;
      }) => {
        const response = await this.client.post<ApiResponse<Subscription>>(
          "/api/v1/subscriptions",
          data,
        );
        return response.data.data;
      },

      update: async (data: { plan_id?: string; auto_renew?: boolean }) => {
        const response = await this.client.put<ApiResponse<Subscription>>(
          "/api/v1/subscriptions",
          data,
        );
        return response.data.data;
      },

      cancel: async (reason?: string) => {
        const response = await this.client.post<ApiResponse<Subscription>>(
          "/api/v1/subscriptions/cancel",
          reason ? { reason } : {},
        );
        return response.data.data;
      },
    },

    invoices: {
      list: async () => {
        const response =
          await this.client.get<ApiResponse<Invoice[]>>("/api/v1/invoices");
        return response.data.data;
      },

      get: async (invoiceId: string) => {
        const response = await this.client.get<ApiResponse<Invoice>>(
          `/api/v1/invoices/${invoiceId}`,
        );
        return response.data.data;
      },
    },
  };

  /**
   * TOKEN MANAGEMENT
   */

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  private loadTokensFromStorage(): void {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

export default apiClient;
