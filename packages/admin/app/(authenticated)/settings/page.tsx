"use client";

import { Card, useAuthContext } from "@nexora/shared";

export default function SettingsPage() {
  const { user, tenant } = useAuthContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Signed-in account
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-gray-900">
                {[user?.first_name, user?.last_name]
                  .filter(Boolean)
                  .join(" ") || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-gray-900">
                {user?.email || "Not available"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Organization
              </dt>
              <dd className="mt-1 text-gray-900">
                {tenant?.name || "Not available"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Account status
              </dt>
              <dd className="mt-1 text-gray-900">
                {user?.status || "Not available"}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-gray-600">
            Profile and platform-wide settings can only be changed through
            backend-supported account management workflows.
          </p>
        </Card>
      </main>
    </div>
  );
}
