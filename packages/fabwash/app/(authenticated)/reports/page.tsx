'use client'

import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Badge,
  useGetReportMetrics,
  useExportReport,
  parseApiError,
} from '@nexora/shared'

interface MetricData {
  label: string
  value: number
  trend: number
  unit: string
}

interface ReportSection {
  title: string
  icon: string
  metrics: MetricData[]
  chartData: number[]
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSection[]>([])
  const [pageError, setPageError] = useState('')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')

  // API hooks
  const { data: _reportData, loading, error: fetchError, fetch: fetchReportMetrics } = useGetReportMetrics()
  const { export: exportReport, error: _exportError } = useExportReport()

  const loadReports = React.useCallback(async () => {
    try {
      const data = await fetchReportMetrics(timeRange)
      if (data?.sections) {
        setReports(data.sections)
      }
      setPageError('')
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }, [fetchReportMetrics, timeRange])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const _handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const result = await exportReport(format, timeRange)
      if (result?.url) {
        // Open or download the file
        const link = document.createElement('a')
        link.href = result.url
        link.download = result.filename || `report.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      setPageError(parseApiError(err).message)
    }
  }

  const SimpleBarChart = ({ data }: { data: number[] }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    return (
      <div className="flex items-end justify-between gap-1 h-32 my-4">
        {data.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{
                height: `${((value - min) / range) * 100}%`,
                minHeight: '4px',
              }}
            />
            <span className="text-xs text-gray-500 mt-1">{idx + 1}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderTrendBadge = (trend: number) => {
    if (trend > 0) {
      return <Badge variant="success">↑ +{trend}%</Badge>
    } else if (trend < 0) {
      return <Badge variant="danger">↓ {trend}%</Badge>
    }
    return <Badge variant="info">→ 0%</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">Factory performance metrics and trends</p>
            </div>

            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'primary' : 'secondary'}
                  onClick={() => setTimeRange(range)}
                >
                  {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Quarter'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {pageError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {pageError}
          </div>
        )}
        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {fetchError}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Batches</p>
              <p className="text-3xl font-bold text-blue-600">
                {(48 * (timeRange === 'week' ? 1 : timeRange === 'month' ? 4 : 12)).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-2">↑ 12% this period</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {(
                  125000 * (timeRange === 'week' ? 1 : timeRange === 'month' ? 4 : 12)
                ).toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-green-600 mt-2">↑ 8% this period</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Active Customers</p>
              <p className="text-3xl font-bold text-purple-600">28</p>
              <p className="text-xs text-green-600 mt-2">↑ 4% this period</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Quality Pass Rate</p>
              <p className="text-3xl font-bold text-orange-600">94%</p>
              <p className="text-xs text-green-600 mt-2">↑ 2% this period</p>
            </div>
          </Card>
        </div>

        {/* Report Sections */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading reports...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {reports.map((report, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{report.icon}</span>
                    <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {report.metrics.map((metric, metricIdx) => (
                    <div
                      key={metricIdx}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <p className="text-xs text-gray-600 mb-2">{metric.label}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {typeof metric.value === 'number' && metric.value > 1000
                          ? (metric.value / 1000).toFixed(1) + 'K'
                          : metric.value}
                      </p>
                      <p className="text-xs text-gray-600">{metric.unit}</p>
                      <div className="mt-2">{renderTrendBadge(metric.trend)}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Trend ({timeRange})</p>
                  <SimpleBarChart data={report.chartData} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Export Section */}
        <Card className="p-6 mt-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Export Reports</h3>
              <p className="text-sm text-gray-600">Download all reports in your preferred format</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">📄 PDF</Button>
              <Button variant="secondary">📊 Excel</Button>
              <Button variant="secondary">📧 Email</Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
