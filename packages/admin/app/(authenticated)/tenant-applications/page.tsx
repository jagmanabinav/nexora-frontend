"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, type TenantApplication } from "@nexora/shared";

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: unknown } } })
      .response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return error instanceof Error
    ? error.message
    : "Could not load registrations.";
}

export default function TenantApplicationsPage() {
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setError("");
    try {
      setApplications(await apiClient.tenantApplications.list("pending"));
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const decide = async (application: TenantApplication, approve: boolean) => {
    setBusyId(application.id);
    setError("");
    try {
      if (approve) {
        await apiClient.tenantApplications.approve(application.id);
      } else {
        await apiClient.tenantApplications.reject(
          application.id,
          "Registration was not approved by the platform administrator.",
        );
      }
      await loadApplications();
    } catch (decisionError) {
      setError(errorMessage(decisionError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-blue-700 hover:underline"
            >
              ← Admin dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-950">
              Company registrations
            </h1>
            <p className="mt-1 text-gray-600">
              Review product and plan requests before enabling company access.
            </p>
          </div>
          <button
            onClick={() => void loadApplications()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            {error}
          </p>
        )}
        {loading ? (
          <p role="status" className="text-gray-600">
            Loading company registrations…
          </p>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
            There are no pending registrations.
          </div>
        ) : (
          applications.map((application) => (
            <article
              key={application.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-950">
                      {application.company_name}
                    </h2>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      Pending
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-sm text-gray-500">
                    {application.company_slug}
                  </p>
                  <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase text-gray-500">
                        Product
                      </dt>
                      <dd className="mt-1 font-medium">
                        FabWash — textile fabric washing
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-500">
                        Owner account
                      </dt>
                      <dd className="mt-1">
                        {application.owner_first_name}{" "}
                        {application.owner_last_name} ·{" "}
                        {application.owner_email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-500">
                        Company contact
                      </dt>
                      <dd className="mt-1">
                        {application.company_email}
                        {application.company_phone
                          ? ` · ${application.company_phone}`
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-500">
                        Requested plan
                      </dt>
                      <dd className="mt-1 font-medium">
                        {application.plan_name} · {application.billing_cycle}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-500">
                        User allowance
                      </dt>
                      <dd className="mt-1">
                        {application.plan_max_users < 0
                          ? "Unlimited"
                          : `${application.plan_max_users} users`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-500">
                        Submitted
                      </dt>
                      <dd className="mt-1">
                        {new Date(application.submitted_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex shrink-0 items-start gap-3">
                  <button
                    disabled={busyId === application.id}
                    onClick={() => void decide(application, false)}
                    className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={busyId === application.id}
                    onClick={() => void decide(application, true)}
                    className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    {busyId === application.id
                      ? "Saving…"
                      : "Approve & activate plan"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
