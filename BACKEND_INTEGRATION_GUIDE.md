# Backend Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  React Components (FabWash / Admin Apps)              │
│           ↓                                            │
│  Custom Hooks (useGetFabricBatches, etc.)             │
│           ↓                                            │
│  Shared API Service Layer                             │
│  ├─ api.fabricBatches.list()                          │
│  ├─ api.processes.create()                            │
│  └─ api.customers.update()                            │
│           ↓                                            │
│  HTTP/JSON Requests (JWT auth)                        │
└─────────────────────────────────────────────────────────┘
           ↓ http://localhost:8000/api/v1 ↓
┌─────────────────────────────────────────────────────────┐
│          FastAPI Backend (Port 8000)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  API Routes                                            │
│  ├─ POST /auth/login                                   │
│  ├─ GET/POST/PUT/DELETE /fabric-batches/:id           │
│  ├─ GET/POST/PUT/DELETE /processes/:id               │
│  ├─ GET/POST/PUT/DELETE /customers/:id               │
│  ├─ GET/POST/PUT/DELETE /invoices/:id                │
│  └─ GET /reports/metrics                              │
│           ↓                                            │
│  Services Layer                                        │
│           ↓                                            │
│  SQLAlchemy ORM Models                                │
│           ↓                                            │
└─────────────────────────────────────────────────────────┘
           ↓ postgresql://localhost/nexora_dev ↓
┌─────────────────────────────────────────────────────────┐
│          PostgreSQL Database                            │
│  ├─ fabric_batches                                      │
│  ├─ processes                                           │
│  ├─ customers                                           │
│  ├─ invoices                                            │
│  └─ reports                                             │
└─────────────────────────────────────────────────────────┘
```

## API Client Usage

### Basic Request Pattern

```typescript
import { api, parseApiError, logError } from '@nexora/shared'

// Get fabric batches
const response = await api.fabricBatches.list(1, 10, 'search term')

// Handle response
if (response.data) {
  const batches = response.data
  // Use data...
}
```

### Error Handling Pattern

```typescript
try {
  const result = await api.fabricBatches.create({
    batchNumber: 'FB-001',
    quantityKg: 500,
    gradeLevel: 'A'
  })
} catch (error) {
  const friendlyError = parseApiError(error)
  
  console.log(friendlyError.title)      // "Validation Error"
  console.log(friendlyError.message)    // "Batch number already exists"
  console.log(friendlyError.code)       // "VALIDATION_ERROR"
  console.log(friendlyError.isRetryable) // false
  
  logError(error, { action: 'create_batch' })
  
  // Show user error
  showErrorToast(friendlyError.message)
}
```

### React Hook Pattern

```typescript
// Create a custom hook for data fetching
import { useState, useEffect } from 'react'
import { api, parseApiError } from '@nexora/shared'

export function useGetFabricBatches(page = 1) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true)
        const result = await api.fabricBatches.list(page, 10)
        setData(result.data)
      } catch (err) {
        const parsedError = parseApiError(err)
        setError(parsedError)
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [page])

  return { data, loading, error }
}
```

## API Endpoints

### Authentication
```
POST /auth/login
  Body: { email, password }
  Response: { access_token, refresh_token, user }
  
POST /auth/refresh
  Headers: { Authorization: "Bearer {token}" }
  Response: { access_token }
```

### Fabric Batches (FabWash Module 1)
```
GET  /fabric-batches?skip=0&limit=10&search=FB
  Response: { data: [FabricBatch], pagination }
  
GET  /fabric-batches/{id}
  Response: { data: FabricBatch }
  
POST /fabric-batches
  Body: { batchNumber, quantityKg, gradeLevel: A|B|C }
  Response: { data: FabricBatch }
  
PUT  /fabric-batches/{id}
  Body: { batchNumber?, quantityKg?, gradeLevel? }
  Response: { data: FabricBatch }
  
DELETE /fabric-batches/{id}
  Response: 204 No Content
```

### Processes (FabWash Module 2)
```
GET  /processes?skip=0&limit=10&status=pending
  Response: { data: [Process], pagination }
  
POST /processes
  Body: { batchId, operationType: wash|dry|press|finish|qc, duration }
  Response: { data: Process }
  
PUT  /processes/{id}
  Body: { status: pending|in_progress|completed }
  Response: { data: Process }
```

### Customers (FabWash Module 3)
```
GET  /customers?skip=0&limit=10&tier=gold
  Response: { data: [Customer], pagination }
  
POST /customers
  Body: { companyName, tier: gold|silver|bronze, creditLimit }
  Response: { data: Customer }
  
PUT  /customers/{id}
  Body: { companyName?, tier?, creditLimit? }
  Response: { data: Customer }
```

### Invoices (FabWash Module 4)
```
GET  /invoices?skip=0&limit=10&status=pending
  Response: { data: [Invoice], pagination }
  
POST /invoices
  Body: { batchId, customerId, amountSAR, items }
  Response: { data: Invoice }
  
GET  /invoices/{id}/pdf
  Response: PDF file (application/pdf)
```

### Reports (FabWash Module 5)
```
GET  /reports/metrics?timeRange=week|month|year
  Response: { data: { totalBatches, completedBatches, avgTurnaroundTime } }
  
GET  /reports/trends?timeRange=month
  Response: { data: { labels: [], datasets: [] } }
  
POST /reports/export
  Body: { format: pdf|csv|xlsx, dateRange: { start, end } }
  Response: File download
```

## Error Handling

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 422 | Invalid input data |
| NOT_FOUND | 404 | Resource doesn't exist |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| CONFLICT | 409 | Duplicate resource |
| INTERNAL_SERVER_ERROR | 500 | Backend bug |
| NETWORK_ERROR | - | Connection failed |
| TIMEOUT | - | Request took too long |

### Error Response Format

```json
{
  "detail": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "errors": {
    "email": "Email already exists",
    "phone": "Invalid phone number"
  }
}
```

## Testing API Integration

### Mock API for Development

```typescript
// Create a mock version for testing without backend
export const mockApi = {
  fabricBatches: {
    list: async () => ({
      data: [
        { id: '1', batchNumber: 'FB-001', gradeLevel: 'A' },
        { id: '2', batchNumber: 'FB-002', gradeLevel: 'B' }
      ]
    }),
    create: async (data) => ({ data: { id: '3', ...data } })
  }
}

// Use in tests
jest.mock('@nexora/shared', () => ({
  api: mockApi
}))
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should create fabric batch', async ({ page }) => {
  await page.goto('http://localhost:3001/fabric-receive')
  
  // Click create button
  await page.click('[data-testid="create-batch-btn"]')
  
  // Fill form
  await page.fill('[name="batchNumber"]', 'FB-TEST-001')
  await page.selectOption('[name="gradeLevel"]', 'A')
  await page.fill('[name="quantityKg"]', '500')
  
  // Submit
  await page.click('[data-testid="submit-btn"]')
  
  // Verify success
  await expect(page.locator('text=Batch created successfully')).toBeVisible()
  await expect(page.locator('text=FB-TEST-001')).toBeVisible()
})
```

## Performance Tips

1. **Use hooks for data fetching**
   - Automatic loading/error states
   - Built-in retry logic

2. **Implement caching**
   - SWR hook for auto-revalidation
   - React Query for complex state

3. **Lazy load images**
   - Thumbnails in list views
   - Full images on detail pages

4. **Batch requests when possible**
   - Combine multiple GETs into one
   - Reduce server load

5. **Monitor performance**
   - Track API response times
   - Alert on slow endpoints

---

**See also**: PHASE_5_PROGRESS.md for detailed progress and next steps
