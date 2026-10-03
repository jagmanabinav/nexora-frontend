'use client'

export function Skeleton({
  className = '',
  height = 'h-4',
}: {
  className?: string
  height?: string
}) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${height} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b">
        <Skeleton className="flex-1" height="h-8" />
        <Skeleton className="flex-1" height="h-8" />
        <Skeleton className="flex-1" height="h-8" />
        <Skeleton className="w-20" height="h-8" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="flex-1" height="h-10" />
          <Skeleton className="flex-1" height="h-10" />
          <Skeleton className="flex-1" height="h-10" />
          <Skeleton className="w-20" height="h-10" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <Skeleton className="w-1/3" height="h-6" />
      <div className="space-y-2">
        <Skeleton height="h-4" />
        <Skeleton height="h-4" />
        <Skeleton height="h-4" className="w-2/3" />
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="w-20 mb-2" height="h-4" />
        <Skeleton className="w-full" height="h-10" />
      </div>
      <div>
        <Skeleton className="w-20 mb-2" height="h-4" />
        <Skeleton className="w-full" height="h-10" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-20" height="h-10" />
        <Skeleton className="w-20" height="h-10" />
      </div>
    </div>
  )
}
