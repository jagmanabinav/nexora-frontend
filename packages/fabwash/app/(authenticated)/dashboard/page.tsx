'use client'

import React from 'react'
import { useAuthContext } from '@nexora/shared'
import { Card, Badge } from '@nexora/shared'
import Link from 'next/link'

export default function Dashboard() {
  const { user, tenant } = useAuthContext()

  const stats = [
    { label: 'Fabric Items', value: '0', icon: '🧵' },
    { label: 'DC Queue', value: '0', icon: '🏭' },
    { label: 'Invoices', value: '0', icon: '📄' },
    { label: 'Customers', value: '0', icon: '👥' },
  ]

  const menuItems = [
    { href: '/fabric-receive', label: 'Fabric Receiving', icon: '📥', description: 'Receive and manage fabrics' },
    { href: '/dc', label: 'DC Management', icon: '🏭', description: 'Cleaning & pressing status' },
    { href: '/invoices', label: 'Invoices', icon: '📄', description: 'Generate and track invoices' },
    { href: '/customers', label: 'Customers', icon: '👥', description: 'Manage customer accounts' },
    { href: '/reports', label: 'Reports', icon: '📊', description: 'View business reports' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">🧺 FabWash Dashboard</h1>
          <p className="text-blue-100 mt-1">Welcome back, {user?.first_name}!</p>
          <p className="text-blue-100 text-sm mt-1">Tenant: {tenant?.name}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl opacity-50">{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Today&apos;s Activity</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No activity yet</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Queue Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Receiving:</span>
                <Badge variant="info">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">In DC:</span>
                <Badge variant="warning">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ready:</span>
                <Badge variant="success">0</Badge>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
