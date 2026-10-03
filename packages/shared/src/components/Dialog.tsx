'use client'

import React, { useState } from 'react'

interface DialogProps {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  children,
  onClose,
  actions,
  size = 'md',
}) => {
  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className={`${sizeClasses[size]} bg-white rounded-lg shadow-xl overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-2 justify-end">
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dialog
