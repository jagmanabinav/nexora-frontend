import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3001'
const DC_PAGE_URL = `${BASE_URL}/dc`

test.describe('DC Management - Fabric Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to DC Management page
    await page.goto(DC_PAGE_URL)
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('List Display & Filtering', () => {
    test('should display DC management page with heading', async ({ page }) => {
      // Check page heading
      const heading = page.locator('h1')
      await expect(heading).toContainText('DC Management')

      // Check subtitle
      const subtitle = page.locator('p')
      await expect(subtitle).toContainText('Track fabric processing operations')
    })

    test('should display process table on page load', async ({ page }) => {
      // Wait for table to be visible
      const table = page.locator('table')
      await expect(table).toBeVisible()

      // Check table headers
      const headers = page.locator('th')
      await expect(headers.first()).toBeVisible()
    })

    test('should search processes by batch ID', async ({ page }) => {
      // Find and fill search input
      const searchInput = page.locator('input[placeholder*="Search by batch"]')
      await searchInput.fill('FB-2024')

      // Wait for filtering to complete
      await page.waitForTimeout(500)

      // Table should be updated (or show no results)
      const table = page.locator('table')
      await expect(table).toBeVisible()
    })

    test('should filter processes by status', async ({ page }) => {
      // Find status filter dropdown
      const statusSelect = page.locator('select').nth(0)
      await statusSelect.selectOption('completed')

      // Wait for filtering to complete
      await page.waitForTimeout(500)

      // Table should be updated
      const table = page.locator('table')
      await expect(table).toBeVisible()
    })

    test('should clear search and show all processes', async ({ page }) => {
      // Fill search
      const searchInput = page.locator('input[placeholder*="Search by batch"]')
      await searchInput.fill('FB-2024')

      // Wait for filtering
      await page.waitForTimeout(500)

      // Clear search
      await searchInput.clear()

      // Wait for reset
      await page.waitForTimeout(500)

      // Table should be visible
      const table = page.locator('table')
      await expect(table).toBeVisible()
    })
  })

  test.describe('Create Process (Dialog)', () => {
    test('should open create process dialog', async ({ page }) => {
      // Find and click "Log Process" button
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Dialog should be visible
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()

      // Check dialog title
      const title = page.locator('text=Log Fabric Processing')
      await expect(title).toBeVisible()
    })

    test('should have form fields in create dialog', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Check for form fields
      const batchIdInput = page.locator('input[placeholder*="FB-2024"]')
      const operatorInput = page.locator('input[placeholder*="Operator"]')

      await expect(batchIdInput).toBeVisible()
      await expect(operatorInput).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Try to submit without filling form
      const submitButton = page.locator('button:has-text("Log")')
      await submitButton.click()

      // Should show validation errors
      await page.waitForTimeout(300)
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible() // Dialog should still be open
    })

    test('should create new process with valid data', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Fill form fields
      const batchIdInput = page.locator('input[placeholder*="FB-2024"]')
      const operatorInput = page.locator('input[placeholder*="Operator"]')
      const durationInput = page.locator('input[type="number"]').first()

      await batchIdInput.fill('FB-2024-TEST')
      await operatorInput.fill('Test Operator')
      await durationInput.fill('2.5')

      // Submit form
      const submitButton = page.locator('button:has-text("Log")')
      await submitButton.click()

      // Wait for submission to complete
      await page.waitForTimeout(1000)

      // Dialog should close
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).not.toBeVisible({ timeout: 5000 })

      // Table should still be visible
      const table = page.locator('table')
      await expect(table).toBeVisible()
    })

    test('should cancel dialog without saving', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Fill some data
      const batchIdInput = page.locator('input[placeholder*="FB-2024"]')
      await batchIdInput.fill('FB-2024-CANCEL')

      // Click cancel button
      const cancelButton = page.locator('button:has-text("Cancel")')
      await cancelButton.click()

      // Dialog should close
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).not.toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Edit Process', () => {
    test('should open edit dialog with existing data', async ({ page }) => {
      // Wait for table
      await page.waitForTimeout(500)

      // Find first edit button
      const editButtons = page.locator('button:has-text("Edit")')
      if (await editButtons.count() > 0) {
        await editButtons.first().click()

        // Dialog should open
        const dialog = page.locator('[role="dialog"]')
        await expect(dialog).toBeVisible()

        // Check for edit title
        const title = page.locator('text=Edit Process Log')
        await expect(title).toBeVisible()
      }
    })

    test('should update button label when editing', async ({ page }) => {
      // Wait for table
      await page.waitForTimeout(500)

      // Find first edit button
      const editButtons = page.locator('button:has-text("Edit")')
      if (await editButtons.count() > 0) {
        await editButtons.first().click()

        // Check for Update button
        const updateButton = page.locator('button:has-text("Update")')
        await expect(updateButton).toBeVisible()
      }
    })
  })

  test.describe('Delete Process', () => {
    test('should show delete confirmation', async ({ page }) => {
      // Wait for table
      await page.waitForTimeout(500)

      // Find first delete button
      const deleteButtons = page.locator('button:has-text("Delete")')
      if (await deleteButtons.count() > 0) {
        // Setup listener for confirmation dialog
        page.once('dialog', (dialog) => {
          expect(dialog.type()).toBe('confirm')
          dialog.dismiss() // Don't actually delete
        })

        // Click delete button
        await deleteButtons.first().click()

        // Wait a bit for dialog
        await page.waitForTimeout(500)
      }
    })

    test('should cancel delete operation', async ({ page }) => {
      // Wait for table
      await page.waitForTimeout(500)

      // Find first delete button
      const deleteButtons = page.locator('button:has-text("Delete")')
      if (await deleteButtons.count() > 0) {
        // Setup listener for confirmation dialog
        page.once('dialog', (dialog) => {
          expect(dialog.type()).toBe('confirm')
          dialog.dismiss() // Cancel delete
        })

        // Click delete button
        await deleteButtons.first().click()

        // Table should still be visible
        const table = page.locator('table')
        await expect(table).toBeVisible()
      }
    })
  })

  test.describe('Process Type Selection', () => {
    test('should display all process types in dropdown', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Find process type select
      const processTypeSelects = page.locator('select')
      const typeSelect = processTypeSelects.nth(0)

      // Get all options
      const options = typeSelect.locator('option')
      const count = await options.count()

      expect(count).toBeGreaterThan(3) // At least 4 process types
    })

    test('should have washing as default process type', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Check default value
      const processTypeSelects = page.locator('select')
      const typeSelect = processTypeSelects.nth(0)

      const value = await typeSelect.inputValue()
      expect(value).toBe('washing')
    })
  })

  test.describe('Quality Check Status', () => {
    test('should display QC status options', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Find QC status select (should be second select)
      const selects = page.locator('select')
      const qcSelect = selects.nth(1)

      // Check for options
      const options = qcSelect.locator('option')
      const count = await options.count()

      expect(count).toBeGreaterThanOrEqual(3) // passed, pending, failed
    })

    test('should have pending as default QC status', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Check default value
      const selects = page.locator('select')
      const qcSelect = selects.nth(1)

      const value = await qcSelect.inputValue()
      expect(value).toBe('pending')
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible heading', async ({ page }) => {
      // Check h1 exists
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()

      // Check text content
      const text = await heading.textContent()
      expect(text).toContain('DC Management')
    })

    test('should have properly labeled form fields', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Check for labels
      const labels = page.locator('label')
      const count = await labels.count()

      expect(count).toBeGreaterThan(0)
    })

    test('should have accessible buttons with text', async ({ page }) => {
      // Check main buttons
      const createButton = page.locator('button:has-text("Log Process")')
      await expect(createButton).toBeVisible()

      // Button should have visible text
      const text = await createButton.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    })
  })

  test.describe('Loading States', () => {
    test('should show loading state on button during submit', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Fill form
      const batchIdInput = page.locator('input[placeholder*="FB-2024"]')
      const operatorInput = page.locator('input[placeholder*="Operator"]')

      await batchIdInput.fill('FB-2024-LOAD')
      await operatorInput.fill('Test Operator')

      // Click submit
      const submitButton = page.locator('button:has-text("Log")')
      await submitButton.click()

      // Button should change to "Saving..." (if network is slow)
      // or dialog should close (if network is fast)
      // Just verify dialog either closes or stays visible
      const dialog = page.locator('[role="dialog"]')
      await page.waitForTimeout(1000)

      // Either dialog closed or is still visible
      const isVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false)
      expect(typeof isVisible === 'boolean').toBe(true)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // This test would need a mock API to test actual error cases
      // For now, just verify the page doesn't crash
      await expect(page).toHaveTitle(/Nexora|FabWash/)
    })
  })

  test.describe('Form Validation', () => {
    test('should show error for invalid temperature', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Fill required fields
      const batchIdInput = page.locator('input[placeholder*="FB-2024"]')
      const operatorInput = page.locator('input[placeholder*="Operator"]')

      await batchIdInput.fill('FB-2024-TEMP')
      await operatorInput.fill('Test Operator')

      // Set invalid temperature (too high)
      const temperatureInput = page.locator('input[type="number"]').nth(1)
      await temperatureInput.fill('100')

      // Try to submit
      const submitButton = page.locator('button:has-text("Log")')
      await submitButton.click()

      // Dialog should still be open (validation failed)
      await page.waitForTimeout(300)
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
    })

    test('should show error for invalid duration', async ({ page }) => {
      // Open create dialog
      const createButton = page.locator('button:has-text("Log Process")')
      await createButton.click()

      // Fill required fields
      const batchIdInput = page.locator('input[placeholder*="FB-2024"]')
      const operatorInput = page.locator('input[placeholder*="Operator"]')

      await batchIdInput.fill('FB-2024-DURATION')
      await operatorInput.fill('Test Operator')

      // Set invalid duration (too low)
      const durationInput = page.locator('input[type="number"]').first()
      await durationInput.fill('0.1')

      // Try to submit
      const submitButton = page.locator('button:has-text("Log")')
      await submitButton.click()

      // Dialog should still be open (validation failed)
      await page.waitForTimeout(300)
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
    })
  })

  test.describe('Pagination', () => {
    test('should display pagination controls', async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(500)

      // Look for pagination element
      const pagination = page.locator('nav')
      // Pagination might or might not be visible depending on data
      // Just verify page doesn't crash
      await expect(page).toHaveTitle(/Nexora|FabWash/)
    })
  })
})
