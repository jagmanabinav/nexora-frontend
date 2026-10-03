# Nexora Frontend Monorepo

A scalable, multi-app frontend monorepo for the Nexora multi-tenant SaaS platform.

## 📦 Packages

### `packages/shared`
Shared code used by all applications:
- **API Client**: Centralized Axios instance for all backend endpoints
- **Hooks**: React hooks for auth, data fetching, state management
- **Components**: Reusable UI components (Button, Input, Table, etc)
- **Types**: TypeScript types for all entities
- **Providers**: Context providers (Auth, Tenant, App)

### `packages/admin`
Super admin dashboard - Platform management:
- Tenant management (CRUD)
- Application registry
- Billing plans
- User management
- Platform settings

### `packages/fabwash`
FabWash application - Laundry management:
- Fabric receiving workflow
- DC (Cleaning/Pressing) management
- Invoice generation
- Customer management
- Business reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers for all apps
pnpm dev

# Or start a specific app
pnpm --filter admin dev
pnpm --filter fabwash dev
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:admin
pnpm build:fabwash
pnpm build:shared
```

## 📂 Project Structure

```
frontend/
├── packages/
│   ├── shared/           # Shared package (API, hooks, components)
│   ├── admin/            # Admin dashboard (Next.js app)
│   └── fabwash/          # FabWash app (Next.js app)
├── package.json
├── pnpm-workspace.yaml   # Monorepo config
├── tsconfig.json         # Base TypeScript config
├── tailwind.config.js    # Shared Tailwind config
├── .eslintrc.json        # ESLint rules
└── .prettierrc.json      # Code formatting
```

## 🔧 Development Commands

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Code formatting
pnpm format

# Check formatting
pnpm format:check
```

## 🌐 Running Apps Locally

After `pnpm dev`, access:
- **Admin**: http://localhost:3000
- **FabWash**: http://localhost:3001

## 🔌 API Integration

All apps use the centralized API client from `@nexora/shared`:

```typescript
import { apiClient } from '@nexora/shared/api'

// All endpoints available
await apiClient.auth.login(email, password)
await apiClient.tenants.list()
await apiClient.billing.getPlans()
```

## 📚 Documentation

- [Backend Analysis](../BACKEND_ANALYSIS.md)
- [SaaS Architecture](../SAAS_ARCHITECTURE.md)
- [Frontend Monorepo Plan](../FRONTEND_MONOREPO_PLAN.md)

## 🚀 Adding a New App

To add a new application (e.g., Retail):

1. Copy existing app structure:
   ```bash
   cp -r packages/fabwash packages/retail
   ```

2. Update `packages/retail/package.json`:
   - Change `name` to `retail`
   - Change dev port to `3002`

3. Update app routes and components for the new domain

That's it! The new app inherits all shared code and requires **zero changes** to the backend.

## 📋 Phases Completed

- ✅ **Phase 0**: Monorepo foundation setup
- 🔄 **Phase 1**: Building shared package (in progress)
- ⏳ **Phase 2**: Building admin app
- ⏳ **Phase 3**: Building FabWash app
- ⏳ **Phase 4**: Polish & production

## 📝 License

Internal - Nexora SaaS Platform
