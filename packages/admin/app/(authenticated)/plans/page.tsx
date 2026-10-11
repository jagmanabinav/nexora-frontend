"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Card,
  Table,
  Dialog,
  Badge,
  useFormValidation,
  BillingPlanSchema,
  usePagination,
  Pagination,
  type BillingPlan,
  type BillingPlanFormData,
  useAuthContext,
} from "@nexora/shared";
import { apiClient } from "@nexora/shared";

const emptyPlanForm: BillingPlanFormData = {
  name: "",
  slug: "",
  application_code: "fabwash",
  tier: "starter",
  description: "",
  monthly_price: 0,
  annual_price: 0,
  setup_fee: 0,
  max_users: -1,
  max_api_keys: -1,
  max_applications: -1,
  storage_gb: -1,
  api_requests_per_month: -1,
  support_level: "community",
  sso_enabled: false,
  advanced_analytics: false,
  webhook_support: false,
  custom_domain: false,
  api_access: false,
  is_active: true,
  is_default: false,
  display_order: 0,
};

export default function PlansPage() {
  const { hasPermission } = useAuthContext();
  const canCreate = hasPermission("admin:plan:create");
  const canUpdate = hasPermission("admin:plan:update");
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<BillingPlanFormData>(emptyPlanForm);

  // Pagination
  const filteredPlans = useMemo(() => {
    return plans.filter(
      (plan) =>
        (applicationFilter === "all" ||
          plan.application_code === applicationFilter) &&
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [applicationFilter, plans, searchTerm]);

  const applicationCodes = useMemo(
    () =>
      Array.from(
        new Set([
          "fabwash",
          "nexora",
          ...plans.map((plan) => plan.application_code),
        ]),
      ),
    [plans],
  );

  const applicationLabel = (code: string) =>
    code === "fabwash"
      ? "FabWash"
      : code === "nexora"
        ? "Nexora"
        : code
            .split(/[-_]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

  const {
    page,
    pageSize,
    paginatedItems: displayedPlans,
    totalPages,
    hasNextPage,
    hasPrevPage,
    total,
    startIndex,
    endIndex,
    goToPage,
    setSize,
  } = usePagination(filteredPlans, { defaultPageSize: 10 });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await apiClient.billing.plans.list();
      setPlans(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load billing plans",
      );
    } finally {
      setLoading(false);
    }
  };

  const {
    errors: validationErrors,
    isSubmitting,
    submitError,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(BillingPlanSchema, {
    onSubmit: async (data: unknown) => {
      const planData = data as BillingPlanFormData;
      if (editingId) {
        if (!canUpdate)
          throw new Error("You do not have permission to update billing plans");
        await apiClient.billing.plans.update(editingId, planData);
      } else {
        if (!canCreate)
          throw new Error("You do not have permission to create billing plans");
        await apiClient.billing.plans.create(planData);
      }
      setDialogOpen(false);
      setFormData(emptyPlanForm);
      await loadPlans();
    },
  });

  const handleOpenDialog = (plan?: BillingPlan) => {
    if (plan) {
      setEditingId(plan.id);
      setFormData({
        name: plan.name,
        slug: plan.slug,
        application_code: plan.application_code,
        tier: plan.tier,
        description: plan.description || "",
        monthly_price: plan.monthly_price,
        annual_price: plan.annual_price,
        setup_fee: plan.setup_fee,
        max_users: plan.max_users,
        max_api_keys: plan.max_api_keys,
        max_applications: plan.max_applications,
        storage_gb: plan.storage_gb,
        api_requests_per_month: plan.api_requests_per_month,
        support_level: plan.support_level,
        sso_enabled: plan.sso_enabled,
        advanced_analytics: plan.advanced_analytics,
        webhook_support: plan.webhook_support,
        custom_domain: plan.custom_domain,
        api_access: plan.api_access,
        is_active: plan.is_active,
        is_default: plan.is_default,
        display_order: plan.display_order,
      });
    } else {
      setEditingId(null);
      setFormData(emptyPlanForm);
    }
    setSubmitError("");
    setDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  const columns = [
    {
      key: "name",
      label: "Plan Name",
      render: (value: unknown) => (
        <span className="font-medium">{String(value)}</span>
      ),
    },
    {
      key: "application_code",
      label: "Application",
      render: (value: unknown) => (
        <span>{applicationLabel(String(value))}</span>
      ),
    },
    {
      key: "monthly_price",
      label: "Pricing (INR)",
      render: (_: unknown, row: unknown) => {
        const plan = row as BillingPlan;
        if (
          plan.setup_fee > 0 &&
          plan.monthly_price === 0 &&
          plan.annual_price === 0
        ) {
          return <span>₹{plan.setup_fee.toLocaleString("en-IN")} one-time</span>;
        }
        if (plan.monthly_price > 0 && plan.annual_price === 0) {
          return (
            <span>
              ₹{plan.monthly_price.toLocaleString("en-IN")} / month · Annual
              not offered
            </span>
          );
        }
        return (
          <span>
            ₹{plan.monthly_price.toLocaleString("en-IN")} / month · ₹
            {plan.annual_price.toLocaleString("en-IN")} / year
          </span>
        );
      },
    },
    {
      key: "tier",
      label: "Tier",
      render: (value: unknown) => (
        <span className="capitalize">{String(value)}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: unknown) => (
        <span className="text-sm text-gray-600">
          {value ? String(value) : "-"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value: unknown) => (
        <Badge variant={value ? "success" : "warning"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: unknown) => {
        const plan = row as BillingPlan;
        return canUpdate ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenDialog(plan)}
          >
            Edit
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Application Billing Plans
          </h1>
          {canCreate && (
            <Button variant="primary" onClick={() => handleOpenDialog()}>
              + Create Plan
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        <Card className="p-6">
          {/* Search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <select
              aria-label="Filter plans by application"
              value={applicationFilter}
              onChange={(event) => {
                setApplicationFilter(event.target.value);
                goToPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="all">All applications</option>
              {applicationCodes.map((code) => (
                <option key={code} value={code}>
                  {applicationLabel(code)}
                </option>
              ))}
            </select>
            <Input
              placeholder="Search plans by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                goToPage(1);
              }}
              fullWidth
            />
          </div>

          {/* Table */}
          <Table
            data={displayedPlans}
            columns={columns}
            loading={loading}
            emptyMessage={
              searchTerm
                ? "No plans match your search"
                : "No billing plans found"
            }
          />

          {/* Pagination */}
          {total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              total={total}
              pageSize={pageSize}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={goToPage}
              onPageSizeChange={setSize}
              pageSizeOptions={[10, 25, 50]}
            />
          )}
        </Card>
      </main>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        title={editingId ? "Edit Billing Plan" : "Create Billing Plan"}
        onClose={() => setDialogOpen(false)}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleFormSubmit}
              disabled={isSubmitting || (editingId ? !canUpdate : !canCreate)}
            >
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application
            </label>
            <select
              value={formData.application_code}
              onChange={(e) =>
                setFormData({ ...formData, application_code: e.target.value })
              }
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {applicationCodes.map((code) => (
                <option key={code} value={code}>
                  {applicationLabel(code)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Plan Name"
              placeholder="e.g., Professional"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
              error={validationErrors.name}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Plan Slug"
              placeholder="e.g., professional"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase() })
              }
              required
              fullWidth
              disabled={Boolean(editingId)}
              error={validationErrors.slug}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tier
            </label>
            <select
              value={formData.tier}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tier: e.target.value as BillingPlanFormData["tier"],
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <Input
              label="Description"
              placeholder="Plan description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              error={validationErrors.description}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly price (INR)"
              type="number"
              step="0.01"
              min="0"
              value={formData.monthly_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthly_price: Number(e.target.value),
                })
              }
              required
              fullWidth
              error={validationErrors.monthly_price}
            />
            <Input
              label="Annual price (INR)"
              type="number"
              step="0.01"
              min="0"
              value={formData.annual_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  annual_price: Number(e.target.value),
                })
              }
              required
              fullWidth
              error={validationErrors.annual_price}
            />
          </div>

          <Input
            label="One-time / lifetime price (INR)"
            type="number"
            step="0.01"
            min="0"
            value={formData.setup_fee}
            onChange={(e) =>
              setFormData({ ...formData, setup_fee: Number(e.target.value) })
            }
            required
            fullWidth
            error={validationErrors.setup_fee}
          />

          <h3 className="border-t pt-4 text-sm font-semibold text-gray-900">
            Plan limits (-1 means unlimited)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                ["max_users", "Maximum users"],
                ["max_api_keys", "Maximum API keys"],
                ["max_applications", "Maximum applications"],
                ["storage_gb", "Storage (GB)"],
                ["api_requests_per_month", "API requests per month"],
              ] as const
            ).map(([field, label]) => (
              <Input
                key={field}
                label={label}
                type="number"
                min="-1"
                step="1"
                value={formData[field]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [field]: Number(e.target.value),
                  })
                }
                required
                fullWidth
                error={validationErrors[field]}
              />
            ))}
            <Input
              label="Support level"
              value={formData.support_level}
              onChange={(e) =>
                setFormData({ ...formData, support_level: e.target.value })
              }
              required
              fullWidth
              error={validationErrors.support_level}
            />
          </div>

          <h3 className="border-t pt-4 text-sm font-semibold text-gray-900">
            Included features
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                ["api_access", "API access"],
                ["sso_enabled", "Single sign-on (SSO)"],
                ["advanced_analytics", "Advanced analytics"],
                ["webhook_support", "Webhooks"],
                ["custom_domain", "Custom domain"],
              ] as const
            ).map(([field, label]) => (
              <label
                key={field}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={formData[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Display order"
              type="number"
              min="0"
              step="1"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: Number(e.target.value),
                })
              }
              required
              fullWidth
              error={validationErrors.display_order}
            />
            <div className="flex flex-col gap-3">
              {(
                [
                  ["is_active", "Active plan"],
                  ["is_default", "Default / recommended plan"],
                ] as const
              ).map(([field, label]) => (
                <label
                  key={field}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={formData[field]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field]: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
