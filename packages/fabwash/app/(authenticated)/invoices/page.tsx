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
  useGetInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  parseApiError,
} from '@nexora/shared'
import { z } from 'zod'

// Validation schema for invoice generation
const InvoiceSchema = z.object({
  invoice_number: z
    .string()
    .regex(/^INV-\d{4}$/, 'Invoice must be in format INV-XXXX'),
  customer_id: z
    .string()
    .min(1, 'Customer is required'),
  batch_ids: z
    .string()
    .min(1, 'Batch IDs required'),
  service_amount: z
    .number()
    .min(1, 'Amount must be at least SAR 1')
    .positive('Amount must be positive'),
  tax_amount: z
    .number()
    .min(0, 'Tax cannot be negative')
    .optional(),
  due_date: z
    .string()
    .min(1, 'Due date is required'),
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
})

type InvoiceFormData = z.infer<typeof InvoiceSchema>

interface Invoice extends InvoiceFormData {
  id: string
  issued_at: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total_amount: number
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [pageError, setPageError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_number: '',
    customer_id: '',
    batch_ids: '',
    service_amount: 0,
    tax_amount: 0,
    due_date: '',
    notes: '',
  })

  // API hooks
  const { data: fetchedInvoices, loading, error: fetchError, fetch: fetchInvoices } = useGetInvoices()
  const { create: createInvoice, error: _createError } = useCreateInvoice()
  const { update: updateInvoice, error: _updateError } = useUpdateInvoice()
  const { delete: deleteInvoice, error: _deleteError } = useDeleteInvoice()

  // Pagination
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, filterStatus])

  const {
    page,
    pageSize,
    paginatedItems: displayedInvoices,
    totalPages,
    hasNextPage,
    hasPrevPage,
    total,
    startIndex,
    endIndex,
    goToPage,
    setSize,
  } = usePagination(filteredInvoices, { defaultPageSize: 10 })

  const loadInvoices = async () => {
    try {
      await fetchInvoices()
      setPageError('')
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }

  useEffect(() => {
    loadInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update invoices when fetched data changes
  useEffect(() => {
    if (fetchedInvoices.length > 0) {
      setInvoices(fetchedInvoices)
    }
  }, [fetchedInvoices])

  const {
    errors: validationErrors,
    isSubmitting,
    submitError,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(InvoiceSchema, {
    onSubmit: async (data: unknown) => {
      const invoiceData = data as InvoiceFormData
      try {
        if (editingId) {
          // Update existing invoice
          const updated = await updateInvoice(editingId, invoiceData)
          setInvoices(invoices.map((i) => (i.id === editingId ? { ...i, ...updated } : i)))
        } else {
          // Create new invoice
          const created = await createInvoice(invoiceData)
          setInvoices([...invoices, created])
        }
        setDialogOpen(false)
        setFormData({
          invoice_number: '',
          customer_id: '',
          batch_ids: '',
          service_amount: 0,
          tax_amount: 0,
          due_date: '',
          notes: '',
        })
      } catch (err) {
        setSubmitError(parseApiError(err).message)
      }
    },
  })

  const handleOpenDialog = (invoice?: Invoice) => {
    if (invoice) {
      setEditingId(invoice.id)
      setFormData({
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
        batch_ids: invoice.batch_ids,
        service_amount: invoice.service_amount,
        tax_amount: invoice.tax_amount,
        due_date: invoice.due_date,
        notes: invoice.notes,
      })
    } else {
      setEditingId(null)
      setFormData({
        invoice_number: '',
        customer_id: '',
        batch_ids: '',
        service_amount: 0,
        tax_amount: 0,
        due_date: '',
        notes: '',
      })
    }
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(formData)
  }

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      await deleteInvoice(invoiceId)
      setInvoices(invoices.filter((i) => i.id !== invoiceId))
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (value: unknown) => <span className="font-mono font-bold">{String(value)}</span>,
    },
    {
      key: 'customer_id',
      label: 'Customer ID',
      render: (value: unknown) => <span className="font-mono">{String(value)}</span>,
    },
    {
      key: 'batch_ids',
      label: 'Batch ID',
      render: (value: unknown) => <span className="font-mono">{String(value)}</span>,
    },
    {
      key: 'total_amount',
      label: 'Total (SAR)',
      render: (value: unknown) => (
        <span className="font-bold text-green-700">{Number(value).toLocaleString('ar-SA')}</span>
      ),
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value: unknown) => {
        const date = new Date(String(value))
        return <span>{date.toLocaleDateString('en-SA')}</span>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = String(value)
        const colors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          draft: 'info',
          sent: 'warning',
          paid: 'success',
          overdue: 'danger',
          cancelled: 'warning',
        }
        return <Badge variant={colors[status] || 'info'}>{status}</Badge>
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: unknown, row: unknown) => {
        const invoice = row as Invoice
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenDialog(invoice)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(invoice.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Invoicing</h1>
            <p className="text-sm text-gray-600 mt-1">Manage fabric processing invoices and payments</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + Create Invoice
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
              placeholder="Search by invoice # or customer..."
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
                setFilterStatus(e.target.value as 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled')
                goToPage(1)
              }}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Table */}
          <Table
            data={displayedInvoices}
            columns={columns}
            loading={loading}
            emptyMessage={
              searchTerm || filterStatus !== 'all'
                ? 'No invoices match your filters'
                : 'No invoices created yet'
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
        title={editingId ? 'Edit Invoice' : 'Create Invoice'}
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
              label="Invoice Number"
              placeholder="INV-0001"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              required
              fullWidth
              error={validationErrors.invoice_number}
            />
            {validationErrors.invoice_number && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.invoice_number}</p>
            )}
          </div>

          <div>
            <Input
              label="Customer ID"
              placeholder="e.g., GLOB-001"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              required
              fullWidth
              error={validationErrors.customer_id}
            />
            {validationErrors.customer_id && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.customer_id}</p>
            )}
          </div>

          <div>
            <Input
              label="Batch IDs"
              placeholder="e.g., FB-2024-001, FB-2024-002"
              value={formData.batch_ids}
              onChange={(e) => setFormData({ ...formData, batch_ids: e.target.value })}
              required
              fullWidth
              error={validationErrors.batch_ids}
            />
            {validationErrors.batch_ids && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.batch_ids}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Service Amount (SAR)"
                type="number"
                step="100"
                min="1"
                value={formData.service_amount}
                onChange={(e) => setFormData({ ...formData, service_amount: Number(e.target.value) })}
                required
                fullWidth
                error={validationErrors.service_amount}
              />
              {validationErrors.service_amount && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.service_amount}</p>
              )}
            </div>

            <div>
              <Input
                label="Tax Amount (SAR)"
                type="number"
                step="50"
                min="0"
                value={formData.tax_amount || 0}
                onChange={(e) => setFormData({ ...formData, tax_amount: Number(e.target.value) })}
                fullWidth
                error={validationErrors.tax_amount}
              />
              {validationErrors.tax_amount && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.tax_amount}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
              fullWidth
              error={validationErrors.due_date}
            />
            {validationErrors.due_date && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.due_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              placeholder="Invoice notes or special instructions"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {validationErrors.notes && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.notes}</p>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  )
}
