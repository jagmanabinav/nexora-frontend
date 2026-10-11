"use client";

import React from "react";
import { useAuthContext } from "@nexora/shared";
import { Card } from "@nexora/shared";
import Link from "next/link";

export default function Dashboard() {
  const { user, tenant } = useAuthContext();

  const menuItems = [
    {
      href: "/fabric-receive",
      label: "Fabric Receiving",
      icon: "📥",
      description: "Receive and manage fabrics",
    },
    {
      href: "/dc",
      label: "Washing Operations",
      icon: "🏭",
      description: "Fabric washing and processing status",
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: "📄",
      description: "Textile service invoices",
    },
    {
      href: "/customers",
      label: "Customers",
      icon: "👥",
      description: "Manage customer accounts",
    },
    {
      href: "/reports",
      label: "Reports",
      icon: "📊",
      description: "View washing operations reports",
    },
    {
      href: "/team",
      label: "Team & Users",
      icon: "👤",
      description: "Manage plan-limited workspace users",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">🧵 FabWash Dashboard</h1>
          <p className="text-blue-100 mt-1">
            Welcome back,{" "}
            {[user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
              user?.email}
            !
          </p>
          <p className="text-blue-100 text-sm mt-1">Tenant: {tenant?.name}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

        {/* Today's Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Textile Operations
            </h2>
            <p className="text-gray-600">
              Connect the textile fabric washing APIs to view batches, washing
              progress, and quality results here.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Workspace</h2>
            <p className="text-gray-600">
              {tenant?.name || "Organization not available"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Operations counts appear when the textile-washing backend is
              available.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
