# PHASE 3: Polish & Production Readiness - IMPLEMENTATION PLAN

**Status:** In Progress  
**Target Date:** Current Session  
**Scope:** Enhanced UX, Backend Integration, Validation, Error Handling  

## Phase 3 Objectives

### 1. Form Validation with Zod
- Install `zod` and `zod-validation-error` packages
- Create validation schemas for:
  - Login form (email, password)
  - Tenant creation/update (name, slug)
  - Application CRUD (name, description, app_id)
  - Billing plans (name, price, billing_period)
- Add real-time error messages on forms
- Show validation errors inline

### 2. Enhanced Loading States
- Replace spinners with **skeleton loading** for tables
- Add **loading bars** at top of page during data fetch
- Show **loading dialogs** during form submissions
- Add **disabled states** to buttons while loading
- Implement staggered skeleton animations

### 3. Error Boundaries & Error Handling
- Create global **ErrorBoundary** component (top of app)
- Create page-level **error.tsx** files for each section
- Implement **error handling** in all API calls
- Add **retry buttons** for failed requests
- Show **user-friendly error messages** instead of tech errors
- Log errors for debugging

### 4. Backend Integration
- Connect login flow to backend `/api/v1/auth/login`
- Connect tenant CRUD to backend endpoints
- Connect application CRUD to backend endpoints
- Connect billing plans CRUD to backend endpoints
- Implement token refresh flow
- Handle 401 (unauthorized) responses

### 5. Authentication Testing
- Test login with valid credentials
- Test login with invalid credentials
- Test protected route redirects
- Test token persistence across page refreshes
- Test logout flow
- Test token refresh when expired

### 6. Mobile Responsiveness
- Review Tailwind responsive classes
- Test on mobile breakpoints (sm, md, lg, xl)
- Adjust form layouts for mobile
- Fix table overflow on mobile
- Ensure touch-friendly button sizes
- Test navigation on mobile

## Implementation Order

1. **Install Zod** → Add to package.json and dependencies
2. **Create Validation Schemas** → In shared package
3. **Update Form Components** → Add validation and error display
4. **Create Loading States** → Skeleton components, spinners
5. **Create Error Handling** → ErrorBoundary, error pages
6. **Connect to Backend** → Update API calls to use real endpoints
7. **Test Auth Flow** → Login, register, token refresh
8. **Mobile Testing** → Responsive design verification

## Estimated Lines of Code

- Zod schemas: 300 lines
- Updated form components: 1,000 lines
- Loading/skeleton components: 800 lines
- Error handling: 500 lines
- Updated pages with validation: 2,000 lines
- Total: ~4,600 lines

## Success Criteria

- ✅ All forms have Zod validation
- ✅ Real-time error messages display
- ✅ Loading states look professional
- ✅ Error boundaries prevent full app crashes
- ✅ Backend endpoints connected
- ✅ Auth flow works end-to-end
- ✅ Mobile responsive at all breakpoints
- ✅ No console errors

## Files to Create/Modify

### New Files
- `/packages/shared/src/schemas/auth.ts` - Auth validation
- `/packages/shared/src/schemas/tenant.ts` - Tenant validation
- `/packages/shared/src/schemas/application.ts` - App validation
- `/packages/shared/src/schemas/billing.ts` - Billing validation
- `/packages/shared/src/schemas/index.ts` - Export all schemas
- `/packages/shared/src/components/Loading/Skeleton.tsx` - Skeleton loader
- `/packages/shared/src/components/Loading/TableSkeleton.tsx` - Table skeleton
- `/packages/admin/app/error.tsx` - Global error handler
- `/packages/fabwash/app/error.tsx` - Global error handler

### Modified Files
- `/packages/shared/src/components/index.ts` - Add new components
- `/packages/admin/app/(authenticated)/layout.tsx` - Add error boundary
- `/packages/fabwash/app/(authenticated)/layout.tsx` - Add error boundary
- All page.tsx files - Add form validation and error handling

## Phase 3 Milestones

- [ ] Zod installed and schemas created
- [ ] Form validation working
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Backend connected
- [ ] Auth flow tested
- [ ] Mobile responsive
- [ ] PHASE 3 COMPLETE

---

**Next:** Start implementation with Zod installation and schema creation
