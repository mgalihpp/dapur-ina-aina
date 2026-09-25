# Dapur Ina Aina

Restaurant order-to-cash system (PRD: `PRD-Dapur-Ina-Aina.md`). TanStack Start + React 19 + Prisma MySQL + Better-Auth + Tailwind v4 + shadcn. Single package, no monorepo.

## What makes this repo special?

1. **PRD is the spec.** `PRD-Dapur-Ina-Aina.md` defines roles, 8 tables, and business rules. If code conflicts with the PRD, flag it — don't silently follow the code.
2. **Money is DECIMAL, never float.** All prices/totals are `Decimal(10,2)` / `Decimal(12,2)` in Prisma and MySQL. Keep 2-decimal rounding consistent.
3. **Stock and payment rules are load-bearing.** Price snapshot at order time, atomic stock decrement, `selesai` requires `lunas`, 1 order = 1 payment. Get these wrong and the business breaks.

## A note from Galih

I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising.

Channel both "measure twice, cut once" and "yagni". Fight scope creep. Honor my intent in a minimal and realistic fashion.

The rest of this document is good defaults, not hard rules. My explicit request always overrides anything here. If a rule here fights the task, say so loudly and get sign-off before breaking it.

## A small glossary

- **you** means the agent reading this file and changing the code.
- **admin / kasir / pelanggan** are the three roles. Only `admin` and `kasir` log in; pelanggan is guest.
- **POS** means the kasir flow: menu → order → pay → billing.
- **lunas / belum_lunas**, **diproses / selesai / dibatalkan**, **tunai / non_tunai**, **masuk / keluar** are enum literals. Use them exactly.
- **tb_*** is the MySQL table prefix. Prisma models map to it via `@@map` (e.g. `Pesanan` → `tb_pesanan`).

## The three ways to hurt yourself

1. **Wiping real sales data.** MySQL holds orders, payments, stock moves. Never `db push --force-reset`, `migrate reset`, or seed against a shared/prod DB. `prisma/seed.ts` is idempotent but promotes `ADMIN_EMAIL` to admin — only run it on dev.
2. **Leaking secrets.** `.env` is gitignored and holds `DATABASE_URL` + `BETTER_AUTH_SECRET`. Copy from `.env.example`, never commit `.env`, never print secret values.
3. **Breaking money or auth.** Never switch prices to float, never enforce roles client-side only, never hand-edit `src/routeTree.gen.ts`.

## Hit every surface

The common defect here is fixing one role or one state and missing the rest. Before calling order/payment/stock work done, say which applied:

- **Roles.** Admin sees everything; kasir can't manage produk/kategori/user. Every mutation needs a server-side `role` check, not just a `beforeLoad` redirect.
- **Order states.** `diproses → selesai | dibatalkan`. `selesai` only if payment is `lunas`. `dibatalkan` must restore stock with a `masuk` correction row.
- **Payment states.** `jumlah_bayar >= total → lunas`, else `belum_lunas` and order stays `diproses`. Change only for tunai-lunas. No edit after `lunas` except by admin (v1: forbid edit, make a new order).
- **Stock moves.** Every decrement writes `tb_stok(jenis='keluar')`; every restock/cancel writes `jenis='masuk'`. Stock never goes negative — check + decrement inside one `prisma.$transaction`.
- **Reports.** Only `selesai` + `lunas` orders count. Period format is `YYYY-Www` (ISO week) or `YYYY-MM`.

## Dev servers

- `bun install` installs. Runtime is Bun 1.4.1 (`bun.lock` exists).
- `bun --bun run dev` starts TanStack Start on port 3000.
- `bun --bun run build` / `bun --bun run preview` for prod build check.
- DB ordering matters: set `DATABASE_URL` first, then `bun run db:push` (dev sync) or `bun run db:migrate` (versioned), then `bun run db:generate`, then `bun run db:seed`. Use `bun run db:studio` to inspect.
- Seed defaults: 3 categories (`Makanan Utama`, `Appetizer`, `Minuman`) + 1 admin via Better-Auth `signUpEmail`. Override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`. Default password warning is intentional.

## Verifying

- Smallest proof that fits the change: `bun run check` (Biome format+lint+organize-imports over `.`), plus `bun --bun run build` for route/server changes, plus the relevant `db:*` command for schema changes.
- Do not run repo-wide suites — there are none. No tests, no CI, no e2e. If you add logic for subtotal/total/kembalian or report aggregation, verify it by running the function, not by asserting it compiles.
- `bun run check:write` applies safe fixes; `bun run format` only formats. Prefer `check` to see problems first.
- `src/routeTree.gen.ts` is generated. If routes look stale, run `bun run generate-routes` rather than editing it.

## How it works

Browser → file routes in `src/routes/` → server functions (`createServerFn` in `src/server/*-functions.ts`) → Prisma (`src/lib/prisma.ts`, singleton via `globalThis`) → MySQL `db_dapur_ina_aina`. Auth is Better-Auth email+password with Prisma adapter (`src/lib/auth.ts`); session cookie via `tanstackStartCookies()`. Route guards call `ensureSession()` / `getSession()` in `beforeLoad` and branch on `userRoleOf()` (`src/lib/roles.ts`).

## Where code lives

- `PRD-Dapur-Ina-Aina.md` — binding spec: roles, FR-*, BR-1..BR-7, DDL, milestones.
- `src/routes/` — file-based routes. `__root.tsx` is the shell (Header/Footer/theme); `login.tsx` handles email login + role redirect; `admin.tsx` / `kasir.tsx` are stubs with role guards; `api/auth/$.ts` is the Better-Auth handler.
- `src/lib/` — `auth.ts` (Better-Auth config, `username`+`role` additional fields, `role` is `input:false`), `prisma.ts`, `roles.ts`, `utils.ts` (cn).
- `src/server/` — `createServerFn` server functions pakai `.validator()` (bukan `.inputValidator()` yang deprecated). `guards.ts` (ensureAdmin/ensureStaff), `validators.ts` (parse boundary tanpa `any`/`unknown`/`as`), `periode.ts` (logika periode murni). Mapper satu-pakai (`toRow`, dsb.) tetap lokal di tiap file.
- `prisma/` — `schema.prisma` (MySQL, `@@map` to `tb_*`, `Restrict` on kategori/produk deletes, `Cascade` pesanan→detail/pembayaran, `Pembayaran.pesananId @unique`), `seed.ts`, `migrations/`.
- `src/components/ui/` — shadcn radix-luma components. `components.json` aliases (`@/` → `src/`); `tsconfig.json` also maps `#/*` → `src/*` and `package.json` `imports` mirrors it.
- `biome.json` — tabs, double quotes, recommended lint, organize-imports on, respects `.gitignore`, ignores `dist/`.
- `vite.config.ts` — `devtools()`, `tailwindcss()`, `tanstackStart()`, `viteReact()`; `resolve.tsconfigPaths: true`.

## Taste

- Follow the PRD's suggested module split when adding features: `(public)/menu`, `pesanan/$id`, `kasir/`, `admin/`, plus `orderService` / `paymentService` / `stockService` / `reportService` with transactions — don't scatter Prisma calls across components.
- Inferred types over annotations. `Decimal` over `number` for money at the DB boundary.
- Keep `admin.tsx` / `kasir.tsx` guards in `beforeLoad` with `redirect`; don't move auth to effects.
- If a rule here fights the task, say so loudly and get sign-off before breaking it.

## Skill loading

Before a substantial edit, run `bunx @tanstack/intent@latest list` from the workspace root. If a skill matches the task, load it (`bunx @tanstack/intent@latest load <package>#<skill>`) and follow its `SKILL.md`. Prefer the most specific local skill.
