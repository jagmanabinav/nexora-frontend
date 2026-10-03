'use client'

import React from 'react'

interface TableProps<T> extends React.HTMLAttributes<HTMLTableElement> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string
  emptyMessage?: string
}

interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (value: unknown, row: T) => React.ReactNode
  width?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps<unknown>>(
  (
    {
      data,
      columns,
      loading = false,
      error = '',
      emptyMessage = 'No data found',
      className = '',
      ...props
    },
    ref
  ) => {
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error: {error}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="p-4 text-center text-gray-500">
          Loading...
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          {emptyMessage}
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={`w-full border-collapse border border-gray-300 ${className}`}
          {...props}
        >
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300 ${
                    column.width || ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => {
              const typedRow = row as Record<string, unknown>
              return (
                <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={`${rowIdx}-${String(column.key)}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700"
                    >
                      {column.render
                        ? column.render(typedRow[column.key as string], typedRow)
                        : String(typedRow[column.key as string])}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
)

Table.displayName = 'Table'

export default Table
