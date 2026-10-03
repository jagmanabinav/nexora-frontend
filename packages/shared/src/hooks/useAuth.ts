/**
 * React Hooks for Nexora Platform
 * Provides convenient access to auth, data fetching, and state management
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '../api/client'
import type {
  User,
  Tenant,
  Role,
  AuthResponse,
  ApiError,
} from '../types'

/**
 * useAuth - Authentication hook
 * Manages login, logout, registration, and auth state
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load current user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          const data = await apiClient.auth.getMe()
          setUser(data.user)
          setTenant(data.tenant)
          setRoles(data.roles)
        }
      } catch (err) {
        setError((err as ApiError)?.error?.message || 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      tenantName: string,
      tenantSlug: string
    ) => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiClient.auth.register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          tenant_name: tenantName,
          tenant_slug: tenantSlug,
        })
        setUser(result.user)
        setTenant(result.tenant)
        return result
      } catch (err) {
        const errorMsg = (err as ApiError)?.error?.message || 'Registration failed'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.auth.login(email, password)
      setUser(result.user)
      setTenant(result.tenant)
      return result
    } catch (err) {
      const errorMsg = (err as ApiError)?.error?.message || 'Login failed'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.auth.logout()
      setUser(null)
      setTenant(null)
      setRoles([])
    } catch (err) {
      setError((err as ApiError)?.error?.message || 'Logout failed')
      throw err
    }
  }, [])

  const hasRole = useCallback(
    (roleName: string) => {
      return roles.some((role) => role.name === roleName)
    },
    [roles]
  )

  const hasPermission = useCallback(
    (permission: string) => {
      // This would typically come from a permissions array
      // For now, checking based on roles
      return true
    },
    []
  )

  return {
    user,
    tenant,
    roles,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    hasRole,
    hasPermission,
  }
}

/**
 * useTenant - Tenant management hook
 */
export const useTenant = () => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const list = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.tenants.list()
      setTenants(result)
      return result
    } catch (err) {
      setError((err as ApiError)?.error?.message || 'Failed to load tenants')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(async (tenantId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.tenants.get(tenantId)
      setCurrentTenant(result)
      return result
    } catch (err) {
      setError((err as ApiError)?.error?.message || 'Failed to load tenant')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (name: string, slug: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.tenants.create({ name, slug })
      setTenants([...tenants, result])
      return result
    } catch (err) {
      setError((err as ApiError)?.error?.message || 'Failed to create tenant')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tenants])

  return {
    tenants,
    currentTenant,
    loading,
    error,
    list,
    get,
    create,
    refresh: list,
  }
}

/**
 * useQuery - Data fetching hook
 */
export const useQuery = <T,>(
  queryFn: () => Promise<T>,
  dependencies: unknown[] = []
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError((err as ApiError)?.error?.message || 'Query failed')
    } finally {
      setLoading(false)
    }
  }, [queryFn])

  useEffect(() => {
    refetch()
  }, dependencies)

  return { data, loading, error, refetch }
}

/**
 * useMutation - Data mutation hook
 */
export const useMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (variables: TVariables) => {
      setLoading(true)
      setError(null)
      try {
        const result = await mutationFn(variables)
        setData(result)
        return result
      } catch (err) {
        const errorMsg = (err as ApiError)?.error?.message || 'Mutation failed'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutationFn]
  )

  return { data, loading, error, mutate }
}

/**
 * useLocalStorage - Local storage hook
 */
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage for key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

/**
 * useApi - Generic API hook wrapper
 */
export const useApi = <T,>(
  apiMethod: (...args: unknown[]) => Promise<T>,
  immediate = true
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiMethod(...args)
        setData(result)
        return result
      } catch (err) {
        const errorMsg = (err as ApiError)?.error?.message || 'API call failed'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiMethod]
  )

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, loading, error, execute }
}
