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
  usePagination,
  Pagination,
  useGetFabricProcesses,
  useCreateFabricProcess,
  useUpdateFabricProcess,
  useDeleteFabricProcess,
  parseApiError,
} from '@nexora/shared'
import { z } from 'zod'

// Validation schema for fabric processing logs
const FabricProcessSchema = z.object({
  batch_id: z
    .string()
    .min(1, 'Batch ID is required'),
  process_type: z
    .enum(['washing', 'drying', 'pressing', 'finishing', 'quality_check'])
    .default('washing'),
  operator_name: z
    .string()
    .min(1, 'Operator name is required'),
  duration_hours: z
    .number()
    .min(0.25, 'Duration must be at least 15 minutes')
    .positive('Duration must be positive'),
  temperature_celsius: z
    .number()
    .min(20, 'Temperature cannot be below 20°C')
    .max(95, 'Temperature cannot exceed 95°C')
    .optional(),
  quality_check_status: z
    .enum(['passed', 'pending', 'failed'])
    .default('pending'),
  defects_noted: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
  chemical_used: z
    .string()
    .max(200, 'Chemical description too long')
    .optional(),
})

type FabricProcessFormData = z.infer<typeof FabricProcessSchema>

interface FabricProcess extends FabricProcessFormData {
  id: string
  started_at: string
  completed_at: string
  status: 'in_progress' | 'completed'
}

export default function DCManagementPage() {
  const [processes, setProcesses] = useState<FabricProcess[]>([])
  const [pageError, setPageError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FabricProcessFormData>({
    batch_id: '',
    process_type: 'washing',
    operator_name: '',
    duration_hours: 2,
    temperature_celsius: 60,
    quality_check_status: 'pending',
    defects_noted: '',
    chemical_used: '',
  })

  // API hooks
  const { data: fetchedProcesses, loading, error: fetchError, fetch: fetchProcesses } = useGetFabricProcesses()
  const { create: createProcess, error: _createError } = useCreateFabricProcess()
  const { update: updateProcess, error: _updateError } = useUpdateFabricProcess()
  const { delete: deleteProcess, error: _deleteError } = useDeleteFabricProcess()

  // Pagination
  const filteredProcesses = useMemo(() => {
    return processes.filter((proc) => {
      const matchesSearch =
        proc.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.operator_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || proc.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [processes, searchTerm, filterStatus])

  const {
    page,
    pageSize,
    paginatedItems: displayedProcesses,
    totalPages,
    hasNextPage,
    hasPrevPage,
    total,
    startIndex,
    endIndex,
    goToPage,
    setSize,
  } = usePagination(filteredProcesses, { defaultPageSize: 10 })

  // Load processes on mount
  const loadProcesses = async () => {
    try {
      await fetchProcesses()
      setPageError('')
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }

  useEffect(() => {
    loadProcesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update processes when fetched data changes
  useEffect(() => {
    if (fetchedProcesses.length > 0) {
      setProcesses(fetchedProcesses)
    }
  }, [fetchedProcesses])

  const {
    errors: validationErrors,
    isSubmitting,
    submitError,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(FabricProcessSchema, {
    onSubmit: async (data: unknown) => {
      const processData = data as FabricProcessFormData
      try {
        if (editingId) {
          // Update existing process
          const updated = await updateProcess(editingId, processData)
          setProcesses(processes.map((p) => (p.id === editingId ? { ...p, ...updated } : p)))
        } else {
          // Create new process
          const created = await createProcess(processData)
          setProcesses([...processes, created])
        }
        setDialogOpen(false)
        setFormData({
          batch_id: '',
          process_type: 'washing',
          operator_name: '',
          duration_hours: 2,
          temperature_celsius: 60,
          quality_check_status: 'pending',
          defects_noted: '',
          chemical_used: '',
        })
      } catch (err) {
        setSubmitError(parseApiError(err).message)
      }
    },
  })

  const handleOpenDialog = (process?: FabricProcess) => {
    if (process) {
      setEditingId(process.id)
      setFormData({
        batch_id: process.batch_id,
        process_type: process.process_type,
        operator_name: process.operator_name,
        duration_hours: process.duration_hours,
        temperature_celsius: process.temperature_celsius,
        quality_check_status: process.quality_check_status,
        defects_noted: process.defects_noted,
        chemical_used: process.chemical_used,
      })
    } else {
      setEditingId(null)
      setFormData({
        batch_id: '',
        process_type: 'washing',
        operator_name: '',
        duration_hours: 2,
        temperature_celsius: 60,
        quality_check_status: 'pending',
        defects_noted: '',
        chemical_used: '',
      })
    }
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(formData)
  }

  const handleDelete = async (processId: string) => {
    if (!confirm('Are you sure you want to delete this process log?')) return
    try {
      await deleteProcess(processId)
      setProcesses(processes.filter((p) => p.id !== processId))
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }

  const processTypeLabels: Record<string, string> = {
    washing: '🧼 Washing',
    drying: '💨 Drying',
    pressing: '🔥 Pressing',
    finishing: '✨ Finishing',
    quality_check: '✅ Quality Check',
  }

  const columns = [
    {
      key: 'batch_id',
      label: 'Batch ID',
      render: (value: unknown) => <span className="font-mono font-medium">{String(value)}</span>,
    },
    {
      key: 'process_type',
      label: 'Process',
      render: (value: unknown) => <span>{processTypeLabels[String(value)] || String(value)}</span>,
    },
    {
      key: 'operator_name',
      label: 'Operator',
      render: (value: unknown) => <span>{String(value)}</span>,
    },
    {
      key: 'temperature_celsius',
      label: 'Temperature',
      render: (value: unknown) => (
        <span>{value ? `${value}°C` : 'N/A'}</span>
      ),
    },
    {
      key: 'duration_hours',
      label: 'Duration',
      render: (value: unknown) => <span>{Number(value).toFixed(1)}h</span>,
    },
    {
      key: 'quality_check_status',
      label: 'QC Status',
      render: (value: unknown) => {
        const status = String(value)
        const colors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          passed: 'success',
          pending: 'warning',
          failed: 'danger',
        }
        return <Badge variant={colors[status] || 'info'}>{status}</Badge>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => <Badge variant="info">{String(value)}</Badge>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: unknown, row: unknown) => {
        const process = row as FabricProcess
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenDialog(process)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(process.id)}
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DC Management</h1>
            <p className="text-sm text-gray-600 mt-1">Track fabric processing operations</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + Log Process
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {pageError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {pageError}
          </div>
        )}
        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {fetchError}
          </div>
        )}

        <Card className="p-6">
          {/* Filters */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Search by batch ID or operator..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                goToPage(1)
              }}
              fullWidth
            />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as 'all' | 'in_progress' | 'completed')
                goToPage(1)
              }}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Table */}
          <Table
            data={displayedProcesses}
            columns={columns}
            loading={loading}
            emptyMessage={
              searchTerm || filterStatus !== 'all'
                ? 'No processes match your filters'
                : 'No processing logs yet'
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
        title={editingId ? 'Edit Process Log' : 'Log Fabric Processing'}
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
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Log'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Process Type</label>
            <select
              value={formData.process_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  process_type: e.target.value as 'washing' | 'drying' | 'pressing' | 'finishing' | 'quality_check',
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="washing">Washing</option>
              <option value="drying">Drying</option>
              <option value="pressing">Pressing</option>
              <option value="finishing">Finishing</option>
              <option value="quality_check">Quality Check</option>
            </select>
          </div>

          <div>
            <Input
              label="Operator Name"
              placeholder="Operator name"
              value={formData.operator_name}
              onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
              required
              fullWidth
              error={validationErrors.operator_name}
            />
            {validationErrors.operator_name && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.operator_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Duration (hours)"
                type="number"
                step="0.25"
                min="0.25"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                required
                fullWidth
                error={validationErrors.duration_hours}
              />
              {validationErrors.duration_hours && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.duration_hours}</p>
              )}
            </div>

            <div>
              <Input
                label="Temperature (°C)"
                type="number"
                min="20"
                max="95"
                value={formData.temperature_celsius || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature_celsius: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                fullWidth
                error={validationErrors.temperature_celsius}
              />
              {validationErrors.temperature_celsius && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.temperature_celsius}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Check Status
            </label>
            <select
              value={formData.quality_check_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quality_check_status: e.target.value as 'passed' | 'pending' | 'failed',
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="passed">Passed ✅</option>
              <option value="pending">Pending ⏳</option>
              <option value="failed">Failed ❌</option>
            </select>
          </div>

          <div>
            <Input
              label="Chemical/Detergent Used"
              placeholder="e.g., Industrial detergent solution"
              value={formData.chemical_used || ''}
              onChange={(e) => setFormData({ ...formData, chemical_used: e.target.value })}
              fullWidth
              error={validationErrors.chemical_used}
            />
            {validationErrors.chemical_used && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.chemical_used}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Defects/Issues Noted</label>
            <textarea
              placeholder="Any defects or issues found during processing"
              value={formData.defects_noted || ''}
              onChange={(e) => setFormData({ ...formData, defects_noted: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {validationErrors.defects_noted && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.defects_noted}</p>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  )
}
