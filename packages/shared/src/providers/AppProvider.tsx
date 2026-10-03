'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'

interface AppContextType {
  appName: string
  appId: string
  setAppName: (name: string) => void
  setAppId: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
  initialAppName?: string
  initialAppId?: string
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialAppName = process.env.NEXT_PUBLIC_APP_NAME || 'App',
  initialAppId = process.env.NEXT_PUBLIC_APP_ID || 'app',
}) => {
  const [appName, setAppName] = useState(initialAppName)
  const [appId, setAppId] = useState(initialAppId)

  const value: AppContextType = {
    appName,
    appId,
    setAppName,
    setAppId,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
