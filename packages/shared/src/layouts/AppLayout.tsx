'use client'

import React, { useState } from 'react'
import { useAuthContext } from '../providers/AuthProvider'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  sidebarItems?: SidebarItem[]
}

interface SidebarItem {
  label: string
  href: string
  icon?: string
  active?: boolean
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title = 'Dashboard', sidebarItems = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, tenant } = useAuthContext()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-lg">Nexora</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            ☰
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`
                px-4 py-3 flex items-center gap-3 transition-colors
                ${item.active ? 'bg-blue-600' : 'hover:bg-gray-800'}
              `}
            >
              {item.icon && <span>{item.icon}</span>}
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-600">{tenant?.name}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
