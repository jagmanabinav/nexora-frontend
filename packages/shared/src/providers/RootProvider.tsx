'use client'

import React, { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { TenantProvider } from './TenantProvider'
import { AppProvider } from './AppProvider'

interface RootProviderProps {
  children: ReactNode
}

/**
 * Combines all context providers
 * Use this to wrap your entire app
 */
export const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  return (
    <AppProvider>
      <AuthProvider>
        <TenantProvider>
          {children}
        </TenantProvider>
      </AuthProvider>
    </AppProvider>
  )
}

export default RootProvider
