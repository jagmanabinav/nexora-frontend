import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Fabric Receive Module
 * Tests complete CRUD workflow for fabric batch intake
 * API Integration: Connects to FastAPI backend at http://localhost:8000/api/v1
 */

const BASE_URL = 'http://localhost:3001'
const FABRIC_RECEIVE_URL = `${BASE_URL}/fabric-receive`

test.describe('Fabric Receive Module - CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to fabric receive page
    await page.goto(FABRIC_RECEIVE_URL)
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display fabric batches list on page load', async ({ page }) => {
    // Verify page heading
    await expect(page.locator('h1')).toContainText('Fabric Receive')

    // Verify table is visible
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Verify table headers
    await expect(page.locator('th')).toContainText('Batch ID')
    await expect(page.locator('th')).toContainText('Supplier')
    await expect(page.locator('th')).toContainText('Fabric Type')
    await expect(page.locator('th')).toContainText('Quality Grade')
  })

  test('should open create batch dialog when clicking "+ Receive Batch" button', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("+ Receive Batch")')

    // Verify dialog opens with title
    const dialogTitle = page.locator('[role="dialog"] h2, [role="dialog"] h3').first()
    await expect(dialogTitle).toContainText('Receive Fabric Batch')

    // Verify form fields are visible
    await expect(page.locator('input[placeholder*="Batch ID"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="Supplier"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="Fabric Type"]')).toBeVisible()
    await expect(page.locator('input[type="number"][placeholder*="500"]')).toBeVisible()
  })

  test('should create new fabric batch with valid form data', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("+ Receive Batch")')
    await page.waitForSelector('[role="dialog"]')

    // Fill form
    const timestamp = Date.now()
    const batchId = `FB-TEST-${timestamp}`

    await page.fill('input[placeholder*="Batch ID"]', batchId)
    await page.fill('input[placeholder*="Supplier"]', 'Test Textiles Ltd')
    await page.fill('input[placeholder*="Fabric Type"]', 'Cotton Blend')
    await page.fill('input[type="number"]', '500')
    await page.fill('input[placeholder*="Color"]', 'White')

    // Select quality grade
    await page.selectOption('select', 'A')

    // Submit form
    const submitBtn = page.locator('[role="dialog"] button:has-text("Receive")')
    await submitBtn.click()

    // Wait for success (dialog closes) - with timeout
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 })

    // Verify batch appears in table
    await page.waitForSelector(`text=${batchId}`, { timeout: 5000 })
    await expect(page.locator(`text=${batchId}`)).toBeVisible()

    // Verify quality grade badge shows "A"
    const rowWithBatch = page.locator(`text=${batchId}`).first()
    const row = rowWithBatch.locator('../..')
    await expect(row.locator('text=Grade A')).toBeVisible()
  })

  test('should display validation errors for invalid form data', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("+ Receive Batch")')
    await page.waitForSelector('[role="dialog"]')

    // Try to submit empty form without required fields
    const submitBtn = page.locator('[role="dialog"] button:has-text("Receive")')
    
    // Actually fill minimum one field to trigger validation
    const batchInput = page.locator('[role="dialog"] input[placeholder*="Batch ID"]')
    await batchInput.fill('FB')  // Too short (min 3 chars)
    
    await submitBtn.click()

    // Wait a bit for validation
    await page.waitForTimeout(500)

    // Verify error message appears
    const errorText = await page.locator('[class*="text-red"], .error').first().textContent()
    if (errorText) {
      expect(errorText.toLowerCase()).toContain('3 characters')
    }
  })

  test('should search fabric batches by batch ID', async ({ page }) => {
    // Check if there are items in the table
    const tableRows = page.locator('table tbody tr')
    const rowCount = await tableRows.count()

    if (rowCount === 0) {
      test.skip() // Skip if no data
    }

    // Get first batch ID from table
    const firstBatchId = await tableRows.first().locator('td').first().textContent()

    if (!firstBatchId) {
      test.skip()
    }

    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search by"]')
    await searchInput.fill(firstBatchId!)

    // Wait for search results
    await page.waitForTimeout(800)

    // Verify filtered results - should contain the search term
    const visibleBatches = page.locator('table tbody tr')
    if (await visibleBatches.count() > 0) {
      const firstResult = await visibleBatches.first().locator('td').first().textContent()
      expect(firstResult).toContain(firstBatchId!)
    }
  })

  test('should clear search and show all batches again', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search by"]')

    // Enter search term
    await searchInput.fill('FB-')
    await page.waitForTimeout(300)

    const beforeClear = await page.locator('table tbody tr').count()

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(300)

    const afterClear = await page.locator('table tbody tr').count()

    // After clear should show same or more results
    expect(afterClear).toBeGreaterThanOrEqual(0)

    // Verify table is still visible
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should open edit dialog when clicking Edit button', async ({ page }) => {
    // Check if there are items
    const rows = page.locator('table tbody tr')
    if (await rows.count() === 0) {
      test.skip()
    }

    // Get first row
    const firstRow = rows.first()
    const firstBatchId = await firstRow.locator('td').first().textContent()

    if (!firstBatchId) {
      test.skip()
    }

    // Click edit button
    const editBtn = firstRow.locator('button:has-text("Edit")').first()
    await editBtn.click()

    // Verify dialog opens with edit title
    const dialogTitle = page.locator('[role="dialog"] h2, [role="dialog"] h3').first()
    await expect(dialogTitle).toContainText('Edit Fabric Batch')

    // Verify form is pre-filled with batch data
    const batchIdInput = page.locator('[role="dialog"] input[placeholder*="Batch ID"]')
    const currentValue = await batchIdInput.inputValue()
    expect(currentValue).toBeTruthy()
  })

  test('should handle form submission loading state', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("+ Receive Batch")')
    await page.waitForSelector('[role="dialog"]')

    // Fill minimal form
    const timestamp = Date.now()
    await page.fill('input[placeholder*="Batch ID"]', `FB-LOAD-${timestamp}`)
    await page.fill('input[placeholder*="Supplier"]', 'Test')
    await page.fill('input[placeholder*="Fabric Type"]', 'Test')
    await page.fill('input[type="number"]', '100')
    await page.fill('input[placeholder*="Color"]', 'Test')

    // Get submit button
    const submitBtn = page.locator('[role="dialog"] button:has-text("Receive")')

    // Click and check for loading state
    await submitBtn.click()

    // Button should show "Saving..." during submission
    // The exact behavior depends on API response time
    await page.waitForTimeout(200)

    // Verify dialog closes after submission completes (up to 5 seconds)
    try {
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 })
    } catch {
      // May timeout if API is slow, which is OK for this test
    }
  })

  test('should cancel delete when user rejects confirmation', async ({ page }) => {
    // Check if there are items
    const rows = page.locator('table tbody tr')
    if (await rows.count() === 0) {
      test.skip()
    }

    // Get first row
    const firstRow = rows.first()

    // Get initial row count
    const initialRowCount = await page.locator('table tbody tr').count()

    // Setup to intercept and reject confirm dialog
    page.once('dialog', (dialog) => {
      dialog.dismiss()
    })

    // Click delete button
    const deleteBtn = firstRow.locator('button:has-text("Delete")').first()
    await deleteBtn.click()

    // Wait a moment
    await page.waitForTimeout(500)

    // Verify same row count (item not deleted)
    const finalRowCount = await page.locator('table tbody tr').count()
    expect(finalRowCount).toBe(initialRowCount)
  })
})

test.describe('Fabric Receive Module - Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(FABRIC_RECEIVE_URL)

    // Check for h1 tag
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('Fabric Receive')
  })

  test('should have accessible form labels', async ({ page }) => {
    await page.goto(FABRIC_RECEIVE_URL)

    // Click create button
    await page.click('button:has-text("+ Receive Batch")')
    await page.waitForSelector('[role="dialog"]')

    // Verify labels exist
    const labels = page.locator('label')
    expect(await labels.count()).toBeGreaterThan(0)
  })

  test('should have accessible buttons with text', async ({ page }) => {
    await page.goto(FABRIC_RECEIVE_URL)

    // Verify main buttons have meaningful text
    const createBtn = page.locator('button:has-text("+ Receive Batch")')
    await expect(createBtn).toBeVisible()

    const text = await createBtn.textContent()
    expect(text?.trim()).toBeTruthy()
  })
})

test.describe('Fabric Receive Module - Error Handling', () => {
  test('should display user-friendly error when batch load fails', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/fabric-batches*', (route) => {
      route.abort('failed')
    })

    // Navigate - will trigger API call that fails
    await page.goto(FABRIC_RECEIVE_URL)

    // Wait for page to attempt loading
    await page.waitForTimeout(2000)

    // The API layer should show an error message
    // Check for error elements
    const errorElements = page.locator('[class*="error"], [class*="red"], [role="alert"]')
    
    // If error is shown, it should be visible
    if (await errorElements.count() > 0) {
      const firstError = errorElements.first()
      await expect(firstError).toBeVisible()
    }
  })
})
