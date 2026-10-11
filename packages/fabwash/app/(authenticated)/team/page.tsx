"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  apiClient,
  useAuthContext,
  type TenantUsersResponse,
} from "@nexora/shared";

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: unknown } } })
      .response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return error instanceof Error
    ? error.message
    : "Could not complete the request.";
}

export default function TeamPage() {
  const { hasPermission } = useAuthContext();
  const [data, setData] = useState<TenantUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: "",
  });

  const loadUsers = useCallback(async () => {
    setError("");
    try {
      const result = await apiClient.tenantUsers.list();
      setData(result);
      setForm((current) => ({
        ...current,
        role_id:
          current.role_id ||
          result.roles.find((role) => role.name === "Member")?.id ||
          "",
      }));
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiClient.tenantUsers.create(form);
      setSuccess("User created and assigned to your tenant.");
      setForm((current) => ({
        ...current,
        first_name: "",
        last_name: "",
        email: "",
        password: "",
      }));
      await loadUsers();
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setSaving(false);
    }
  };

  const atLimit =
    data !== null && data.max_users >= 0 && data.user_count >= data.max_users;
  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link
            href="/dashboard"
            className="text-sm text-blue-700 hover:underline"
          >
            ← FabWash dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            Team & users
          </h1>
          <p className="mt-1 text-gray-600">
            Create tenant users within your subscribed plan allowance.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_1.3fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Add a user</h2>
          {data && (
            <p className="mt-2 text-sm text-gray-600">
              {data.plan_name} plan · {data.user_count} of{" "}
              {data.max_users < 0 ? "unlimited" : data.max_users} users
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
            >
              {success}
            </p>
          )}

          {!hasPermission("user:create") ? (
            <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              Your role can view the team, but only a tenant Admin can create
              users.
            </p>
          ) : atLimit ? (
            <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
              Your plan has reached its user limit. Contact the platform team to
              upgrade before adding more users.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                First name
                <input
                  className={inputClass}
                  required
                  maxLength={255}
                  value={form.first_name}
                  onChange={(event) =>
                    setForm({ ...form, first_name: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Last name
                <input
                  className={inputClass}
                  required
                  maxLength={255}
                  value={form.last_name}
                  onChange={(event) =>
                    setForm({ ...form, last_name: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  className={inputClass}
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Temporary password
                <input
                  className={inputClass}
                  required
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Role
                <select
                  className={inputClass}
                  required
                  value={form.role_id}
                  onChange={(event) =>
                    setForm({ ...form, role_id: event.target.value })
                  }
                >
                  {data?.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                type="submit"
                disabled={saving || loading || !data?.roles.length}
              >
                {saving ? "Creating user…" : "Create user"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workspace users</h2>
            <button
              onClick={() => void loadUsers()}
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <p role="status" className="mt-5 text-gray-600">
              Loading users…
            </p>
          ) : data?.users.length ? (
            <ul className="mt-5 divide-y divide-gray-200">
              {data.users.map(({ user, role_name }) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {[user.first_name, user.last_name]
                        .filter(Boolean)
                        .join(" ") || user.email}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                    {role_name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-gray-600">
              No users are available for this workspace.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
