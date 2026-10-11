"use client";

import { Badge, Card, useAuthContext } from "@nexora/shared";

export default function OrganizationPage() {
  const { tenant, loading, error } = useAuthContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization</h1>
          {tenant && (
            <Badge
              variant={
                tenant.status.toLowerCase() === "active" ? "success" : "warning"
              }
            >
              {tenant.status}
            </Badge>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}
        <Card className="p-6">
          {loading ? (
            <p role="status" className="text-gray-600">
              Loading organization details...
            </p>
          ) : tenant ? (
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Organization name
                </dt>
                <dd className="mt-1 text-gray-900">{tenant.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Workspace slug
                </dt>
                <dd className="mt-1 font-mono text-gray-900">{tenant.slug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Contact email
                </dt>
                <dd className="mt-1 text-gray-900">
                  {tenant.email || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-gray-900">
                  {tenant.phone || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(tenant.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-600">
              Organization details are not available.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
