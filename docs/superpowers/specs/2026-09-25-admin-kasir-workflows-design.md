# Admin and Cashier Workflows Design

**Status:** Approved for design; implementation not started
**Date:** 2026-09-25
**Source of truth:** `PRD-Dapur-Ina-Aina.md`

## Goal

Complete the restaurant's staff-facing workflows so admin and cashier can manage
products, inventory, orders, payments, billing, users, and sales reports. Keep
the existing TanStack Start, Better Auth, Prisma, and MySQL stack.

## Scope

Included:

- Admin dashboard, product/category management, inventory, transactions,
  reports, and user management.
- Cashier dashboard, POS order creation, transaction/payment/billing workflow,
  and read-only stock visibility.
- Authentication with either email or username and password.
- Server-side role checks and transactional order/payment/stock operations.

Excluded:

- Public customer menu, guest ordering, customer order lookup, and customer
  billing routes. The root route may continue to redirect to login.
- Reservations, delivery integrations, discounts, tax/service charges, and
  multi-branch inventory.

## Staff Pages

### Admin

| Route | Purpose |
|---|---|
| `/admin` | Sales dashboard plus low-stock alert (threshold: 5) |
| `/admin/orders` | All transactions, date/status/product filters, detail, payment/status actions, billing |
| `/admin/menu` | Product CRUD and category filter; stock is not directly editable after creation |
| `/admin/categories` | Category CRUD; reject deletion while products reference the category |
| `/admin/stock` | Restock, stock movement history, and product/type/date filters |
| `/admin/reports` | Existing weekly/monthly reports, drill-down, print, and CSV |
| `/admin/users` | Admin/kasir user CRUD |

Admin server functions may perform cashier operations, as required by the PRD.
Admin-only data management remains unavailable to cashiers.

### Cashier

| Route | Purpose |
|---|---|
| `/kasir` | Cashier dashboard, pending transaction summary, and low-stock alert |
| `/kasir/pos` | Product search/category selection, cart, quantity changes, and order creation |
| `/kasir/orders` | Transaction list and detail, filters, payment/status actions, and billing |
| `/kasir/stock` | Read-only current stock and low-stock visibility |

The cashier sidebar contains only working destinations. Admin navigation also
removes duplicate or out-of-scope placeholder items.

The order detail and billing show fields represented by the PRD/schema: order
number and date, managing cashier, item name, quantity, snapshot price, item
subtotal, stored order total, payment date, payment method/amount/status, and cash
change when applicable. Fake table/customer-count values are removed. Tax and
service-charge rows are removed.

## Server Boundaries

Use the existing `createServerFn` pattern and runtime `.validator()` functions.
Keep validation at request boundaries and every role check inside the handler;
route guards are navigation UX, not mutation authorization.

Organize server operations by responsibility:

- `order-functions.ts`: list/detail/filter, create, complete, and cancel.
- `payment-functions.ts`: create/update the single payment record before it is
  paid; reject any edit after it is paid.
- `stock-functions.ts`: restock, current stock, movement history, and low-stock
  query.
- `category-functions.ts`: category CRUD.
- `product-functions.ts`: product CRUD and category listing/filter support.
- `user-functions.ts`: admin-only user CRUD using Better Auth-compatible
  credential handling.
- `report-functions.ts`: retain existing report generation and role checks, but
  aggregate persisted/report totals with Decimal arithmetic rather than floats.

Use `ensureStaff` for transaction/order/payment operations and cashier stock
reads. Use `ensureAdmin` for user, category, product, restock, report, and
admin-only inventory history operations. Do not rely on client visibility for
authorization.

## Authentication and Users

The login identifier accepts either email or username and returns the same
generic invalid-credentials error for either path. Use Better Auth's username
support with its existing unique `username` field and disable the optional
`displayUsername` field to avoid an unnecessary column. Public sign-up remains
unavailable; only an admin can create staff accounts.

The user form includes name, email, username, password (required at creation,
optional when editing), and role (`admin` or `kasir`). New usernames and emails
must be unique. Server operations must hash passwords through Better Auth, never
store plaintext credentials, and enforce `ensureAdmin`.

An admin cannot delete their own account or remove/demote the last admin. A user
referenced by historical orders cannot be deleted; preserve the transaction
history and return a clear explanation instead.

## Order, Payment, and Stock Invariants

### Order creation

The client submits product IDs and positive integer quantities only. In one
Prisma transaction, the server:

1. Loads authoritative product prices and stock for available products.
2. Atomically decrements stock only when sufficient stock remains.
3. Creates the order as `diproses` and stores each price snapshot, quantity, and
   subtotal, tied to the authenticated staff member managing the order.
4. Stores the order total as the sum of detail subtotals.
5. Writes one `keluar` stock movement per product.

If any product is unavailable or any write fails, the whole transaction rolls
back. Prices/totals use Prisma `Decimal`; no binary floating-point arithmetic is
used for persisted money.

### Payment

One payment row exists per order. Its `jumlahBayar` represents the cumulative
amount received for that order. Before it becomes `lunas`, a cashier/admin may
update the cumulative amount; the payment method is selected once and remains
fixed. `jumlahBayar >= total` means `lunas`; otherwise it remains
`belum_lunas`. The cumulative amount must be positive. A paid payment cannot be
edited. The order stays `diproses` until explicitly completed after payment is
`lunas`.

Cash change is `jumlahBayar - total` only for a paid cash payment. Non-cash
payments show no change. The server is authoritative for status and change.

### Completion and cancellation

- `diproses` can become `selesai` only when its payment is `lunas`.
- `diproses` can become `dibatalkan` only when no payment record exists. Once
  any amount is recorded, the order cannot be canceled in v1; the payment must be
  completed instead.
- Cancellation, stock restoration, and `masuk` correction rows happen in one
  database transaction.
- Payment, completion, and cancellation serialize on the order or use conditional
  state updates so racing requests cannot both succeed or restore stock twice.
- `selesai` and `dibatalkan` are terminal in v1.

The schema has no void/refund payment state. Therefore v1 does not cancel an
order after any payment or model refunds.

### Inventory

Product creation may set initial stock, recorded as `masuk`. Editing a product
does not set an absolute stock value. Subsequent stock increases use the
restock operation, which increments the product and writes a positive `masuk`
movement in the same transaction. Sales and cancellations write their matching
`keluar`/`masuk` movements. Stock never goes negative. Low-stock means stock
`<= 5`.

Initial product creation and its initial-stock movement are also one transaction.

## Money Display

The database remains authoritative for decimal amounts. POS previews use exact
cent-based arithmetic from decimal price strings; the server recalculates from
current products. Order, dashboard, and report aggregations use Decimal-safe
arithmetic. Billing uses the stored order total and snapshot item values, not a
client-side recomputation. Currency display preserves fractional rupiah when
present and does not inject tax or service charges.

## Failure Handling

- Return actionable validation messages for invalid product, category, user,
  stock, date-range, and payment inputs.
- Return a conflict when stock changed before order creation or a status/payment
  transition is no longer allowed.
- Translate foreign-key restrict failures into clear category/product/user
  deletion messages without hiding unrelated database errors.
- Keep authentication errors generic and never serialize password hashes or
  credential-account data to clients.
- Refresh the displayed list/detail after successful mutations from persisted
  server data rather than trusting optimistic client-only state.

## Verification

Add focused tests for pure order-total, payment-state/change, and transition
rules. Verify server-function payloads and response fields when they change.
Run:

- `bun run check`
- `bun --bun run build`
- `bun run generate-routes`
- The focused Bun tests for order/payment domain logic.

Do not run database seed, reset, or push commands against an unverified/shared
database. If authentication requires a Prisma schema change, create a migration
and review it without applying it to a shared database.

## Delivery Order

1. Establish focused domain rules and shared transactional server operations.
2. Build cashier POS, transaction, payment, billing, dashboard, and stock-read
   screens on those server operations.
3. Add admin category, stock, product-filter, user, and transaction-management
   screens; add the dashboard stock alert and remove dead navigation.
4. Verify every server boundary, allowed state transition, exact money output,
   and generated route tree.
