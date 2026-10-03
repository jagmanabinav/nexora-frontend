'use client'

import { useState, useCallback, useMemo } from 'react'

interface PaginationState {
  page: number
  pageSize: number
  total: number
}

interface UsePaginationOptions {
  defaultPageSize?: number
  defaultPage?: number
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const { defaultPageSize = 10, defaultPage = 1 } = options

  const [page, setPage] = useState(defaultPage)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const total = items.length
  const totalPages = Math.ceil(total / pageSize)

  // Ensure page is valid
  const validPage = Math.min(Math.max(1, page), totalPages || 1)

  const startIndex = (validPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  )

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage))
  }, [])

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages || 1))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1))
  }, [])

  const setSize = useCallback((size: number) => {
    setPageSize(size)
    setPage(1) // Reset to first page when size changes
  }, [])

  return {
    page: validPage,
    pageSize,
    total,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setSize,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, total),
  }
}
