'use client'

import React from 'react'
import { Button, Card } from '@nexora/shared'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: Error, reset: () => void) => React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default function ErrorBoundary({
  children,
  fallback,
}: ErrorBoundaryProps) {
  const [state, setState] = React.useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
  })

  const handleReset = () => {
    setState({ hasError: false, error: null })
  }

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setState({
        hasError: true,
        error: event.error || new Error(event.message),
      })
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (state.hasError && state.error) {
    if (fallback) {
      return fallback(state.error, handleReset)
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {state.error.message || 'An unexpected error occurred'}
            </p>
            <div className="bg-gray-100 rounded p-3 mb-6 text-left text-xs text-gray-700 max-h-40 overflow-auto">
              <code>{state.error.stack}</code>
            </div>
            <Button
              variant="primary"
              onClick={handleReset}
              fullWidth
            >
              Try again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
