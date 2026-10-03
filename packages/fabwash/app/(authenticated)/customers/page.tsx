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
  useGetCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  parseApiError,
} from '@nexora/shared'
import { z } from 'zod'

// Validation schema for B2B textile customers
const CustomerSchema = z.object({
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  contact_person: z
    .string()
    .min(2, 'Contact person name required'),
  email: z
    .string()
    .email('Invalid email address'),
  phone: z
    .string()
    .min(7, 'Invalid phone number'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters'),
  service_tier: z
    .enum(['standard', 'premium', 'vip'])
    .default('standard'),
  status: z
    .enum(['active', 'inactive', 'suspended'])
    .default('active'),
  credit_limit: z
    .number()
    .min(0, 'Credit limit cannot be negative')
    .optional(),
})

type CustomerFormData = z.infer<typeof CustomerSchema>

interface Customer extends CustomerFormData {
  id: string
  created_at: string
  total_orders: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pageError, setPageError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    service_tier: 'standard',
    status: 'active',
    credit_limit: 10000,
  })

  // API hooks
  const { data: fetchedCustomers, loading, error: fetchError, fetch: fetchCustomers } = useGetCustomers()
  const { create: createCustomer, error: _createError } = useCreateCustomer()
  const { update: updateCustomer, error: _updateError } = useUpdateCustomer()
  const { delete: deleteCustomer, error: _deleteError } = useDeleteCustomer()

  // Pagination
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [customers, searchTerm, filterStatus])

  const {
    page,
    pageSize,
    paginatedItems: displayedCustomers,
    totalPages,
    hasNextPage,
    hasPrevPage,
    total,
    startIndex,
    endIndex,
    goToPage,
    setSize,
  } = usePagination(filteredCustomers, { defaultPageSize: 10 })

  const loadCustomers = async () => {
    try {
      await fetchCustomers()
      setPageError('')
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }

  useEffect(() => {
    loadCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update customers when fetched data changes
  useEffect(() => {
    if (fetchedCustomers.length > 0) {
      setCustomers(fetchedCustomers)
    }
  }, [fetchedCustomers])

  const {
    errors: validationErrors,
    isSubmitting,
    submitError,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(CustomerSchema, {
    onSubmit: async (data: unknown) => {
      const customerData = data as CustomerFormData
      try {
        if (editingId) {
          // Update existing customer
          const updated = await updateCustomer(editingId, customerData)
          setCustomers(customers.map((c) => (c.id === editingId ? { ...c, ...updated } : c)))
        } else {
          // Create new customer
          const created = await createCustomer(customerData)
          setCustomers([...customers, created])
        }
        setDialogOpen(false)
        setFormData({
          company_name: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
          service_tier: 'standard',
          status: 'active',
          credit_limit: 10000,
        })
      } catch (err) {
        setSubmitError(parseApiError(err).message)
      }
    },
  })

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id)
      setFormData({
        company_name: customer.company_name,
        contact_person: customer.contact_person,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        service_tier: customer.service_tier,
        status: customer.status,
        credit_limit: customer.credit_limit,
      })
    } else {
      setEditingId(null)
      setFormData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        service_tier: 'standard',
        status: 'active',
        credit_limit: 10000,
      })
    }
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(formData)
  }

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await deleteCustomer(customerId)
      setCustomers(customers.filter((c) => c.id !== customerId))
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }

  const tierIcons: Record<string, string> = {
    standard: '📦',
    premium: '⭐',
    vip: '👑',
  }

  const columns = [
    {
      key: 'company_name',
      label: 'Company',
      render: (value: unknown) => <span className="font-medium">{String(value)}</span>,
    },
    {
      key: 'contact_person',
      label: 'Contact',
      render: (value: unknown) => <span>{String(value)}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: unknown) => <span className="text-sm">{String(value)}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: unknown) => <span className="font-mono">{String(value)}</span>,
    },
    {
      key: 'service_tier',
      label: 'Tier',
      render: (value: unknown) => (
        <span>{tierIcons[String(value)] || '📦'} {String(value)}</span>
      ),
    },
    {
      key: 'total_orders',
      label: 'Orders',
      render: (value: unknown) => <span className="font-bold text-center">{String(value)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = String(value)
        const colors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          active: 'success',
          inactive: 'warning',
          suspended: 'danger',
        }
        return <Badge variant={colors[status] || 'info'}>{status}</Badge>
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: unknown, row: unknown) => {
        const customer = row as Customer
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenDialog(customer)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(customer.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-600 mt-1">B2B textile processing customers</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>
            + New Customer
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
              placeholder="Search by company, contact, or email..."
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
                setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')
                goToPage(1)
              }}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Table */}
          <Table
            data={displayedCustomers}
            columns={columns}
            loading={loading}
            emptyMessage={
              searchTerm || filterStatus !== 'all'
                ? 'No customers match your filters'
                : 'No customers yet'
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
        title={editingId ? 'Edit Customer' : 'New Customer'}
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
              label="Company Name"
              placeholder="e.g., Global Textiles Ltd"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
              fullWidth
              error={validationErrors.company_name}
            />
            {validationErrors.company_name && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.company_name}</p>
            )}
          </div>

          <div>
            <Input
              label="Contact Person"
              placeholder="Name of the primary contact"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              required
              fullWidth
              error={validationErrors.contact_person}
            />
            {validationErrors.contact_person && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.contact_person}</p>
            )}
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              placeholder="company@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
              error={validationErrors.email}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <Input
              label="Phone"
              placeholder="+966-50-1234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              fullWidth
              error={validationErrors.phone}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>
            )}
          </div>

          <div>
            <Input
              label="Address"
              placeholder="Street address and location"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              fullWidth
              error={validationErrors.address}
            />
            {validationErrors.address && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Tier</label>
              <select
                value={formData.service_tier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    service_tier: e.target.value as 'standard' | 'premium' | 'vip',
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="standard">📦 Standard</option>
                <option value="premium">⭐ Premium</option>
                <option value="vip">👑 VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'inactive' | 'suspended',
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Credit Limit (SAR)"
              type="number"
              min="0"
              step="1000"
              value={formData.credit_limit || 10000}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credit_limit: Number(e.target.value),
                })
              }
              fullWidth
              error={validationErrors.credit_limit}
            />
            {validationErrors.credit_limit && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.credit_limit}</p>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  )
}
