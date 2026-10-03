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
  ApplicationSchema,
  usePagination,
  Pagination,
  type Application,
  type ApplicationFormData,
} from '@nexora/shared'
import { apiClient } from '@nexora/shared'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    description: '',
    app_id: '',
  })

  // Pagination
  const filteredApps = useMemo(() => {
    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.app_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [applications, searchTerm])

  const {
    page,
    pageSize,
    paginatedItems: displayedApps,
    totalPages,
    hasNextPage,
    hasPrevPage,
    total,
    startIndex,
    endIndex,
    goToPage,
    setSize,
  } = usePagination(filteredApps, { defaultPageSize: 10 })

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const data = await apiClient.applications.list()
      setApplications(data)
    } catch (err) {
      setError('Failed to load applications')
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
  } = useFormValidation(ApplicationSchema, {
    onSubmit: async (data: unknown) => {
      const appData = data as ApplicationFormData
      if (editingId) {
        await apiClient.applications.update(editingId, appData)
      } else {
        await apiClient.applications.create(appData)
      }
      setDialogOpen(false)
      setFormData({ name: '', description: '', app_id: '' })
      await loadApplications()
    },
  })

  const handleOpenDialog = (app?: Application) => {
    if (app) {
      setEditingId(app.id)
      setFormData({
        name: app.name,
        description: app.description || '',
        app_id: app.app_id,
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', description: '', app_id: '' })
    }
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(formData)
  }

  const handleDelete = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
      await apiClient.applications.delete(appId)
      await loadApplications()
    } catch (err) {
      alert('Failed to delete application')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: unknown) => <span className="font-medium">{String(value)}</span>,
    },
    {
      key: 'app_id',
      label: 'App ID',
      render: (value: unknown) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{String(value)}</code>
      ),
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
        const app = row as Application
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenDialog(app)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(app.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + Create Application
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
              placeholder="Search applications by name or app ID..."
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
            data={displayedApps}
            columns={columns}
            loading={loading}
            emptyMessage={searchTerm ? 'No applications match your search' : 'No applications found'}
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
        title={editingId ? 'Edit Application' : 'Create Application'}
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
              label="Application Name"
              placeholder="e.g., FabWash"
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
              label="App ID"
              placeholder="e.g., fabwash_v2"
              value={formData.app_id}
              onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
              required
              fullWidth
              error={validationErrors.app_id}
            />
            {validationErrors.app_id && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.app_id}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Lowercase letters, numbers, hyphens, and underscores only
            </p>
          </div>

          <div>
            <Input
              label="Description"
              placeholder="What does this application do?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              error={validationErrors.description}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.description}</p>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  )
}
