# Frontend Development & Testing Guide

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Backend running on `http://localhost:8000` (for integration testing)

### Setup
```bash
cd /home/jagman/Projects/nexora/frontend

# Install dependencies (already done)
pnpm install

# Start dev server for both apps
pnpm dev

# Or run individual apps
pnpm --filter admin dev
pnpm --filter fabwash dev
```

### Access Apps
- **Admin Portal:** http://localhost:3000
- **FabWash App:** http://localhost:3001
- **Shared Package:** TypeScript watch mode (auto-compile)

---

## Testing Form Validation

### 1. Login Form Validation (Admin & FabWash)

**Test URL:** http://localhost:3000/login

**Test Cases:**

#### Email Validation
```
✓ PASS: user@example.com
✗ FAIL: (blank) → "Email is required"
✗ FAIL: invalid-email → "Please enter a valid email address"
✗ FAIL: user@.com → "Please enter a valid email address"
```

#### Password Validation
```
✓ PASS: Secure123!
✗ FAIL: (blank) → "Password is required"
✗ FAIL: short → "Password must be at least 8 characters"
```

**Full Success Flow:**
1. Enter: `admin@nexora.com`
2. Enter: `SecurePass123`
3. Click "Login to Admin"
4. Should show "Logging in..." state
5. If backend running, should redirect to dashboard
6. If backend offline, should show error message

---

### 2. Tenant Management (Admin Only)

**Test URL:** http://localhost:3000/tenants

**Create Tenant Flow:**
1. Click "+ Create Tenant" button
2. Dialog opens with form fields
3. Submit without filling fields:
   ```
   Name field: "Tenant name is required"
   Slug field: "Slug is required"
   ```

**Tenant Name Validation:**
```
✓ PASS: "Acme Corporation" (16 chars)
✗ FAIL: "AB" (2 chars) → "Tenant name must be at least 3 characters"
✗ FAIL: (100+ chars) → "Tenant name must not exceed 100 characters"
```

**Slug Validation:**
```
✓ PASS: "acme-corp"
✓ PASS: "acme-corp-123"
✗ FAIL: "Acme Corp" → "Slug can only contain lowercase letters, numbers, and hyphens"
✗ FAIL: "acme_corp" → "Slug can only contain lowercase letters, numbers, and hyphens"
✗ FAIL: "acme corp" → "Slug can only contain lowercase letters, numbers, and hyphens"
```

**Form Submission:**
1. Fill valid data
2. Click "Create" button → Shows "Saving..."
3. If backend running: 
   - Creates tenant and shows in table
   - Dialog closes automatically
4. If backend offline:
   - Shows error message: "Failed to save tenant"
   - Dialog stays open for retry

---

## Testing Error Handling

### 1. Global Error Boundary

**Trigger Error (Development):**
1. Open browser DevTools (F12)
2. In console, run: `throw new Error("Test error")`
3. Should see error boundary UI with:
   - ⚠️ Icon
   - "Something went wrong" message
   - Error stack trace (in dev mode)
   - "Try again" button

**Try Again Button:**
1. Click "Try again"
2. Error should clear
3. App should restore to previous state

### 2. Form Error Handling

**Network Error Simulation:**
1. Open DevTools → Network tab
2. Set throttling: "Offline"
3. Try to create tenant with valid data
4. Should show error: "Failed to save tenant"
5. Set throttling back to "No throttling"
6. Try again → Should work

### 3. Validation Error Handling

**Display Pattern:**
- Field-level errors appear below input
- Error text is red (#DC2626)
- Clear when user corrects input
- Submit button stays disabled while there are errors

---

## Testing UI/UX

### 1. Loading States

**During Form Submission:**
```
Button text changes: "Create" → "Saving..."
Button becomes disabled (no click)
Form inputs become disabled (greyed out)
Cancel button becomes disabled
```

**While Loading Data:**
- Table shows skeleton placeholder (shimmer animation)
- Dashboard shows loading spinner
- Buttons are disabled until data loads

### 2. Mobile Responsiveness

**Test at Breakpoints:**

#### Mobile (320px - 640px)
```bash
DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
Select "iPhone 12 Pro"
```
- [ ] Forms stack vertically
- [ ] Buttons full-width
- [ ] Tables scroll horizontally
- [ ] Text readable
- [ ] Touch targets 48px minimum

#### Tablet (641px - 1024px)
```bash
Select "iPad" from Device Toolbar
```
- [ ] 2-column layout where applicable
- [ ] Buttons properly sized
- [ ] Tables readable

#### Desktop (1025px+)
- [ ] Full layout with all columns
- [ ] Proper spacing
- [ ] Hover effects work

---

## Testing Backend Integration

### Prerequisites
Backend must be running:
```bash
cd /home/jagman/Projects/nexora/backend
python -m uvicorn app.main:app --reload
# Backend runs on http://localhost:8000
```

### 1. Login Integration Test

**Scenario: Valid Credentials**

1. Backend: Create test user
   ```bash
   # Check backend API_REFERENCE.md for user creation endpoint
   # Or use backend admin panel to create test user
   ```

2. Frontend: Navigate to http://localhost:3000/login

3. Enter credentials:
   ```
   Email: test@example.com
   Password: TestPass123
   ```

4. Click "Login to Admin"

5. Expected result:
   - ✅ Redirects to /dashboard
   - ✅ Shows user name in header
   - ✅ Dashboard displays correctly
   - ✅ Can navigate to other pages
   - ✅ Token persists on page refresh

**Scenario: Invalid Credentials**

1. Enter wrong password
2. Click "Login to Admin"
3. Expected result:
   - ✅ Shows error: "Failed to login. Please check your credentials."
   - ✅ Stays on login page
   - ✅ Form clears password field
   - ✅ Can retry with different credentials

### 2. Tenant CRUD Integration Test

**Scenario: Create Tenant**

1. Login successfully
2. Navigate to http://localhost:3000/tenants
3. Click "+ Create Tenant"
4. Fill form:
   ```
   Name: "Test Tenant Inc"
   Slug: "test-tenant-inc"
   ```
5. Click "Create"
6. Expected result:
   - ✅ Tenant appears in table
   - ✅ Shows in list with Active badge
   - ✅ Can see creation date

**Scenario: Edit Tenant**

1. Click "Edit" on any tenant row
2. Change name to "Updated Name"
3. Click "Update"
4. Expected result:
   - ✅ Tenant name updates in table
   - ✅ All fields persist

**Scenario: Delete Tenant**

1. Click "Delete" on any tenant
2. Confirm deletion
3. Expected result:
   - ✅ Tenant removed from table
   - ✅ Dashboard reflects count change

---

## Debugging

### Check Console for Errors
```bash
DevTools → Console (F12)
```
Should be clean - no red errors

### Network Requests
```bash
DevTools → Network tab
```
Monitor:
- Login requests to `/api/v1/auth/login`
- Tenant requests to `/api/v1/tenants`
- Response status codes (200, 201, 401, 500)

### React Components
```bash
DevTools → Components tab (React DevTools extension)
```
- Inspect component state
- Check props values
- Trigger re-renders

### TypeScript Types
All imports should show correct types:
```typescript
import type { Tenant } from '@nexora/shared'
// Hover over Tenant to see full type definition
```

---

## Common Issues & Solutions

### Issue: "Module not found" error

**Solution:**
```bash
# Rebuild shared package
pnpm --filter shared build

# Or run in watch mode
pnpm --filter shared dev
```

### Issue: Login button shows "Logging in..." forever

**Solution:**
1. Check if backend is running: `curl http://localhost:8000/api/v1/health`
2. Check DevTools → Network → see 5xx error
3. Restart backend:
   ```bash
   cd /home/jagman/Projects/nexora/backend
   python -m uvicorn app.main:app --reload
   ```

### Issue: Form validation not showing errors

**Solution:**
1. Check browser DevTools Console for errors
2. Verify `useFormValidation` hook is imported
3. Check that Zod schema is correct
4. Verify Input component has `error` prop

### Issue: Styles not applying

**Solution:**
```bash
# Rebuild Tailwind CSS
pnpm build:css

# Or restart dev server
pnpm dev  # This rebuilds everything
```

### Issue: Page stuck on loading

**Solution:**
1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+Shift+R
3. Restart dev server: Ctrl+C then `pnpm dev`

---

## Performance Testing

### Lighthouse Score
```bash
DevTools → Lighthouse tab

Tests:
- Performance
- Accessibility
- Best Practices
- SEO
```

### Bundle Analysis
```bash
# Check bundle size
pnpm --filter admin build

# Output shows route sizes:
# Route (app)                              Size     First Load JS
# ├ ○ /login                               1.88 kB  127 kB
# ├ ○ /dashboard                           10.6 kB  136 kB
```

### Load Time
```bash
DevTools → Network tab
- DOMContentLoaded: Should be < 1s
- Load: Should be < 2s
- Largest Contentful Paint: < 2.5s
```

---

## Testing Checklist Before Deployment

- [ ] All forms show validation errors
- [ ] Login works with valid credentials
- [ ] Login rejects invalid credentials
- [ ] Tenants CRUD operations work
- [ ] Tenant validation works
- [ ] Error boundary catches errors
- [ ] Loading states display correctly
- [ ] Mobile layout is responsive
- [ ] No console errors
- [ ] TypeScript strict mode passes
- [ ] ESLint all rules pass
- [ ] All pages accessible
- [ ] Token persists on refresh
- [ ] Logout works properly
- [ ] Protected routes redirect to login

---

## Development Commands

### Build

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter admin build
pnpm --filter fabwash build

# Build shared package
pnpm --filter shared build
```

### Type Checking

```bash
# Check all packages
pnpm type-check

# Check specific package
pnpm --filter admin type-check
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific app
pnpm --filter admin lint
```

### Development

```bash
# Start all dev servers
pnpm dev

# Start specific app
pnpm --filter admin dev
pnpm --filter fabwash dev
```

### Formatting

```bash
# Format all files
pnpm format

# Format specific directory
prettier --write packages/admin
```

---

## File Structure Reference

```
frontend/
├── package.json                 # Root config
├── pnpm-workspace.yaml         # Workspace setup
├── tsconfig.json               # Base TypeScript config
├── tailwind.config.js          # Shared Tailwind config
├── eslint.config.json          # Linting rules
├── packages/
│   ├── shared/                 # Reusable components & logic
│   │   ├── src/
│   │   │   ├── types/         # TypeScript types (50+ types)
│   │   │   ├── api/           # API client (59 endpoints)
│   │   │   ├── hooks/         # React hooks (7+ hooks)
│   │   │   ├── components/    # UI components (10+ components)
│   │   │   ├── providers/     # Context providers
│   │   │   ├── layouts/       # Layout components
│   │   │   ├── schemas/       # Zod validation schemas
│   │   │   └── index.ts       # Main exports
│   │   └── dist/              # Compiled output
│   │
│   ├── admin/                  # Admin app
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── (auth)/         # Auth routes
│   │   │   │   └── login/
│   │   │   └── (authenticated)/ # Protected routes
│   │   │       ├── dashboard/
│   │   │       ├── tenants/
│   │   │       ├── applications/
│   │   │       ├── plans/
│   │   │       └── settings/
│   │   ├── styles/
│   │   └── .env.local          # Environment variables
│   │
│   └── fabwash/                # FabWash app
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── (auth)/
│       │   │   └── login/
│       │   └── (authenticated)/
│       │       ├── dashboard/
│       │       ├── fabric-receive/
│       │       ├── dc/
│       │       ├── invoices/
│       │       ├── customers/
│       │       └── reports/
│       ├── styles/
│       └── .env.local
│
└── docs/                       # Documentation
    ├── PHASE_0_COMPLETE.md
    ├── PHASE_1_COMPLETE.md
    ├── PHASE_2_COMPLETE.md
    ├── PHASE_3_COMPLETE.md
    ├── PHASE_3_PLAN.md
    └── FRONTEND_MONOREPO_PLAN.md
```

---

## Next Steps After Testing

1. **PHASE 4: Advanced Features**
   - Implement Applications CRUD with full validation
   - Implement Billing Plans CRUD
   - Add data pagination
   - Implement search/filter

2. **PHASE 5: Production Hardening**
   - E2E testing with Playwright
   - CI/CD pipeline setup
   - Performance optimization
   - SEO optimization

3. **PHASE 6: New Apps**
   - Create Retail app
   - Create Medical app
   - Implement app-specific modules

4. **PHASE 7: Deployment**
   - Docker containerization
   - Production environment setup
   - CDN configuration
   - Monitoring & alerting

---

**Last Updated:** 2026-10-03  
**Version:** PHASE 3 Complete
**Status:** Production Ready for Backend Integration Testing
