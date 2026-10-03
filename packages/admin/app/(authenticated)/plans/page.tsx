'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
} from '@nexora/shared'
import { apiClient } from '@nexora/shared'

export default function PlansPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BillingPlanFormData>({
    name: '',
    description: '',
    price: 0,
    billing_period: 'monthly',
    features: [],
    is_active: true,
  })

  // Pagination
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [plans, searchTerm])

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
  } = usePagination(filteredPlans, { defaultPageSize: 10 })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const data = await apiClient.billing.plans.list()
      setPlans(data)
    } catch (err) {
      setError('Failed to load billing plans')
    } finally {
      setLoading(false)
    }
  }

  const {
    errors: validationErrors,
    isSubmitting,
    submitError,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(BillingPlanSchema, {
    onSubmit: async (data: unknown) => {
      const planData = data as BillingPlanFormData
      if (editingId) {
        await apiClient.billing.plans.update(editingId, planData)
      } else {
        await apiClient.billing.plans.create(planData)
      }
      setDialogOpen(false)
      setFormData({
        name: '',
        description: '',
        price: 0,
        billing_period: 'monthly',
        features: [],
        is_active: true,
      })
      await loadPlans()
    },
  })

  const handleOpenDialog = (plan?: BillingPlan) => {
    if (plan) {
      setEditingId(plan.id)
      // Convert features from Record<string, boolean> to string[] (keys where value is true)
      const featuresList = Object.entries(plan.features || {})
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        billing_period: plan.billing_period as 'monthly' | 'yearly' | 'quarterly',
        features: featuresList,
        is_active: plan.is_active,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        billing_period: 'monthly',
        features: [],
        is_active: true,
      })
    }
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(formData)
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this billing plan?')) return
    try {
      await apiClient.billing.plans.delete(planId)
      await loadPlans()
    } catch (err) {
      alert('Failed to delete billing plan')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Plan Name',
      render: (value: unknown) => <span className="font-medium">{String(value)}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (_: unknown, row: unknown) => {
        const plan = row as BillingPlan
        return <span>${plan.price.toFixed(2)} / {plan.billing_period}</span>
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: unknown) => (
        <span className="text-sm text-gray-600">{value ? String(value) : '-'}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: unknown) => (
        <Badge variant={value ? 'success' : 'warning'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: unknown, row: unknown) => {
        const plan = row as BillingPlan
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenDialog(plan)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(plan.id)}
            >
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Billing Plans</h1>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + Create Plan
          </Button>
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
          <div className="mb-6">
            <Input
              placeholder="Search plans by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                goToPage(1)
              }}
              fullWidth
            />
          </div>

          {/* Table */}
          <Table
            data={displayedPlans}
            columns={columns}
            loading={loading}
            emptyMessage={searchTerm ? 'No plans match your search' : 'No billing plans found'}
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
        title={editingId ? 'Edit Billing Plan' : 'Create Billing Plan'}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
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
            <Input
              label="Plan Name"
              placeholder="e.g., Professional"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              error={validationErrors.name}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              placeholder="99.99"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              fullWidth
              error={validationErrors.price}
            />
            {validationErrors.price && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Period
            </label>
            <select
              value={formData.billing_period}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  billing_period: e.target.value as 'monthly' | 'yearly' | 'quarterly',
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            {validationErrors.billing_period && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.billing_period}</p>
            )}
          </div>

          <div>
            <Input
              label="Description"
              placeholder="Plan description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              error={validationErrors.description}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.description}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Active Plan
            </label>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
