"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type BillingPlan } from "@nexora/shared";

function planLimit(value: number, unit: string) {
  if (value < 0) return "Unlimited";
  const singularUnit: Record<string, string> = {
    users: "user",
    apps: "app",
    keys: "key",
  };
  return `${value.toLocaleString()} ${value === 1 ? singularUnit[unit] || unit : unit}`;
}

function supportLabel(level: string) {
  return level
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function PlanFeature({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        aria-hidden="true"
        className={enabled ? "text-emerald-300" : "text-slate-600"}
      >
        {enabled ? "✓" : "–"}
      </span>
      <span className={enabled ? "text-slate-200" : "text-slate-500"}>
        {label}
      </span>
    </li>
  );
}

const features = [
  {
    icon: "📥",
    title: "Fabric receiving",
    description:
      "Record incoming fabric batches, suppliers, fabric types, weights, grades, and receiving status.",
  },
  {
    icon: "🏭",
    title: "Washing operations",
    description:
      "Follow processing batches, operators, wash details, and quality-check status in one view.",
  },
  {
    icon: "👥",
    title: "Customer management",
    description:
      "Keep customer contacts, service tiers, order totals, and account status close to daily work.",
  },
  {
    icon: "📄",
    title: "Invoices",
    description:
      "Review service invoices, linked batches, totals, due dates, and payment status.",
  },
  {
    icon: "📊",
    title: "Reports & analytics",
    description:
      "View production metrics and trends across weekly, monthly, and quarterly reporting periods.",
  },
  {
    icon: "🧑‍🤝‍🧑",
    title: "Team & plan limits",
    description:
      "Manage workspace users and see how your subscription plan governs team capacity.",
  },
];

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#f5f7fb] text-slate-900 shadow-2xl shadow-cyan-950/40">
      <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-white px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-[10px] font-medium text-slate-400">
          app.fabwash · Workspace
        </span>
      </div>
      <div className="grid min-h-[330px] grid-cols-[112px_1fr] sm:grid-cols-[150px_1fr]">
        <aside className="bg-[#101d36] p-3 text-white sm:p-4">
          <div className="mb-7 flex items-center gap-2 text-xs font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400 text-base text-slate-950">
              🧵
            </span>
            FabWash
          </div>
          <div className="space-y-2 text-[10px] sm:text-xs">
            {[
              ["▦", "Overview", true],
              ["⇣", "Receiving", false],
              ["⚙", "Operations", false],
              ["▤", "Invoices", false],
              ["◷", "Reports", false],
            ].map(([icon, label, active]) => (
              <div
                key={label as string}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 ${
                  active
                    ? "bg-cyan-400/15 font-semibold text-cyan-200"
                    : "text-slate-400"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-9 rounded-lg border border-white/10 p-2 text-[9px] text-slate-400 sm:p-3">
            WORKSPACE
            <p className="mt-2 truncate text-[10px] font-medium text-white">
              Your company
            </p>
          </div>
        </aside>
        <div className="p-3 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-slate-500 sm:text-xs">
                WORKSPACE OVERVIEW
              </p>
              <p className="mt-1 text-base font-bold sm:text-xl">
                Textile operations
              </p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-500 sm:text-[10px]">
              This month⌄
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ["Receiving", "Batch tracking"],
              ["Washing", "Process status"],
              ["Quality", "QC overview"],
            ].map(([label, detail], index) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 sm:text-[10px]">
                    {label}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      ["bg-cyan-500", "bg-indigo-500", "bg-emerald-500"][index]
                    }`}
                  />
                </div>
                <p className="mt-2 text-[10px] font-semibold sm:text-xs">
                  {detail}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold sm:text-xs">
                Operations at a glance
              </p>
              <span className="text-[9px] text-slate-400">Activity view</span>
            </div>
            <div className="mt-4 flex h-24 items-end gap-2 border-b border-slate-100 px-1">
              {[36, 55, 42, 72, 50, 84, 62, 92, 67, 78, 55, 88].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-600 to-cyan-300"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
            <div className="mt-2 flex justify-between text-[8px] text-slate-400">
              <span>WEEK 1</span>
              <span>WEEK 2</span>
              <span>WEEK 3</span>
              <span>WEEK 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceivingPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-xs font-bold">Fabric receiving</p>
          <p className="mt-0.5 text-[9px] text-slate-400">
            Incoming batch register
          </p>
        </div>
        <span className="rounded-md bg-cyan-50 px-2 py-1 text-[9px] font-semibold text-cyan-800">
          + New batch
        </span>
      </div>
      <div className="grid grid-cols-[1.2fr_1fr_.7fr] gap-2 bg-slate-50 px-4 py-2 text-[8px] font-semibold uppercase text-slate-400">
        <span>Batch / supplier</span>
        <span>Fabric</span>
        <span>Status</span>
      </div>
      {[
        ["FW-2048", "North Loom", "Cotton", "Received"],
        ["FW-2047", "Al Noor Textiles", "Denim", "In review"],
        ["FW-2046", "Weave House", "Linen", "Received"],
      ].map(([batch, supplier, fabric, status]) => (
        <div
          key={batch}
          className="grid grid-cols-[1.2fr_1fr_.7fr] items-center gap-2 border-t border-slate-100 px-4 py-3 text-[9px]"
        >
          <div>
            <p className="font-semibold">{batch}</p>
            <p className="mt-0.5 text-slate-400">{supplier}</p>
          </div>
          <span className="text-slate-600">{fabric}</span>
          <span
            className={`w-fit rounded-full px-2 py-1 text-[8px] font-medium ${
              status === "Received"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {status}
          </span>
        </div>
      ))}
    </div>
  );
}

function WashingPreview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold">Washing operations</p>
          <p className="mt-1 text-[9px] text-slate-400">
            Batch processing overview
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-semibold text-indigo-700">
          IN PROCESS
        </span>
      </div>
      <div className="mt-5 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-400">BATCH</p>
            <p className="mt-1 text-sm font-bold">FW-2047</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400">PROCESS</p>
            <p className="mt-1 text-[10px] font-semibold">Fabric wash</p>
          </div>
        </div>
        <div className="mt-5 flex items-center">
          {[
            ["Received", "done"],
            ["Processing", "current"],
            ["Quality check", "next"],
            ["Complete", "next"],
          ].map(([step, state], index) => (
            <div
              key={step}
              className="relative flex flex-1 flex-col items-center"
            >
              {index > 0 && (
                <div
                  className={`absolute right-1/2 top-2 h-0.5 w-full ${
                    state === "next" ? "bg-slate-200" : "bg-cyan-400"
                  }`}
                />
              )}
              <span
                className={`z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  state === "done"
                    ? "border-cyan-500 bg-cyan-500"
                    : state === "current"
                      ? "border-cyan-500 bg-white ring-2 ring-cyan-100"
                      : "border-slate-200 bg-white"
                }`}
              >
                {state === "done" && (
                  <span className="text-[8px] text-white">✓</span>
                )}
              </span>
              <span className="mt-2 text-center text-[7px] text-slate-500 sm:text-[8px]">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ["Operator", "Team member"],
          ["Temperature", "Process detail"],
          ["Quality", "Check status"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 p-2">
            <p className="text-[8px] text-slate-400">{label}</p>
            <p className="mt-1 text-[9px] font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");

  useEffect(() => {
    let active = true;

    apiClient.billing.plans
      .list("fabwash")
      .then((availablePlans) => {
        if (active) {
          setPlans(
            availablePlans
              .filter((plan) => plan.is_active)
              .sort(
                (a, b) =>
                  a.display_order - b.display_order ||
                  a.monthly_price - b.monthly_price,
              ),
          );
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setPlansError(
            error instanceof Error
              ? error.message
              : "Available plans could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingPlans(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="overflow-hidden bg-[#071426] text-white">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link className="flex items-center gap-2 text-xl font-bold" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-lg text-slate-950">
            🧵
          </span>
          FabWash
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <a
            href="#features"
            className="hidden text-sm text-slate-300 transition hover:text-white sm:inline"
          >
            Features
          </a>
          <a
            href="#plans"
            className="hidden text-sm text-slate-300 transition hover:text-white sm:inline"
          >
            Plans
          </a>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign in
          </Link>
          <Link
            href="/invoice-samples"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-white/10 sm:inline"
          >
            Sample GST invoice
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative">
        <div className="absolute -right-48 -top-20 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-48 top-48 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-medium text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Textile processing workspace
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              Every fabric batch,{" "}
              <span className="text-cyan-300">in good hands.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Bring fabric receiving, washing operations, customers, invoices,
              and reporting together in one workspace built for textile
              processing teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Register your company
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Tenant sign in
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              New accounts are reviewed before access is enabled.
            </p>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs text-slate-300">
              <span>✓ Batch-level visibility</span>
              <span>✓ Team-ready workspace</span>
              <span>✓ Plan-based user limits</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-400/15 via-blue-500/5 to-transparent blur-xl" />
            <div className="relative">
              <DashboardPreview />
              <div className="absolute -bottom-6 -left-3 hidden w-56 rounded-xl border border-white/10 bg-[#10233a] p-4 shadow-2xl sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-lg">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Quality in view</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Follow checks through the workflow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#0b1b2f] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              One connected workspace
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              The tools your textile team needs to stay in sync.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              From the first fabric receipt to the final invoice, FabWash brings
              your core workflows into one place.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-xl">
                  {feature.icon}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="scroll-mt-8 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                FabWash plans
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Choose the plan that fits your operation.
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Compare prices, capacity, and included capabilities. Your
                selected plan will be prefilled when you register.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Prices shown in Indian rupees (INR).
            </p>
          </div>

          {loadingPlans ? (
            <div
              className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-300"
              role="status"
            >
              Loading available plans…
            </div>
          ) : plansError ? (
            <div
              className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6 text-amber-100"
              role="alert"
            >
              Plans are temporarily unavailable. Please try again shortly.
              <p className="mt-2 text-sm text-amber-100/70">{plansError}</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-300">
              No plans are currently available.
            </div>
          ) : (
            <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) =>
                (() => {
                  const isLifetime =
                    plan.monthly_price === 0 &&
                    plan.annual_price === 0 &&
                    plan.setup_fee > 0;
                  const isFreeMonth =
                    plan.tier === "free" && plan.monthly_price === 0;

                  return (
                    <article
                      key={plan.id}
                      className={`flex flex-col rounded-2xl border p-6 ${
                        plan.is_default
                          ? "border-cyan-300/60 bg-cyan-300/[0.06] shadow-xl shadow-cyan-950/20"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                            {plan.tier}
                          </p>
                          <h3 className="mt-2 text-xl font-bold">
                            {plan.name}
                          </h3>
                        </div>
                        {plan.is_default && (
                          <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-3 min-h-10 text-sm leading-5 text-slate-400">
                        {plan.description ||
                          `${plan.name} for your FabWash team.`}
                      </p>

                      <div className="mt-5 border-b border-white/10 pb-5">
                        <p className="text-3xl font-bold">
                          {isFreeMonth
                            ? "Free"
                            : isLifetime
                              ? `₹${plan.setup_fee.toLocaleString("en-IN")}`
                              : `₹${plan.monthly_price.toLocaleString("en-IN")}`}
                          <span className="ml-2 text-sm font-normal text-slate-400">
                            {isFreeMonth
                              ? "for 1 month"
                              : isLifetime
                                ? "one-time"
                                : "/ month"}
                          </span>
                        </p>
                        {isLifetime && (
                          <p className="mt-2 text-xs text-slate-400">
                            One-time lifetime payment
                          </p>
                        )}
                      </div>

                      <div className="mt-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Plan limits
                        </h4>
                        <ul className="mt-3 space-y-2">
                          <li className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-400">Team members</span>
                            <span className="text-right font-medium">
                              {planLimit(plan.max_users, "users")}
                            </span>
                          </li>
                          <li className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-400">Applications</span>
                            <span className="text-right font-medium">
                              {planLimit(plan.max_applications, "apps")}
                            </span>
                          </li>
                          <li className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-400">API keys</span>
                            <span className="text-right font-medium">
                              {planLimit(plan.max_api_keys, "keys")}
                            </span>
                          </li>
                          <li className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-400">Storage</span>
                            <span className="text-right font-medium">
                              {planLimit(plan.storage_gb, "GB")}
                            </span>
                          </li>
                          <li className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-400">API requests</span>
                            <span className="text-right font-medium">
                              {planLimit(
                                plan.api_requests_per_month,
                                "per month",
                              )}
                            </span>
                          </li>
                          <li className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-400">Support</span>
                            <span className="text-right font-medium">
                              {supportLabel(plan.support_level)}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="mt-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Included capabilities
                        </h4>
                        <ul className="mt-3 space-y-2">
                          <PlanFeature
                            label="API access"
                            enabled={plan.api_access}
                          />
                          <PlanFeature
                            label="Single sign-on (SSO)"
                            enabled={plan.sso_enabled}
                          />
                          <PlanFeature
                            label="Advanced analytics"
                            enabled={plan.advanced_analytics}
                          />
                          <PlanFeature
                            label="Webhooks"
                            enabled={plan.webhook_support}
                          />
                          <PlanFeature
                            label="Custom domain"
                            enabled={plan.custom_domain}
                          />
                        </ul>
                      </div>

                      <Link
                        href={`/register?plan=${encodeURIComponent(plan.id)}&billing_cycle=${isLifetime ? "lifetime" : "monthly"}`}
                        className="mt-7 inline-flex w-full justify-center rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
                      >
                        Choose {plan.name}
                      </Link>
                    </article>
                  );
                })(),
              )}
            </div>
          )}
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Plan activation happens after Super Admin approval. Online payment
            collection is not currently integrated.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                A look inside
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Made for the rhythm of your floor.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              A preview of the FabWash workspace: see key screens for receiving
              and washing operations at a glance.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#0c1c30] p-4 sm:p-6">
              <ReceivingPreview />
              <div className="mt-5">
                <h3 className="font-semibold">Know what has arrived</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  A focused receiving view keeps batch, supplier, fabric type,
                  and status information together.
                </p>
              </div>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#0c1c30] p-4 sm:p-6">
              <WashingPreview />
              <div className="mt-5">
                <h3 className="font-semibold">
                  Follow processing through its stages
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Keep operator, process details, and quality-check status
                  visible as work moves forward.
                </p>
              </div>
            </article>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500">
            Illustrative interface previews. Workspace content depends on your
            company’s data and enabled services.
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-gradient-to-r from-cyan-400/[0.08] via-blue-400/[0.05] to-transparent">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Ready to get started?
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Set up your FabWash workspace.
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Register your company and choose a plan for review.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Register your company
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/20 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="font-semibold text-slate-300">🧵 FabWash</span>
        <span>Textile fabric operations, organized.</span>
      </footer>
    </main>
  );
}
