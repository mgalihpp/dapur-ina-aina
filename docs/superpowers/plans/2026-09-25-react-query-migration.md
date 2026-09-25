# React Query Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every client data read and write use TanStack React Query, using existing TanStack Start server functions as `queryFn`/`mutationFn`, and add a non-blocking global top progress indicator.

**Architecture:** A root `QueryClientProvider` owns one browser query client (and a request-scoped client during SSR). Central query-key factories and small feature query/mutation modules wrap every existing `createServerFn`; components keep only form, filter, cart, and presentation state. Mutations invalidate affected domain prefixes instead of manually refetching local state. `beforeLoad` session guards and server-side authorization remain outside the client cache boundary.

**Tech Stack:** React 19, TanStack Start 1.168, TanStack Query v5, TypeScript, Tailwind v4, Biome, Prisma/MySQL.

**Spec:** User-approved in-chat design; preserve all PRD order, payment, stock, role, and Decimal rules.

## Global Constraints

- Do not introduce REST endpoints or a second data-fetching mechanism; existing `createServerFn` calls are the transport.
- Every component-side domain server-function call must be reachable through a `useQuery`, `useQueries`, or `useMutation` hook.
- Route `beforeLoad` auth guards remain direct server-side session checks; they are not client data queries.
- Never use optimistic updates for order, payment, stock, or restock mutations; invalidate/refetch after settlement.
- Preserve money as serialized strings at the server boundary; do not introduce floating-point totals.
- Do not edit `src/routeTree.gen.ts`.
- Do not run destructive database commands.

---

### Task 1: Install and wire the query runtime

**Files:**
- Modify: `package.json`
- Create: `src/lib/query-client.tsx`
- Create: `src/components/QueryProgressBar.tsx`
- Modify: `src/routes/__root.tsx`

- [ ] Add `@tanstack/react-query` as a runtime dependency.
- [ ] Create a stable `QueryClient` with a browser singleton and a fresh server-side instance, with bounded query retry, disabled mutation retry, and short cache settings.
- [ ] Wrap the root document contents in `QueryClientProvider`.
- [ ] Add a fixed, pointer-events-none animated top bar driven by `useIsFetching()` and `useIsMutating()`.
- [ ] Run `bun run check` and verify the provider renders through the root document.

### Task 2: Centralize query keys and server-function adapters

**Files:**
- Create: `src/lib/query-keys.ts`
- Create: `src/lib/query-helpers.ts`
- Create: `src/lib/query-errors.ts`

- [ ] Define stable prefix and parameterized keys for auth, dashboard, products, categories, tables, stock, orders, payments, reports, users, and public flows.
- [ ] Normalize optional filter values so equivalent filters share cache entries.
- [ ] Add typed helpers that convert existing server-function input wrappers (`{ data: ... }`) to React Query function arguments without changing server contracts.
- [ ] Preserve server function return types through `Awaited<ReturnType<...>>` or inferred option factories.

### Task 3: Migrate admin and product surfaces

**Files:**
- Create: `src/features/admin/queries.ts`
- Create: `src/features/admin/mutations.ts`
- Create: `src/features/products/queries.ts`
- Create: `src/features/products/mutations.ts`
- Modify: `src/features/admin/components/AdminDashboard.tsx`
- Modify: `src/features/admin/components/CategoriesView.tsx`
- Modify: `src/features/admin/components/TablesView.tsx`
- Modify: `src/features/admin/components/StockView.tsx`
- Modify: `src/features/admin/components/UsersView.tsx`
- Modify: `src/features/products/components/ProductsView.tsx`
- Modify: `src/features/products/components/ProductFormView.tsx`
- Modify: `src/routes/admin.menu.$productId.edit.tsx`

- [ ] Replace all initial/manual domain reads with query hooks using `useQuery`.
- [ ] Replace all create/update/delete/restock handlers with mutation hooks using `useMutation`.
- [ ] Invalidate category, product, table, stock, dashboard, and catalog prefixes according to the mutation's actual side effects.
- [ ] Keep form fields, editing selection, filters, and toast/notice text local.
- [ ] Remove obsolete `useEffect` data-fetch blocks and manual refresh functions.

### Task 4: Migrate POS, orders, payments, and reports

**Files:**
- Create: `src/features/kasir/queries.ts`
- Create: `src/features/kasir/mutations.ts`
- Create: `src/features/orders/queries.ts`
- Create: `src/features/orders/mutations.ts`
- Create: `src/features/reports/queries.ts`
- Create: `src/features/reports/mutations.ts`
- Modify: `src/features/kasir/components/PosView.tsx`
- Modify: `src/features/kasir/components/KasirDashboardView.tsx`
- Modify: `src/features/kasir/components/KasirStockView.tsx`
- Modify: `src/features/orders/components/OrdersView.tsx`
- Modify: `src/features/reports/components/ReportsView.tsx`

- [ ] Use `useQuery` for catalog, dashboard, stock, order list, and order detail; use `useQueries` for parallel public order details where applicable.
- [ ] Use `useMutation` for order creation, payment recording, status changes, and report generation.
- [ ] Keep URL search filters and the existing debounce, but let query keys and `placeholderData: keepPreviousData` manage cache transitions.
- [ ] Invalidate order, stock, catalog, dashboard, and report prefixes only on the matching successful mutation.
- [ ] Keep stock/payment/order behavior authoritative on the server; do not optimistically alter stock or order state.

### Task 5: Migrate public and auth client operations

**Files:**
- Create: `src/features/public/queries.ts`
- Create: `src/features/public/mutations.ts`
- Create: `src/features/auth/queries.ts`
- Create: `src/features/auth/mutations.ts`
- Modify: `src/features/public/components/PublicMenuView.tsx`
- Modify: `src/features/public/components/PublicMejaView.tsx`
- Modify: `src/features/public/components/PublicOrderView.tsx`
- Modify: `src/features/public/components/PublicPesananView.tsx`
- Modify: `src/features/public/components/PublicPembayaranView.tsx`
- Modify: `src/features/auth/components/LoginForm.tsx`
- Modify: `src/features/admin/components/AdminSidebar.tsx`
- Modify: `src/features/kasir/components/KasirSidebar.tsx`

- [ ] Use query hooks for public catalog, tables, order detail, and saved guest order details.
- [ ] Use a mutation for public order creation and invalidate affected catalog/stock/order keys.
- [ ] Wrap Better Auth sign-in and sign-out in mutation hooks; clear protected query cache on sign-out and refresh session state on sign-in.
- [ ] Leave route `beforeLoad` calls (`ensureSession`/`getSession`) unchanged because they are navigation guards, not component data fetching.

### Task 6: Audit, test, and build

**Files:**
- Modify only files needed to fix audit or verification findings.

- [ ] Search `src/features` and route components for direct awaited server-function calls outside query/mutation modules.
- [ ] Confirm there are no `fetch`, axios, or direct Prisma imports in client components.
- [ ] Run `bun run check`.
- [ ] Run `bun --bun run build`.
- [ ] Run the existing Bun tests relevant to order-domain/validators/money/stores and report any failures before claiming completion.
- [ ] Review the final diff for accidental money, auth, stock, and payment changes.
