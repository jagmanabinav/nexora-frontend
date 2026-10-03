'use client'

import React, { useState } from 'react'
import {
  Button,
  Input,
  Card,
  Table,
  Dialog,
  Badge,
  useFormValidation,
  usePagination,
  Pagination,
  useGetFabricBatches,
  useCreateFabricBatch,
  useUpdateFabricBatch,
  useDeleteFabricBatch,
  parseApiError,
} from '@nexora/shared'
import { z } from 'zod'

// Validation schema for fabric batch intake
const FabricBatchSchema = z.object({
  batch_id: z
    .string()
    .min(1, 'Batch ID is required')
    .min(3, 'Batch ID must be at least 3 characters'),
  supplier_name: z
    .string()
    .min(1, 'Supplier name is required')
    .min(2, 'Supplier name must be at least 2 characters'),
  fabric_type: z
    .string()
    .min(1, 'Fabric type is required'),
  weight_kg: z
    .number()
    .min(1, 'Weight must be at least 1 kg')
    .positive('Weight must be positive'),
  color: z
    .string()
    .min(1, 'Color is required'),
  quality_grade: z
    .enum(['A', 'B', 'C'])
    .default('B'),
  processing_notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
})

type FabricBatchFormData = z.infer<typeof FabricBatchSchema>

interface FabricBatch extends FabricBatchFormData {
  id: string
  received_at: string
  received_by: string
  status: 'received' | 'in_queue' | 'processing' | 'completed'
}

export default function FabricReceivePage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FabricBatchFormData>({
    batch_id: '',
    supplier_name: '',
    fabric_type: '',
    weight_kg: 0,
    color: '',
    quality_grade: 'B',
    processing_notes: '',
  })

  // API Hooks - Connect to FastAPI backend
  const { data: batches, loading, error: fetchError, refetch } = useGetFabricBatches({
    page,
    limit: 10,
    search: searchTerm,
  })

  const { mutate: createBatch, loading: createLoading } = useCreateFabricBatch()
  const { mutate: updateBatch, loading: updateLoading } = useUpdateFabricBatch(editingId || '')
  const { mutate: deleteBatch } = useDeleteFabricBatch('')

  const error = fetchError
  const isSubmitting = createLoading || updateLoading

  // Local pagination for displayed results
  const {
    paginatedItems: displayedBatches,
    totalPages,
    hasNextPage,
    hasPrevPage,
    total,
    startIndex,
    endIndex,
    goToPage: _goToPage,
    setSize,
  } = usePagination(batches, { defaultPageSize: 10 })

  const {
    errors: validationErrors,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(FabricBatchSchema, {
    onSubmit: async (data: unknown) => {
      try {
        const batchData = data as FabricBatchFormData

        if (editingId) {
          // Update existing batch
          await updateBatch(batchData)
        } else {
          // Create new batch
          await createBatch(batchData)
        }

        // Success - close dialog and reset form
        setDialogOpen(false)
        setFormData({
          batch_id: '',
          supplier_name: '',
          fabric_type: '',
          weight_kg: 0,
          color: '',
          quality_grade: 'B',
          processing_notes: '',
        })

        // Refetch the list
        await refetch()
      } catch (err) {
        const parsedError = parseApiError(err)
        setSubmitError(parsedError.message)
      }
    },
  })

  const handleOpenDialog = (batch?: FabricBatch) => {
    if (batch) {
      setEditingId(batch.id)
      setFormData({
        batch_id: batch.batch_id,
        supplier_name: batch.supplier_name,
        fabric_type: batch.fabric_type,
        weight_kg: batch.weight_kg,
        color: batch.color,
        quality_grade: batch.quality_grade,
        processing_notes: batch.processing_notes,
      })
    } else {
      setEditingId(null)
      setFormData({
        batch_id: '',
        supplier_name: '',
        fabric_type: '',
        weight_kg: 0,
        color: '',
        quality_grade: 'B',
        processing_notes: '',
      })
    }
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(formData)
  }

  const handleDelete = async (_batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return

    try {
      await deleteBatch()
      await refetch()
    } catch (err) {
      const parsedError = parseApiError(err)
      alert(`Error deleting batch: ${parsedError.message}`)
    }
  }

  // Table columns
  const columns = [
    {
      key: 'batch_id',
      label: 'Batch ID',
      render: (value: unknown) => (
        <span className="font-mono font-medium text-blue-600">{String(value)}</span>
      ),
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      render: (value: unknown) => <span>{String(value)}</span>,
    },
    {
      key: 'fabric_type',
      label: 'Fabric Type',
      render: (value: unknown) => <span>{String(value)}</span>,
    },
    {
      key: 'weight_kg',
      label: 'Weight (kg)',
      render: (value: unknown) => <span className="text-right">{String(value)}</span>,
    },
    {
      key: 'quality_grade',
      label: 'Grade',
      render: (value: unknown) => (
        <Badge
          variant={
            value === 'A' ? 'success' : value === 'B' ? 'warning' : 'secondary'
          }
        >
          Grade {String(value)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <Badge
          variant={
            value === 'completed'
              ? 'success'
              : value === 'in_queue'
                ? 'warning'
                : value === 'processing'
                  ? 'info'
                  : 'secondary'
          }
        >
          {String(value).replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value: unknown, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenDialog(row as FabricBatch)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(String(value))}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fabric Receive</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage incoming fabric batches - quality grading (A/B/C) and documentation
            </p>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + Receive Batch
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error.message}
          </div>
        )}

        <Card className="p-6">
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by batch ID, supplier, or fabric type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              fullWidth
            />
          </div>

          {/* Table */}
          <Table
            data={displayedBatches}
            columns={columns}
            loading={loading}
            emptyMessage={searchTerm ? 'No batches match your search' : 'No fabric batches received yet'}
          />

          {/* Pagination */}
          {total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              total={total}
              pageSize={10}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={setSize}
              pageSizeOptions={[10, 25, 50]}
            />
          )}
        </Card>
      </main>

      {/* Dialog - Create/Edit */}
      <Dialog
        open={dialogOpen}
        title={editingId ? 'Edit Fabric Batch' : 'Receive Fabric Batch'}
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
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Receive'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <Input
              label="Batch ID"
              placeholder="e.g., FB-2024-001"
              value={formData.batch_id}
              onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
              required
              fullWidth
              error={validationErrors.batch_id}
            />
            {validationErrors.batch_id && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.batch_id}</p>
            )}
          </div>

          <div>
            <Input
              label="Supplier Name"
              placeholder="e.g., Global Textiles Ltd"
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              required
              fullWidth
              error={validationErrors.supplier_name}
            />
            {validationErrors.supplier_name && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.supplier_name}</p>
            )}
          </div>

          <div>
            <Input
              label="Fabric Type"
              placeholder="e.g., Cotton Blend"
              value={formData.fabric_type}
              onChange={(e) => setFormData({ ...formData, fabric_type: e.target.value })}
              required
              fullWidth
              error={validationErrors.fabric_type}
            />
            {validationErrors.fabric_type && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.fabric_type}</p>
            )}
          </div>

          <div>
            <Input
              label="Weight (kg)"
              type="number"
              placeholder="e.g., 500"
              value={formData.weight_kg || ''}
              onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
              required
              fullWidth
              error={validationErrors.weight_kg}
            />
            {validationErrors.weight_kg && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.weight_kg}</p>
            )}
          </div>

          <div>
            <Input
              label="Color"
              placeholder="e.g., White"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              required
              fullWidth
              error={validationErrors.color}
            />
            {validationErrors.color && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.color}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality Grade
            </label>
            <select
              value={formData.quality_grade}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quality_grade: e.target.value as 'A' | 'B' | 'C',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="A">Grade A - Premium</option>
              <option value="B">Grade B - Standard</option>
              <option value="C">Grade C - Economy</option>
            </select>
            {validationErrors.quality_grade && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.quality_grade}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Notes
            </label>
            <textarea
              placeholder="Add any processing notes or special instructions..."
              value={formData.processing_notes || ''}
              onChange={(e) => setFormData({ ...formData, processing_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
            />
            {validationErrors.processing_notes && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.processing_notes}</p>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  )
}
