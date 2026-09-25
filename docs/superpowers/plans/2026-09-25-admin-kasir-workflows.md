# Admin and Cashier Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver complete staff-facing admin and cashier order-to-cash workflows that obey the approved design and PRD business rules.

**Architecture:** Keep one set of server operations for orders, payments, stock and role-protected admin management, then build separate admin/cashier route shells over those operations. All order, payment, product-initial-stock, restock, and cancellation mutations use Prisma transactions; money stays Decimal in persistence and is serialized as decimal strings at API boundaries where calculations matter.

**Tech Stack:** TanStack Start file routes and `createServerFn`, React 19, Better Auth, Prisma 6/MySQL, Tailwind CSS v4, Bun.

**Spec:** `docs/superpowers/specs/2026-09-25-admin-kasir-workflows-design.md`

## Global Constraints

- The PRD is binding: `PRD-Dapur-Ina-Aina.md`.
- Money is Prisma `Decimal`; do not use binary floating-point for persisted or aggregated money.
- Server functions enforce `ensureStaff` or `ensureAdmin` inside every handler that accesses protected data.
- Stock cannot go below zero; order stock decrement and movement writes are atomic.
- One payment per order; cumulative partial payments stay `belum_lunas`; after any payment, v1 cancellation is blocked.
- `selesai` requires `lunas`; only `selesai` + `lunas` counts in reports.
- Do not run database push, migration apply, reset, or seed against an unverified/shared database.
- Do not hand-edit `src/routeTree.gen.ts`; run `bun run generate-routes`.

---

## File Map

### Domain and server

- Create `src/server/order-domain.ts`: pure decimal-safe order/payment/state helpers that can be tested without DB.
- Modify `src/server/validators.ts`: wire parsers for cart, payment, filters, stock, category and staff user inputs.
- Modify `src/server/order-functions.ts`: staff-authorized order list/detail/filter/create/status actions and safe serialized billing data.
- Create `src/server/payment-functions.ts`: payment creation and cumulative update, status and change computed server-side.
- Create `src/server/stock-functions.ts`: staff stock read and admin-only restock/history.
- Create `src/server/category-functions.ts`: admin CRUD and restricted delete feedback.
- Modify `src/server/product-functions.ts`: initial stock + movement transaction; never edit absolute stock; expose cashier catalog and admin filters.
- Create `src/server/user-functions.ts`: admin-only staff CRUD, password hash via Better Auth, admin safeguards.
- Modify `src/server/dashboard-functions.ts`, `src/server/report-functions.ts`, and related pure helpers: Decimal-safe totals and low-stock dashboard data.
- Modify `src/lib/auth.ts`, `src/lib/auth-client.ts`, and `src/features/auth/components/LoginForm.tsx`: username/email login via Better Auth username plugin, keeping public signup disabled.

### User interface and routes

- Modify order types/components: `src/features/orders/types.ts`, `OrdersView.tsx`, `OrderList.tsx`, `OrderDetail.tsx`, `InvoiceModal.tsx` to include filters/actions and schema-backed billing only.
- Modify products: `ProductsView.tsx`, `ProductFormView.tsx`, `ProductTable.tsx` to add category filter and remove edit-stock behavior.
- Create feature slices/components for category CRUD, inventory, user CRUD, cashier POS and cashier dashboard in `src/features/`.
- Create routes: `admin.categories.tsx`, `admin.stock.tsx`, `admin.users.tsx`, `kasir.pos.tsx`, `kasir.orders.tsx`, `kasir.stock.tsx`; modify admin/cashier layout/index routes to authorize the correct role.
- Modify `src/features/admin/components/AdminSidebar.tsx` and `src/features/kasir/components/KasirSidebar.tsx` to link only working routes.
- Generated `src/routeTree.gen.ts` is updated only through route generation.

### Verification

- Create focused Bun tests under `src/server/*.test.ts` for pure order/payment arithmetic and state rules.
- Run focused tests, `bun run check`, `bun run generate-routes`, and `bun --bun run build`.

---

## Task 1: Pure order and payment rules

**Files:** Create `src/server/order-domain.ts`, create `src/server/order-domain.test.ts`.

**Interfaces:**
- Produces `sumOrderTotal(items: { price: string; quantity: number }[]): string`, `paymentState(amount: string, total: string): "lunas" | "belum_lunas"`, `cashChange(amount: string, total: string, method: "tunai" | "non_tunai"): string | null`, `assertOrderTransition(status, paymentExists, target): void`.
- Decimal arithmetic uses `Prisma.Decimal`; no `number` conversion in these helpers.

- [ ] Add tests for qty multiplication, multiple-line totals with fractional values, partial/full/overpayment, non-cash/no change, forbidden completion before payment, cancellation after partial/full payment, and terminal states.
- [ ] Run `bun test src/server/order-domain.test.ts`; confirm missing-module failure.
- [ ] Implement only the pure helpers and exact expected errors.
- [ ] Run the focused test and `bun run check`.

## Task 2: Boundary validators and transactional order APIs

**Files:** Modify `src/server/validators.ts`, `src/server/order-functions.ts`, create `src/server/payment-functions.ts`, add/update `src/server/order-functions.test.ts` if pure test cases need extraction.

**Interfaces:**
- `createOrder({ items: { productId: number; quantity: number }[] })` returns persisted order id and serialized total.
- `setOrderStatus({ id: number; status: "selesai" | "dibatalkan" })` returns persisted order status.
- `recordPayment({ orderId: number; method: "tunai" | "non_tunai"; amount: string })` creates/updates one cumulative payment and returns `{ status, amount, total, change, method, date }` as decimal strings.
- `listOrders` and `getOrderDetail` return schema-backed fields, `subtotal`, payment detail, cashier and status; list accepts optional date/status/product search filters.

- [ ] Define parsers that reject non-positive IDs/quantities/amounts, malformed dates, invalid enums, empty carts, duplicate product lines (or combine duplicates before persistence), and excessive input sizes.
- [ ] Write server API tests or pure helper tests for invalid payloads and order/payment rules before mutations.
- [ ] Implement order creation transaction: verify active products and stock; use conditional `updateMany` stock decrement for each product; create order + price snapshots + detail subtotals + stock-out rows; calculate total with Decimal; associate `ensureStaff()` user id.
- [ ] Implement payment transaction with order/payment consistency checks, fixed method after first payment, cumulative amount updates only while unpaid, and serialization/conditional transition protection.
- [ ] Implement completion and cancellation transactions; cancellation requires no payment row and restores every detail quantity plus matching `masuk` correction rows exactly once.
- [ ] Extend list/detail to return no fake table/guest fields and provide product-name/date/status filters.
- [ ] Run focused tests, `bun run check`, and inspect the transaction code against race/retry cases.

## Task 3: Inventory and product/category management APIs

**Files:** Create `src/server/stock-functions.ts`, `src/server/category-functions.ts`; modify `src/server/product-functions.ts` and `src/server/validators.ts`.

**Interfaces:**
- `listCashierCatalog()` returns active products with serialized price, stock, category.
- `getStockOverview()` is staff-readable and returns product stock + low-stock flag.
- `restockProduct({ productId, quantity })` is admin-only and returns current stock.
- `listStockMoves({ productId?, type?, start?, end? })` is admin-only.
- `listCategories`, `createCategory`, `updateCategory`, `deleteCategory` are admin-only.
- Product create accepts initial stock and writes its `masuk` row in the same transaction. Product update has no stock input.

- [ ] Add validator tests for quantity, duplicate category name normalization, filter date order and IDs.
- [ ] Implement category CRUD; translate only Prisma FK restrict/unique violations to clear domain messages.
- [ ] Implement stock overview and low-stock query with staff authorization; implement restock and movement history with admin authorization and atomic increment/log.
- [ ] Refactor product creation so product and initial `masuk` movement are atomic; refactor update to omit stock; preserve product deletion restriction and do not mask unrelated DB failures.
- [ ] Run `bun run check` and test validation/domain behavior.

## Task 4: Username/email login and staff account management

**Files:** Modify `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/features/auth/components/LoginForm.tsx`, create `src/server/user-functions.ts`, create focused `src/server/user-domain.test.ts` if safeguards can be isolated.

**Interfaces:**
- Login accepts an identifier and password; email-shaped identifiers call `signIn.email`, other identifiers call Better Auth username sign-in.
- `listStaffUsers`, `createStaffUser`, `updateStaffUser`, `deleteStaffUser` are admin-only; responses exclude account/password hash data.

- [ ] Add Better Auth username server/client plugin with display username disabled; verify installed package types and schema requirements before edits. Do not add schema migration unless the installed plugin actually requires new DB fields.
- [ ] Update login form to identifier + password and retain a generic credential error and role redirect.
- [ ] Implement user CRUD with Better Auth's password hashing API; creation requires name/email/username/password/role, edit password is optional.
- [ ] Enforce unique email/username, prevent self-delete, prevent removal/demotion of last admin, and refuse deletion of users with pesanan history.
- [ ] Run focused tests and `bun run check`; inspect serialized user response for absence of hashes.

## Task 5: Cashier POS and cashier route access

**Files:** Create cashier feature components (catalog, cart and checkout) and routes `src/routes/kasir.pos.tsx`, `src/routes/kasir.orders.tsx`, `src/routes/kasir.stock.tsx`; modify `src/routes/kasir.tsx`, `src/features/kasir/index.ts`, and `KasirSidebar.tsx`.

**Interfaces:**
- POS consumes `listCashierCatalog()` and `createOrder()`; client submits only product IDs/quantities.
- Cashier order screen consumes shared `listOrders`, `getOrderDetail`, payment, and status functions.
- Cashier stock page consumes staff-readable stock overview only.

- [ ] Add role guard to cashier routes: allow kasir and admin, redirect unauthenticated users to login and admins to `/admin` only when appropriate for root cashier navigation.
- [ ] Build responsive POS product search/category selection and cart quantity controls; calculate preview from decimal-string cents without floating-point money arithmetic.
- [ ] On submit call create order; reload persisted order and show actionable stock conflict messages.
- [ ] Build cashier dashboard summary for pending orders and low-stock count; connect cashier sidebar links.
- [ ] Build cashier transactions/detail with payment, finish, cancel-before-payment, and print-billing actions; refresh from server after each mutation.
- [ ] Build read-only cashier stock table and verify no restock mutation is reachable to kasir.
- [ ] Run `bun run check` and `bun --bun run build`.

## Task 6: Shared transaction filters and billing

**Files:** Modify `src/features/orders/types.ts`, `OrdersView.tsx`, `OrderList.tsx`, `OrderDetail.tsx`, `InvoiceModal.tsx`, and order routes.

**Interfaces:**
- Billing uses persisted decimal-string subtotal/total/payment amount and only schema/PRD fields.
- Admin and cashier order pages share the operational view while server authorization controls accessible rows/actions.

- [ ] Add date/status/product filter controls bound to listOrders query; reset/empty/loading/error states remain explicit.
- [ ] Show date, cashier, status, item qty, snapshot price, computed/persisted subtotal, total, payment method/amount/status, payment date, and cash change only when applicable.
- [ ] Remove fake table/guest/customer and payment labels; remove tax and service charge; fix subtotal to reflect qty.
- [ ] Add controls for payment cumulative amount and permitted status transitions; disable controls only as UX while server checks remain authoritative.
- [ ] Ensure print CSS presents the same billing fields without application navigation chrome.
- [ ] Run `bun run check` and `bun --bun run build`.

## Task 7: Admin category, stock, and product screens

**Files:** Create admin category/stock feature components and routes `src/routes/admin.categories.tsx`, `src/routes/admin.stock.tsx`; modify `ProductsView.tsx`, `ProductFormView.tsx`, `ProductTable.tsx`, admin route layout and `AdminSidebar.tsx`.

**Interfaces:**
- Admin pages consume category, stock, restock, movement, and product functions from Task 3.
- Product form supports initial stock only for creation; edit mode does not submit stock.

- [ ] Add server-backed category list/create/update/delete UI with clear protected-delete and duplicate-name feedback.
- [ ] Add restock quantity form, current stock and filtered movement history; display incoming/outgoing amounts and date.
- [ ] Add product category filter and remove stock edits from product edit mode; preserve initial stock entry on create.
- [ ] Link the admin dashboard low-stock summary to inventory; retain threshold `<= 5`.
- [ ] Remove nonfunctional/duplicate sidebar destinations and add categories/stock routes.
- [ ] Run `bun run check` and `bun --bun run build`.

## Task 8: Admin user management and order/dashboard parity

**Files:** Create admin user feature/route `src/routes/admin.users.tsx`; modify admin order routing, `AdminDashboard.tsx`, `dashboard-functions.ts`, `report-functions.ts`, and admin sidebar.

**Interfaces:**
- User page consumes Task 4 user CRUD functions.
- Dashboard includes low-stock list/count while all money totals are serialized from Decimal-safe aggregation.
- Reports continue to include only completed + fully paid orders.

- [ ] Add user list/create/edit/delete UI with role selector, optional edit password, duplicate validation, and clear self/last-admin/history deletion errors.
- [ ] Add low-stock alert to admin and cashier dashboard data; use threshold `<= 5`.
- [ ] Replace report/dashboard float reductions with `Prisma.Decimal` sums; serialize at response boundary and preserve existing presentation types as needed.
- [ ] Update order routes so admin and kasir both access common transactions, while admin-only operations remain server-restricted.
- [ ] Remove remaining inert navigation items and ensure every displayed destination resolves.
- [ ] Run focused domain tests, `bun run check`, and `bun --bun run build`.

## Task 9: Route generation and integrated verification

**Files:** Generated `src/routeTree.gen.ts`; source files only if verification identifies a defect.

- [ ] Run `bun run generate-routes` and inspect the generated route tree for the intended paths.
- [ ] Run `bun test src/server/order-domain.test.ts` and any added focused server-domain tests.
- [ ] Run `bun run check` and resolve all introduced findings without unrelated bulk formatting.
- [ ] Run `bun --bun run build` and resolve route/server/client boundary failures.
- [ ] Inspect `git diff --check`, `git status --short`, and the final diff; confirm `.firecrawl/` and other pre-existing untracked user files remain untouched.
- [ ] Report any database migration requirement without applying it to an unverified database.
