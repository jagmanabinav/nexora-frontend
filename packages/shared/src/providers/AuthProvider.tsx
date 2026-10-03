'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthHook } from '../hooks/useAuth'
import type { User, Tenant, Role } from '../types'

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  roles: Role[]
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    tenantName: string,
    tenantSlug: string
  ) => Promise<unknown>
  login: (email: string, password: string) => Promise<unknown>
  logout: () => Promise<void>
  hasRole: (roleName: string) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthHook()

  const value: AuthContextType = {
    user: auth.user,
    tenant: auth.tenant,
    roles: auth.roles,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    register: auth.register,
    login: auth.login,
    logout: auth.logout,
    hasRole: auth.hasRole,
    hasPermission: auth.hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
