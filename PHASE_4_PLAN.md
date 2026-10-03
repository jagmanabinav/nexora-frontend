# PHASE 4: Advanced Features - IMPLEMENTATION PLAN

**Status:** Starting Now  
**Target Date:** Current Session  
**Scope:** Complete CRUD operations with advanced features  

## Phase 4 Objectives

### 1. Applications CRUD with Full Validation ✅ Planned
- **File**: `packages/admin/app/(authenticated)/applications/page.tsx`
- **Current State**: CRUD structure exists, needs validation integration
- **Updates Needed**:
  - Add `useFormValidation` with `ApplicationSchema`
  - Implement inline error messages
  - Add loading states during submission
  - Fix form data structure (currently has `webhook_url`, not in schema)
  - Display validation errors below fields

### 2. Billing Plans CRUD with Full Validation ✅ Planned
- **File**: `packages/admin/app/(authenticated)/plans/page.tsx`
- **Current State**: CRUD structure exists, needs validation
- **Updates Needed**:
  - Add `useFormValidation` with `BillingPlanSchema`
  - Implement all form fields (name, price, billing_period, features)
  - Add loading states
  - Inline error messages
  - Price formatting (currency display)
  - Billing period dropdown selector

### 3. Data Pagination ✅ Planned
- Add pagination controls to tables
- Create `usePagination` hook if needed
- Add page size selector (10, 25, 50 per page)
- Display "1-10 of 50" text
- Previous/Next buttons
- Go to page input

### 4. Search & Filter Functionality ✅ Planned
- Add search input to table headers
- Real-time filtering as user types
- Filter by status (Active/Inactive)
- Filter by date range (optional)
- Clear filters button
- Search results count

### 5. Bulk Operations ✅ Planned
- Checkboxes for selecting multiple rows
- "Select All" checkbox in header
- Bulk delete button
- Bulk status change (Active → Inactive)
- Shows "3 selected" text

### 6. FabWash Module Placeholders → Implementation ✅ Planned
- Fabric Receive module (full interface)
- DC Management module (full interface)
- Invoicing module (full interface)
- Customer Management module (full interface)
- Reporting module (full interface)

## Implementation Order

### Task 1: Applications CRUD Validation (1-2 hours)
```
1. Update form to use ApplicationSchema
2. Add useFormValidation hook
3. Add inline error messages
4. Add loading states
5. Test form validation
6. Build & verify
```

### Task 2: Billing Plans CRUD Validation (1-2 hours)
```
1. Update form to use BillingPlanSchema
2. Add useFormValidation hook
3. Add all form fields (features array)
4. Add loading states
5. Test form validation
6. Build & verify
```

### Task 3: Pagination Hook (1 hour)
```
1. Create usePagination hook
2. Add pagination logic (page, size, total)
3. Update Table component with pagination props
4. Add pagination controls to page
5. Test with mock data
```

### Task 4: Search & Filter (1-2 hours)
```
1. Add search input component
2. Add filter dropdown
3. Implement search logic
4. Implement filter logic
5. Update table with filtered data
6. Test search & filter
```

### Task 5: Bulk Operations (1 hour)
```
1. Add checkboxes to table rows
2. Add "Select All" checkbox
3. Track selected rows
4. Show bulk action buttons
5. Implement bulk delete
6. Test bulk operations
```

### Task 6: FabWash Modules (2-3 hours)
```
1. Implement Fabric Receive module
2. Implement DC Management module
3. Implement Invoicing module
4. Implement Customer Management module
5. Implement Reporting module
6. Add sample data/placeholders
```

## Estimated Timeline

- **Total Estimated Time**: 6-10 hours (1-2 sessions)
- **Code to Write**: 3,000-5,000 lines
- **Files to Modify**: 6-8 files
- **Files to Create**: 5-10 files

## Success Criteria

- ✅ Applications CRUD with full validation
- ✅ Billing Plans CRUD with full validation
- ✅ Pagination working on all tables
- ✅ Search functionality working
- ✅ Filter functionality working
- ✅ Bulk operations working
- ✅ All 5 FabWash modules implemented
- ✅ No console errors
- ✅ TypeScript strict mode passing
- ✅ ESLint all rules passing
- ✅ Both apps build successfully

## Files to Create/Modify

### New Files
- `/packages/shared/src/hooks/usePagination.ts` - Pagination hook
- `/packages/admin/app/(authenticated)/applications/page.tsx` - Enhanced
- `/packages/admin/app/(authenticated)/plans/page.tsx` - Enhanced
- `/packages/fabwash/app/(authenticated)/fabric-receive/page.tsx` - Full implementation
- `/packages/fabwash/app/(authenticated)/dc/page.tsx` - Full implementation
- `/packages/fabwash/app/(authenticated)/invoices/page.tsx` - Full implementation
- `/packages/fabwash/app/(authenticated)/customers/page.tsx` - Full implementation
- `/packages/fabwash/app/(authenticated)/reports/page.tsx` - Full implementation

### Modified Files
- `/packages/shared/src/components/Table.tsx` - Add pagination & selection
- `/packages/shared/src/components/index.ts` - Add new exports
- `/packages/shared/src/hooks/index.ts` - Add pagination hook

## Phase 4 Deliverables

1. ✅ Fully functional Applications CRUD with validation
2. ✅ Fully functional Billing Plans CRUD with validation
3. ✅ Pagination working on all data tables
4. ✅ Search & filter functionality
5. ✅ Bulk operations (select, delete, status change)
6. ✅ 5 FabWash modules with sample data
7. ✅ Comprehensive documentation
8. ✅ All tests passing

## Dependencies

- Phase 3 complete ✅ (Validation, Error handling)
- Zod schemas ✅ (Already created)
- Base CRUD pages ✅ (Already created)

## Known Limitations / Notes

1. Search is client-side (can be optimized to backend later)
2. Pagination is client-side (can add server-side pagination in PHASE 5)
3. FabWash modules will have mock data (will connect to backend in PHASE 5)
4. Bulk operations limited to 100 items (can optimize later)

## Next Phase (After PHASE 4)

- **PHASE 5**: Integration & Testing
  - E2E tests with Playwright
  - CI/CD pipeline setup
  - Performance optimization
  - Backend integration verification

---

**Next:** Start PHASE 4 implementation with Applications CRUD validation
