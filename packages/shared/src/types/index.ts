/**
 * TypeScript Types for Nexora Platform
 * Mirrors the backend Pydantic schemas
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  email_verified: boolean;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tenant: Tenant;
  tokens: TokenResponse;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  tenant_name: string;
  tenant_slug: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserMeResponse {
  user: User;
  tenant: Tenant;
  roles: Role[];
  permissions: string[];
}

export interface TenantApplication {
  id: string;
  tenant_id: string;
  company_name: string;
  company_slug: string;
  company_email: string | null;
  company_phone: string | null;
  owner_email: string;
  owner_first_name: string | null;
  owner_last_name: string | null;
  application_code: string;
  plan_id: string;
  plan_name: string;
  plan_max_users: number;
  monthly_price: number;
  annual_price: number;
  billing_cycle: "monthly" | "annual" | "lifetime";
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export interface TenantApplicationCreate {
  application_code: "fabwash";
  company_name: string;
  company_slug: string;
  company_email?: string;
  company_phone?: string;
  owner_email: string;
  owner_password: string;
  owner_first_name?: string;
  owner_last_name?: string;
  plan_id: string;
  billing_cycle: "monthly" | "annual" | "lifetime";
}

export interface TenantUsersResponse {
  users: Array<{
    user: User;
    role_id: string;
    role_name: string;
  }>;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  plan_name: string;
  max_users: number;
  user_count: number;
}

// ============================================================================
// TENANT TYPES
// ============================================================================

export interface TenantCreate {
  name: string;
  slug: string;
}

export interface TenantUpdate {
  name?: string;
  slug?: string;
  is_active?: boolean;
}

export type TenantListResponse = Tenant;

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export interface Application {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  name: string;
  description?: string;
  webhook_url?: string;
}

export interface ApplicationUpdate {
  name?: string;
  description?: string;
  webhook_url?: string;
}

// ============================================================================
// API KEY TYPES
// ============================================================================

export interface APIKey {
  id: string;
  app_id: string;
  key_name: string;
  created_at: string;
  last_used: string | null;
}

export interface APIKeyCreate {
  key_name: string;
}

export interface APIKeySecret {
  id: string;
  secret: string;
  key_name: string;
}

// ============================================================================
// RBAC TYPES
// ============================================================================

export interface Role {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  description: string | null;
}

export interface RoleCreate {
  name: string;
  description: string;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
}

export interface TenantUser {
  id: string;
  user_id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
}

// ============================================================================
// BILLING TYPES
// ============================================================================

export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  application_code: string;
  tier: "free" | "starter" | "professional" | "enterprise";
  description: string | null;
  monthly_price: number;
  annual_price: number;
  setup_fee: number;
  max_users: number;
  max_api_keys: number;
  max_applications: number;
  storage_gb: number;
  api_requests_per_month: number;
  support_level: string;
  sso_enabled: boolean;
  advanced_analytics: boolean;
  webhook_support: boolean;
  custom_domain: boolean;
  api_access: boolean;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: "active" | "inactive" | "cancelled" | "suspended";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: "draft" | "issued" | "paid" | "overdue";
  due_date: string;
  issued_date: string;
  created_at: string;
  updated_at: string;
}

export interface BillingPlanCreate {
  name: string;
  slug: string;
  application_code: string;
  tier: BillingPlan["tier"];
  description?: string;
  monthly_price: number;
  annual_price: number;
  is_active: boolean;
}

export interface SubscriptionCreate {
  plan_id: string;
}

// ============================================================================
// JWT PAYLOAD TYPES
// ============================================================================

export interface JWTPayload {
  sub: string; // user_id
  tenant_id: string;
  app_id: string;
  email: string;
  roles: string[];
  exp: number;
  iat: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
  request_id?: string;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  request_id: string;
  timestamp: string;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface RequestContext {
  user_id: string;
  tenant_id: string;
  app_id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
}
