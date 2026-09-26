import type { OrderFilterInput, StockFilterInput } from "@/server/validators";

const clean = (value: string | undefined): string | undefined =>
	value?.trim() || undefined;

const optionalId = (value: string | number | undefined): number | undefined => {
	if (value === undefined || value === "") return undefined;
	const id = Number(value);
	return Number.isInteger(id) && id > 0 ? id : undefined;
};

export type OrderFilterKeyInput = Pick<
	OrderFilterInput,
	"start" | "end" | "status" | "product"
>;

export type StockFilterKeyInput = Pick<
	StockFilterInput,
	"productId" | "type" | "start" | "end"
>;

export function normalizeOrderFilter(
	filter: OrderFilterKeyInput = {},
): OrderFilterKeyInput {
	return {
		start: clean(filter.start),
		end: clean(filter.end),
		status: clean(filter.status),
		product: clean(filter.product),
	};
}

export function normalizeStockFilter(
	filter: StockFilterKeyInput = {},
): StockFilterKeyInput {
	return {
		productId: optionalId(filter.productId),
		type: clean(filter.type),
		start: clean(filter.start),
		end: clean(filter.end),
	};
}

export const qk = {
	auth: {
		root: ["auth"] as const,
		session: ["auth", "session"] as const,
	},
	dashboard: {
		root: ["dashboard"] as const,
		adminRoot: ["dashboard", "admin"] as const,
		admin: (period: string) => ["dashboard", "admin", period] as const,
		cashier: ["dashboard", "cashier"] as const,
	},
	categories: {
		root: ["categories"] as const,
		list: ["categories", "list"] as const,
	},
	products: {
		root: ["products"] as const,
		adminRoot: ["products", "admin"] as const,
		adminList: ["products", "admin", "list"] as const,
		detailRoot: ["products", "admin", "detail"] as const,
		detail: (id: string | number) =>
			["products", "admin", "detail", String(id)] as const,
		cashierRoot: ["products", "cashier"] as const,
	},
	tables: {
		root: ["tables"] as const,
		adminList: ["tables", "admin", "list"] as const,
		publicList: ["tables", "public", "list"] as const,
	},
	stock: {
		root: ["stock"] as const,
		overview: ["stock", "overview"] as const,
		movesRoot: ["stock", "moves"] as const,
		moves: (filter: StockFilterKeyInput = {}) =>
			["stock", "moves", normalizeStockFilter(filter)] as const,
	},
	orders: {
		root: ["orders"] as const,
		listRoot: ["orders", "list"] as const,
		list: (filter: OrderFilterKeyInput = {}) =>
			["orders", "list", normalizeOrderFilter(filter)] as const,
		detailRoot: ["orders", "detail"] as const,
		detail: (id: string | number) => ["orders", "detail", String(id)] as const,
	},
	reports: {
		root: ["reports"] as const,
		list: ["reports", "list"] as const,
		detailRoot: ["reports", "detail"] as const,
		detail: (periode: string) => ["reports", "detail", periode] as const,
		rangeRoot: ["reports", "range"] as const,
		range: (start: string, end: string) =>
			["reports", "range", { start, end }] as const,
	},
	users: {
		root: ["users"] as const,
		list: ["users", "list"] as const,
	},
	public: {
		root: ["public"] as const,
		catalog: ["public", "catalog"] as const,
		orderRoot: ["public", "order"] as const,
		order: (id: string | number) => ["public", "order", String(id)] as const,
	},
} as const;

/** Prefix yang boleh di-invalidate bersama setelah mutation lintas domain. */
export const invalidation = {
	catalog: [qk.products.adminList, qk.public.catalog] as const,
	stock: [
		qk.stock.overview,
		qk.stock.movesRoot,
		qk.products.adminList,
		qk.public.catalog,
	] as const,
	dashboard: [qk.dashboard.adminRoot, qk.dashboard.cashier] as const,
	orders: [qk.orders.listRoot, qk.orders.detailRoot] as const,
} as const;
