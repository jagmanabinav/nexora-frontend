'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useTenant as useTenantHook } from '../hooks/useAuth'
import type { Tenant } from '../types'

interface TenantContextType {
  tenants: Tenant[]
  currentTenant: Tenant | null
  loading: boolean
  error: string | null
  list: () => Promise<Tenant[]>
  get: (tenantId: string) => Promise<Tenant>
  create: (name: string, slug: string) => Promise<Tenant>
  refresh: () => Promise<Tenant[]>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const tenant = useTenantHook()

  const value: TenantContextType = {
    tenants: tenant.tenants,
    currentTenant: tenant.currentTenant,
    loading: tenant.loading,
    error: tenant.error,
    list: tenant.list,
    get: tenant.get,
    create: tenant.create,
    refresh: tenant.refresh,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenantContext must be used within TenantProvider')
  }
  return context
}
