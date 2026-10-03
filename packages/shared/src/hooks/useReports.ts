'use client'

import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import { parseApiError } from '../lib/error'

/**
 * Reports - KPI metrics and analytics dashboard
 * Handles: Metrics fetching, trend analysis, report generation
 */

export interface MetricData {
  label: string
  value: number
  trend: number
  unit: string
}

export interface ReportSection {
  title: string
  icon: string
  metrics: MetricData[]
  chartData: number[]
}

export interface ReportMetrics {
  batches_processed: number
  total_revenue: number
  active_customers: number
  quality_pass_rate: number
  avg_process_time: number
  defect_rate: number
  invoices_generated: number
  repeat_customer_rate: number
}

export interface ReportResponse {
  sections: ReportSection[]
  metrics: ReportMetrics
  time_range: 'week' | 'month' | 'quarter'
  generated_at: string
}

/**
 * Hook to fetch report metrics with time range filtering
 */
export function useGetReportMetrics() {
  const [data, setData] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(
    async (timeRange: 'week' | 'month' | 'quarter' = 'month') => {
      setLoading(true)
      setError(null)
      try {
        // Call API with time_range parameter
        const response = await api.reports.metrics(timeRange)
        
        const data = response as unknown as Record<string, unknown>
        const report = (data.data || data) as ReportResponse
        setData(report)
        return report
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
 * Hook to fetch trending data for charts
 */
export function useGetReportTrends() {
  const [data, setData] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(
    async (metric: string, timeRange: 'week' | 'month' | 'quarter' = 'month') => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.reports.trends(timeRange)
        
        const data = response as unknown as Record<string, unknown>
        const trends = (Array.isArray(data.data) ? data.data : []) as number[]
        setData(trends)
        return trends
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
 * Hook to export reports (PDF/CSV)
 */
export function useExportReport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const export_ = useCallback(
    async (format: 'pdf' | 'csv', timeRange: 'week' | 'month' | 'quarter' = 'month') => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.reports.export(format)
        
        const data = response as unknown as Record<string, unknown>
        return data as { url: string; filename: string }
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

  return { loading, error, export: export_ }
}
