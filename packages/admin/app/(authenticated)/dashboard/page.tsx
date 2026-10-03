'use client'

import React from 'react'
import { useAuthContext } from '@nexora/shared'
import { Card } from '@nexora/shared'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuthContext()

  const stats = [
    { label: 'Total Users', value: '0', icon: '👥' },
    { label: 'Active Tenants', value: '0', icon: '🏢' },
    { label: 'Applications', value: '0', icon: '📱' },
    { label: 'Revenue (Monthly)', value: '$0', icon: '💰' },
  ]

  const menuItems = [
    { href: '/tenants', label: 'Manage Tenants', icon: '🏢', description: 'Create and manage tenants' },
    { href: '/applications', label: 'Applications', icon: '📱', description: 'Manage registered apps' },
    { href: '/plans', label: 'Billing Plans', icon: '💳', description: 'Manage subscription plans' },
    { href: '/settings', label: 'Settings', icon: '⚙️', description: 'Platform settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {user?.first_name}!</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity yet</p>
          </div>
        </Card>
      </main>
    </div>
  )
}
