'use client'

import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import { parseApiError } from '../lib/error'

/**
 * Invoices - Invoice management and billing
 * Handles: Invoice creation, tracking, payments
 */

export interface FabricInvoice {
  id: string
  invoice_number: string
  customer_id: string
  batch_ids: string
  service_amount: number
  tax_amount?: number
  total_amount: number
  due_date: string
  issued_at: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  notes?: string
}

export interface CreateFabricInvoiceInput {
  invoice_number: string
  customer_id: string
  batch_ids: string
  service_amount: number
  tax_amount?: number
  due_date: string
  notes?: string
}

export interface UpdateFabricInvoiceInput {
  invoice_number?: string
  customer_id?: string
  batch_ids?: string
  service_amount?: number
  tax_amount?: number
  due_date?: string
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  notes?: string
}

export interface FabricInvoiceListResponse {
  items: FabricInvoice[]
  total: number
  page: number
  limit: number
  total_pages: number
}

/**
 * Hook to fetch invoices list with pagination and filtering
 */
export function useGetInvoices() {
  const [data, setData] = useState<FabricInvoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(
    async (options?: {
      page?: number
      limit?: number
      invoice_number?: string
      customer_id?: string
      status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    }) => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.invoices.list(options?.page, options?.limit)
        const data = response as unknown as Record<string, unknown>
        const items = (Array.isArray(data.data) ? data.data : data.items || []) as FabricInvoice[]
        setData(items)
        return { items, total: (data.pagination as Record<string, unknown>)?.total || 0 }
      } catch (err) {
        const message = parseApiError(err).message
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { data, loading, error, fetch }
}

/**
 * Hook to fetch a single invoice
 */
export function useGetInvoice() {
  const [data, setData] = useState<FabricInvoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.invoices.get(id)
      const data = response as unknown as Record<string, unknown>
      const invoice = (data.data || data) as FabricInvoice
      setData(invoice)
      return invoice
    } catch (err) {
      const message = parseApiError(err).message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetch }
}

/**
 * Hook to create a new invoice
 */
export function useCreateInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (input: CreateFabricInvoiceInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.invoices.create(input)
      const data = response as unknown as Record<string, unknown>
      return (data.data || data) as FabricInvoice
    } catch (err) {
      const message = parseApiError(err).message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, create }
}

/**
 * Hook to update an invoice
 */
export function useUpdateInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (id: string, input: UpdateFabricInvoiceInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.invoices.update(id, input)
      const data = response as unknown as Record<string, unknown>
      return (data.data || data) as FabricInvoice
    } catch (err) {
      const message = parseApiError(err).message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, update }
}

/**
 * Hook to delete an invoice
 */
export function useDeleteInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const delete_ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.invoices.delete(id)
      return { success: true }
    } catch (err) {
      const message = parseApiError(err).message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, delete: delete_ }
}
