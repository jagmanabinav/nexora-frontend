/**
 * @nexora/shared
 *
 * Shared package containing:
 * - API client (axios)
 * - React hooks
 * - UI components
 * - TypeScript types
 * - Context providers
 */

// Export from submodules
export * from './api'
export * from './hooks'
export * from './types'
export * from './providers'
export * from './layouts'
export * from './schemas'

// Re-export commonly used items
export { default as Button } from './components/Button'
export { default as Input } from './components/Input'
export { default as Card, CardHeader, CardBody, CardFooter } from './components/Card'
export { default as Table } from './components/Table'
export { default as Dialog } from './components/Dialog'
export { default as Badge } from './components/Badge'
export { default as Loading } from './components/Loading'
export { default as ErrorBoundary } from './components/ErrorBoundary'
export { default as Form, FormField, FormGroup } from './components/Form'
export { default as Pagination } from './components/Pagination'
export { Skeleton, TableSkeleton, CardSkeleton, FormSkeleton } from './components/Skeleton'

// API and error handling
export { api, ApiError, retryWithBackoff } from './lib/api'
export { parseApiError, logError, formatValidationErrors, isRetryableError } from './lib/error'
export type { ApiResponse, ApiRequestOptions } from './lib/api'
export type { UserFriendlyError } from './lib/error'
