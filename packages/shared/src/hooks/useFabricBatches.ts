/**
 * React hooks for Fabric Receive module
 * Handles all fabric batch CRUD operations with the FastAPI backend
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { api } from '../lib/api'
import { parseApiError, logError } from '../lib/error'

export interface FabricBatch {
  id: string
  batch_id: string
  supplier_name: string
  fabric_type: string
  weight_kg: number
  color: string
  quality_grade: 'A' | 'B' | 'C'
  processing_notes?: string
  received_at: string
  received_by: string
  status: 'received' | 'in_queue' | 'processing' | 'completed'
}

export interface CreateFabricBatchInput {
  batch_id: string
  supplier_name: string
  fabric_type: string
  weight_kg: number
  color: string
  quality_grade: 'A' | 'B' | 'C'
  processing_notes?: string
}

export interface FabricBatchListResponse {
  data: FabricBatch[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface UseGetFabricBatchesOptions {
  page?: number
  limit?: number
  search?: string
  enabled?: boolean
}

/**
 * Hook: Get list of fabric batches
 * Fetches from: GET /fabric-batches
 */
export function useGetFabricBatches(options: UseGetFabricBatchesOptions = {}) {
  const { page = 1, limit = 10, search = '', enabled = true } = options

  const [data, setData] = useState<FabricBatch[]>([])
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchBatches = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)

      // Call API
      const response = await api.fabricBatches.list(page, limit, search)

      // Extract data
      if (response.data) {
        setData(Array.isArray(response.data) ? response.data : [])
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (err) {
      const parsedError = parseApiError(err)
      setError(parsedError)
      logError(err, { action: 'fetch_fabric_batches', page, limit, search })
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, enabled])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchBatches,
  }
}

/**
 * Hook: Get single fabric batch by ID
 * Fetches from: GET /fabric-batches/{id}
 */
export function useGetFabricBatch(id: string | null) {
  const [data, setData] = useState<FabricBatch | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!id) {
      setData(null)
      setLoading(false)
      return
    }

    const fetchBatch = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.fabricBatches.get(id)

        if (response.data) {
          setData(response.data as FabricBatch)
        }
      } catch (err) {
        const parsedError = parseApiError(err)
        setError(parsedError)
        logError(err, { action: 'fetch_fabric_batch', id })
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBatch()
  }, [id])

  return { data, loading, error }
}

/**
 * Hook: Create a new fabric batch
 * Posts to: POST /fabric-batches
 */
export function useCreateFabricBatch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const mutate = useCallback(async (input: CreateFabricBatchInput): Promise<FabricBatch | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.fabricBatches.create(input)

      if (response.data) {
        return response.data as FabricBatch
      }

      return null
    } catch (err) {
      const parsedError = parseApiError(err)
      setError(parsedError)
      logError(err, { action: 'create_fabric_batch', input })
      throw parsedError
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}

/**
 * Hook: Update an existing fabric batch
 * Puts to: PUT /fabric-batches/{id}
 */
export function useUpdateFabricBatch(id: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const mutate = useCallback(
    async (input: Partial<CreateFabricBatchInput>): Promise<FabricBatch | null> => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.fabricBatches.update(id, input)

        if (response.data) {
          return response.data as FabricBatch
        }

        return null
      } catch (err) {
        const parsedError = parseApiError(err)
        setError(parsedError)
        logError(err, { action: 'update_fabric_batch', id, input })
        throw parsedError
      } finally {
        setLoading(false)
      }
    },
    [id]
  )

  return { mutate, loading, error }
}

/**
 * Hook: Delete a fabric batch
 * Deletes from: DELETE /fabric-batches/{id}
 */
export function useDeleteFabricBatch(id: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const mutate = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      await api.fabricBatches.delete(id)

      return true
    } catch (err) {
      const parsedError = parseApiError(err)
      setError(parsedError)
      logError(err, { action: 'delete_fabric_batch', id })
      throw parsedError
    } finally {
      setLoading(false)
    }
  }, [id])

  return { mutate, loading, error }
}
