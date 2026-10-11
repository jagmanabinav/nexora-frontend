"use client";

import React from "react";
import { useAuthContext } from "@nexora/shared";
import { Card } from "@nexora/shared";
import Link from "next/link";

export default function Dashboard() {
  const { user, hasPermission } = useAuthContext();

  const menuItems = [
    ...(hasPermission("admin:tenant_application:review")
      ? [
          {
            href: "/tenant-applications",
            label: "Company registrations",
            icon: "✅",
            description: "Review pending tenant applications",
          },
        ]
      : []),
    {
      href: "/tenants",
      label: "Organization",
      icon: "🏢",
      description: "View your organization",
    },
    {
      href: "/applications",
      label: "Applications",
      icon: "📱",
      description: "Manage registered apps",
    },
    {
      href: "/plans",
      label: "Billing Plans",
      icon: "💳",
      description: "Manage subscription plans",
    },
    {
      href: "/settings",
      label: "Account",
      icon: "⚙️",
      description: "View signed-in account details",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome,{" "}
            {[user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
              user?.email}
            !
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account</h2>
          <p className="text-gray-600">
            Signed in as {user?.email || "your Nexora account"}.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Dashboard statistics and platform activity are not currently exposed
            by the backend.
          </p>
        </Card>
      </main>
    </div>
  );
}
