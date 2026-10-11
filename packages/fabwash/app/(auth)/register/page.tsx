"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiClient, type BillingPlan } from "@nexora/shared";

function apiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } })
      .response;
    if (typeof response?.data?.detail === "string") return response.data.detail;
  }
  return error instanceof Error
    ? error.message
    : "Registration could not be submitted.";
}

export default function RegisterCompanyPage() {
  const application = "fabwash";
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "/");
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [form, setForm] = useState({
    company_slug: "",
    owner_email: "",
    owner_password: "",
    plan_id: "",
    billing_cycle: "monthly" as "monthly" | "annual" | "lifetime",
  });

  useEffect(() => {
    let active = true;
    apiClient.billing.plans
      .list(application)
      .then((result) => {
        if (active) {
          const params = new URLSearchParams(window.location.search);
          const requestedPlanId = params.get("plan");
          const selectedPlanId =
            requestedPlanId &&
            result.some(
              (plan) => plan.id === requestedPlanId && plan.is_active,
            )
              ? requestedPlanId
              : "";

          setPlans(result);
          const selectedPlan = result.find(
            (plan) => plan.id === selectedPlanId,
          );
          const billingCycle =
            selectedPlan &&
            selectedPlan.monthly_price === 0 &&
            selectedPlan.annual_price === 0 &&
            selectedPlan.setup_fee > 0
              ? "lifetime"
              : "monthly";

          setForm((current) => ({
            ...current,
            plan_id:
              current.plan_id || selectedPlanId || result[0]?.id || "",
            billing_cycle: current.plan_id
              ? current.billing_cycle
              : billingCycle,
          }));
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(apiErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoadingPlans(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === form.plan_id),
    [form.plan_id, plans],
  );

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateCompanyName = (value: string) => {
    setCompanyName(value);
    updateField(
      "company_slug",
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  const updatePlan = (planId: string) => {
    const plan = plans.find((item) => item.id === planId);
    const lifetime =
      plan?.monthly_price === 0 &&
      plan.annual_price === 0 &&
      plan.setup_fee > 0;
    setForm((current) => ({
      ...current,
      plan_id: planId,
      billing_cycle: lifetime ? "lifetime" : "monthly",
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiClient.tenantApplications.register({
        application_code: "fabwash",
        company_name: companyName.trim(),
        ...form,
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (application !== "fabwash") {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-2xl font-bold">Application unavailable</h1>
        <p className="mt-3 text-gray-600">
          Select an application currently available for registration.
        </p>
        <Link className="mt-5 inline-block text-blue-700 underline" href="/">
          Back to application selection
        </Link>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
          <h1 className="text-2xl font-bold text-green-950">
            Registration submitted
          </h1>
          <p className="mt-3 text-green-900">
            Your company and selected {selectedPlan?.name || "plan"} have been
            sent for review. The account owner can sign in after a Super Admin
            approves the request.
          </p>
          <Link
            className="mt-6 inline-block rounded-lg bg-green-800 px-5 py-3 font-semibold text-white"
            href="/login"
          >
            Return to tenant login
          </Link>
        </div>
      </main>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href={adminUrl}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Choose an application
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-950">
          Register your company for FabWash
        </h1>
        <p className="mt-2 text-gray-600">
          Choose a plan and create the company owner account. Sign-in remains
          disabled until a Super Admin approves this registration.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={submit}
          className="mt-7 space-y-7 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Company details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Company name
                <input
                  className={inputClass}
                  required
                  minLength={2}
                  maxLength={255}
                  value={companyName}
                  onChange={(event) => updateCompanyName(event.target.value)}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              You can add your company contact details after signing in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Account owner
            </h2>
            <div className="mt-4 grid gap-4">
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Owner sign-in email
                <input
                  className={inputClass}
                  required
                  type="email"
                  autoComplete="email"
                  value={form.owner_email}
                  onChange={(event) =>
                    updateField("owner_email", event.target.value)
                  }
                />
              </label>
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Password
                <input
                  className={inputClass}
                  required
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={form.owner_password}
                  onChange={(event) =>
                    updateField("owner_password", event.target.value)
                  }
                />
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  Use at least 8 characters, including uppercase, lowercase, and
                  a number.
                </span>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Plan</h2>
            {loadingPlans ? (
              <p className="mt-3 text-sm text-gray-600">
                Loading available plans…
              </p>
            ) : plans.length === 0 ? (
              <p className="mt-3 text-sm text-amber-800">
                There are no active plans to register with. Please contact the
                platform team.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Available plan
                  <select
                    className={inputClass}
                    required
                    value={form.plan_id}
                    onChange={(event) => updatePlan(event.target.value)}
                  >
                    {plans
                      .filter((plan) => plan.is_active)
                      .map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                  </select>
                </label>
                {selectedPlan && (
                  <p className="text-sm text-gray-600 sm:col-span-2">
                    {selectedPlan.description || selectedPlan.tier} ·{" "}
                    {selectedPlan.max_users < 0
                      ? "Unlimited users"
                      : `Up to ${selectedPlan.max_users} users`}{" "}
                    ·{" "}
                    {form.billing_cycle === "lifetime"
                      ? `₹${selectedPlan.setup_fee.toLocaleString("en-IN")} one-time`
                      : selectedPlan.tier === "free"
                        ? "Free for one month"
                        : `₹${selectedPlan.monthly_price.toLocaleString("en-IN")} per month`}
                  </p>
                )}
              </div>
            )}
          </section>

          <button
            className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={submitting || loadingPlans || plans.length === 0}
          >
            {submitting ? "Submitting registration…" : "Submit for approval"}
          </button>
        </form>
      </div>
    </main>
  );
}
