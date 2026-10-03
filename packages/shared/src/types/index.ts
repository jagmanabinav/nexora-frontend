/**
 * TypeScript Types for Nexora Platform
 * Mirrors the backend Pydantic schemas
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  user: User
  tenant: Tenant
  tokens: TokenResponse
}

export interface UserRegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  tenant_name: string
  tenant_slug: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface UserMeResponse {
  user: User
  tenant: Tenant
  roles: Role[]
}

// ============================================================================
// TENANT TYPES
// ============================================================================

export interface TenantCreate {
  name: string
  slug: string
}

export interface TenantUpdate {
  name?: string
  slug?: string
  is_active?: boolean
}

export interface TenantListResponse {
  id: string
  name: string
  slug: string
  owner_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export interface Application {
  id: string
  tenant_id: string
  app_id: string
  name: string
  description: string
  webhook_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApplicationCreate {
  name: string
  description: string
  webhook_url?: string
}

export interface ApplicationUpdate {
  name?: string
  description?: string
  webhook_url?: string
  is_active?: boolean
}

// ============================================================================
// API KEY TYPES
// ============================================================================

export interface APIKey {
  id: string
  app_id: string
  key_name: string
  created_at: string
  last_used: string | null
}

export interface APIKeyCreate {
  key_name: string
}

export interface APIKeySecret {
  id: string
  secret: string
  key_name: string
}

// ============================================================================
// RBAC TYPES
// ============================================================================

export interface Role {
  id: string
  tenant_id: string
  name: string
  description: string
  is_system_role: boolean
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  created_at: string
}

export interface RoleCreate {
  name: string
  description: string
}

export interface RoleUpdate {
  name?: string
  description?: string
}

export interface TenantUser {
  id: string
  user_id: string
  tenant_id: string
  email: string
  first_name: string
  last_name: string
  roles: Role[]
  created_at: string
  updated_at: string
}

export interface AssignRoleRequest {
  user_id: string
  role_id: string
}

// ============================================================================
// BILLING TYPES
// ============================================================================

export interface BillingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billing_period: 'monthly' | 'yearly'
  features: Record<string, boolean>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  tenant_id: string
  plan_id: string
  status: 'active' | 'inactive' | 'cancelled' | 'suspended'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  tenant_id: string
  subscription_id: string
  amount: number
  currency: string
  status: 'draft' | 'issued' | 'paid' | 'overdue'
  due_date: string
  issued_date: string
  created_at: string
  updated_at: string
}

export interface BillingPlanCreate {
  name: string
  description: string
  price: number
  currency: string
  billing_period: 'monthly' | 'yearly'
  features: Record<string, boolean>
}

export interface SubscriptionCreate {
  plan_id: string
}

// ============================================================================
// JWT PAYLOAD TYPES
// ============================================================================

export interface JWTPayload {
  sub: string // user_id
  tenant_id: string
  app_id: string
  email: string
  roles: string[]
  exp: number
  iat: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  request_id: string
  timestamp: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  request_id: string
  timestamp: string
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface RequestContext {
  user_id: string
  tenant_id: string
  app_id: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface ApiConfig {
  baseURL: string
  timeout?: number
  withCredentials?: boolean
}
