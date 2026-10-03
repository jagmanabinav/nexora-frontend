'use client'

import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import { parseApiError } from '../lib/error'

/**
 * Customers - B2B textile customer management
 * Handles: Customer tier management, credit limits, contact info
 */

export interface Customer {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  service_tier: 'standard' | 'premium' | 'vip'
  status: 'active' | 'inactive' | 'suspended'
  credit_limit?: number
  created_at: string
  total_orders: number
}

export interface CreateCustomerInput {
  company_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  service_tier?: 'standard' | 'premium' | 'vip'
  status?: 'active' | 'inactive' | 'suspended'
  credit_limit?: number
}

export interface UpdateCustomerInput {
  company_name?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  service_tier?: 'standard' | 'premium' | 'vip'
  status?: 'active' | 'inactive' | 'suspended'
  credit_limit?: number
}

export interface CustomerListResponse {
  items: Customer[]
  total: number
  page: number
  limit: number
  total_pages: number
}

/**
 * Hook to fetch customers list with pagination and filtering
 */
export function useGetCustomers() {
  const [data, setData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(
    async (options?: {
      page?: number
      limit?: number
      company_name?: string
      status?: 'active' | 'inactive' | 'suspended'
      tier?: 'standard' | 'premium' | 'vip'
    }) => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.customers.list(options?.page, options?.limit)
        const data = response as unknown as Record<string, unknown>
        const items = (Array.isArray(data.data) ? data.data : data.items || []) as Customer[]
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
 * Hook to fetch a single customer
 */
export function useGetCustomer() {
  const [data, setData] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.customers.get(id)
      const data = response as unknown as Record<string, unknown>
      const customer = (data.data || data) as Customer
      setData(customer)
      return customer
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
 * Hook to create a new customer
 */
export function useCreateCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (input: CreateCustomerInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.customers.create(input)
      const data = response as unknown as Record<string, unknown>
      return (data.data || data) as Customer
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
 * Hook to update a customer
 */
export function useUpdateCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (id: string, input: UpdateCustomerInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.customers.update(id, input)
      const data = response as unknown as Record<string, unknown>
      return (data.data || data) as Customer
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
 * Hook to delete a customer
 */
export function useDeleteCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const delete_ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.customers.delete(id)
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
