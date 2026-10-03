'use client'

import React, { useState, useEffect } from 'react'
import {
  useTenant,
  Button,
  Input,
  Card,
  Table,
  Dialog,
  Badge,
  useFormValidation,
  TenantSchema,
  type Tenant,
} from '@nexora/shared'
import { apiClient } from '@nexora/shared'

export default function TenantsPage() {
  const { tenants, loading, error, list } = useTenant()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const {
    errors: validationErrors,
    isSubmitting,
    submitError,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(TenantSchema, {
    onSubmit: async (data: unknown) => {
      const validData = data as typeof formData
      if (editingId) {
        await apiClient.tenants.update(editingId, validData)
      } else {
        await apiClient.tenants.create(validData)
      }
      setDialogOpen(false)
      setFormData({ name: '', slug: '' })
      await list()
    },
  })

  useEffect(() => {
    list()
  }, [list])

  const handleOpenDialog = (tenant?: Tenant) => {
    if (tenant) {
      setEditingId(tenant.id)
      setFormData({ name: tenant.name, slug: tenant.slug })
    } else {
      setEditingId(null)
      setFormData({ name: '', slug: '' })
    }
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(formData)
  }

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return
    try {
      await apiClient.tenants.delete(tenantId)
      await list()
    } catch (err) {
      alert('Failed to delete tenant')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: unknown) => <span className="font-medium">{String(value)}</span>,
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (value: unknown) => <code className="text-sm bg-gray-100 px-2 py-1 rounded">{String(value)}</code>,
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
      key: 'created_at',
      label: 'Created',
      render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: unknown, row: unknown) => {
        const tenant = row as Tenant
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenDialog(tenant)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(tenant.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + Create Tenant
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
          <Table
            data={tenants}
            columns={columns}
            loading={loading}
            emptyMessage="No tenants found"
          />
        </Card>
      </main>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        title={editingId ? 'Edit Tenant' : 'Create Tenant'}
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
              label="Tenant Name"
              placeholder="e.g., Acme Corp"
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
              label="Slug"
              placeholder="e.g., acme-corp"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              fullWidth
              error={validationErrors.slug}
            />
            {validationErrors.slug && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.slug}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens)</p>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
