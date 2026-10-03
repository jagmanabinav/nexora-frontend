'use client'

import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import { parseApiError } from '../lib/error'

/**
 * DC Operations (Processes) - Fabric processing workflow management
 * Handles: Washing → Drying → Pressing → Finishing → QC
 */

export interface FabricProcess {
  id: string
  batch_id: string
  process_type: 'washing' | 'drying' | 'pressing' | 'finishing' | 'quality_check'
  operator_name: string
  duration_hours: number
  temperature_celsius?: number
  quality_check_status: 'passed' | 'pending' | 'failed'
  defects_noted?: string
  chemical_used?: string
  started_at: string
  completed_at: string
  status: 'in_progress' | 'completed'
}

export interface CreateProcessInput {
  batch_id: string
  process_type: 'washing' | 'drying' | 'pressing' | 'finishing' | 'quality_check'
  operator_name: string
  duration_hours: number
  temperature_celsius?: number
  quality_check_status?: 'passed' | 'pending' | 'failed'
  defects_noted?: string
  chemical_used?: string
}

export interface UpdateProcessInput {
  process_type?: 'washing' | 'drying' | 'pressing' | 'finishing' | 'quality_check'
  operator_name?: string
  duration_hours?: number
  temperature_celsius?: number
  quality_check_status?: 'passed' | 'pending' | 'failed'
  defects_noted?: string
  chemical_used?: string
  status?: 'in_progress' | 'completed'
}

export interface ProcessListResponse {
  items: FabricProcess[]
  total: number
  page: number
  limit: number
  total_pages: number
}

/**
 * Hook to fetch fabric processes list with pagination, filtering, and search
 */
export function useGetFabricProcesses() {
  const [data, setData] = useState<FabricProcess[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(
    async (options?: {
      page?: number
      limit?: number
      batch_id?: string
      operator_name?: string
      process_type?: string
      status?: 'in_progress' | 'completed'
    }) => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.processes.list(options?.page, options?.limit)
        const data = response as unknown as Record<string, unknown>
        const items = (Array.isArray(data.data) ? data.data : data.items || []) as FabricProcess[]
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
 * Hook to fetch a single fabric process
 */
export function useGetFabricProcess() {
  const [data, setData] = useState<FabricProcess | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.processes.get(id)
      const data = response as unknown as Record<string, unknown>
      const process = (data.data || data) as FabricProcess
      setData(process)
      return process
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
 * Hook to create a new fabric process
 */
export function useCreateFabricProcess() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (input: CreateProcessInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.processes.create(input)
      const data = response as unknown as Record<string, unknown>
      return (data.data || data) as FabricProcess
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
 * Hook to update a fabric process
 */
export function useUpdateFabricProcess() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (id: string, input: UpdateProcessInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.processes.update(id, input)
      const data = response as unknown as Record<string, unknown>
      return (data.data || data) as FabricProcess
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
 * Hook to delete a fabric process
 */
export function useDeleteFabricProcess() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const delete_ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.processes.delete(id)
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
