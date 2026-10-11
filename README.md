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

FabWash application - textile fabric washing operations:

- Fabric batch receiving
- Washing process and quality tracking
- Business-to-business customer management
- Textile service invoices and operations reports

The current backend in this workspace does not yet expose the FabWash textile-domain endpoints
(`fabric-batches`, `processes`, `customers`, or operational `reports`). The app reports these
missing APIs explicitly; those screens must not be treated as production-operational until matching
tenant-scoped backend endpoints and tests are deployed.

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

- **Nexora application selection and Admin portal**: http://localhost:3000
- **FabWash**: http://localhost:3001

Set `NEXT_PUBLIC_FABWASH_URL` in the Admin portal's deployment environment to the public FabWash
origin. The application-selection home links tenants to that product's registration page.

## 🔌 API Integration

All apps use the centralized API client from `@nexora/shared`:

```typescript
import { apiClient } from "@nexora/shared/api";

await apiClient.auth.login(email, password);
await apiClient.auth.getMe();
await apiClient.applications.list();
await apiClient.billing.plans.list();
await apiClient.billing.plans.list("fabwash"); // optional application-specific catalog
```

Configure `NEXT_PUBLIC_API_URL` as the backend origin (for example,
`https://api.example.com`) in each app's build/deployment environment. Requests use `/api/v1`
under that origin. Leaving it unset uses localhost during development and same-origin `/api/v1`
in production, which requires a reverse proxy to route API requests to the backend.

The shared auth provider stores access/refresh tokens in browser local storage. Use HTTPS in
production and configure the backend's CORS allowlist to include each deployed frontend origin.
UI permission checks only shape the interface; backend authorization remains authoritative.

## Company registration and tenant access

FabWash's public home page presents the available applications. A company selects FabWash,
submits company and owner details, and requests an active billing plan from FabWash's
application-specific catalog. New applications are
pending review: neither login nor API access is enabled until a Super Admin approves or rejects
the request. Approval activates the selected plan and makes the tenant owner account available.
This flow records the requested billing cycle and activates the plan on approval; payment
collection still needs a configured billing provider before the service is used for paid plans.

The FabWash `/invoice-samples` page shows two illustrative Indian GST invoice examples,
including intra-state CGST/SGST and inter-state IGST totals, and can be printed or saved as
a PDF. The sample GSTINs and business details are fictional; verify the applicable GST
classification and rate with a tax professional before issuing real invoices.

Tenant Admins can create workspace users from the FabWash **Team & Users** screen. The backend
checks the tenant's active subscription and enforces the plan's `max_users` limit on each create
request (the owner counts toward that limit).

Before applying migration `007_add_tenant_applications`, deploy the updated backend. To provision
the first Super Admin once, set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`,
`BOOTSTRAP_ADMIN_FIRST_NAME`, and `BOOTSTRAP_ADMIN_LAST_NAME` in the backend process environment,
then run from `nexora-backend`:

```bash
python -m alembic upgrade head
python scripts/bootstrap_super_admin.py
```

The bootstrap command requires a strong password, stores only its password hash, refuses to run
when platform-administrator permissions are already assigned, and does not print the password.
Keep the values out of source control and remove them from the environment after provisioning.

## Validation

```bash
pnpm --filter @nexora/shared test
pnpm type-check
pnpm lint
pnpm --filter admin build
pnpm --filter fabwash build
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
