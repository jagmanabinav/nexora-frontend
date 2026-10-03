'use client'

import React from 'react'
import Button from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  total: number
  pageSize: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export default function Pagination({
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
  total,
  pageSize,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      {/* Left: Results info */}
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="secondary"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          size="sm"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          size="sm"
        >
          Next
        </Button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Showing X-Y of Z */}
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>

        {/* Page size selector + pagination */}
        <div className="flex items-center gap-4">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-700">
              Per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <Button
              variant="secondary"
              disabled={!hasPrevPage}
              onClick={() => onPageChange(page - 1)}
              className="rounded-l-md px-2 py-2 text-sm"
              size="sm"
            >
              ← Previous
            </Button>

            {/* Page numbers */}
            {totalPages <= 7 ? (
              // Show all pages if 7 or fewer
              Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'primary' : 'secondary'}
                  onClick={() => onPageChange(p)}
                  className="px-3 py-2 text-sm"
                  size="sm"
                >
                  {p}
                </Button>
              ))
            ) : (
              <>
                {/* Always show first page */}
                <Button
                  variant={page === 1 ? 'primary' : 'secondary'}
                  onClick={() => onPageChange(1)}
                  className="px-3 py-2 text-sm"
                  size="sm"
                >
                  1
                </Button>

                {/* Ellipsis if needed */}
                {page > 3 && (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                )}

                {/* Current page and neighbors */}
                {page > 2 && (
                  <Button
                    variant="secondary"
                    onClick={() => onPageChange(page - 1)}
                    className="px-3 py-2 text-sm"
                    size="sm"
                  >
                    {page - 1}
                  </Button>
                )}

                {page !== 1 && page !== totalPages && (
                  <Button
                    variant="primary"
                    onClick={() => onPageChange(page)}
                    className="px-3 py-2 text-sm"
                    size="sm"
                  >
                    {page}
                  </Button>
                )}

                {page < totalPages - 1 && (
                  <Button
                    variant="secondary"
                    onClick={() => onPageChange(page + 1)}
                    className="px-3 py-2 text-sm"
                    size="sm"
                  >
                    {page + 1}
                  </Button>
                )}

                {/* Ellipsis if needed */}
                {page < totalPages - 2 && (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                )}

                {/* Always show last page */}
                <Button
                  variant={page === totalPages ? 'primary' : 'secondary'}
                  onClick={() => onPageChange(totalPages)}
                  className="px-3 py-2 text-sm"
                  size="sm"
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="secondary"
              disabled={!hasNextPage}
              onClick={() => onPageChange(page + 1)}
              className="rounded-r-md px-2 py-2 text-sm"
              size="sm"
            >
              Next →
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
