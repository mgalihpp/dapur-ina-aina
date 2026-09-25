import { queryOptions, useQuery } from "@tanstack/react-query";
import { dataQueryFn, passthroughQueryFn } from "@/lib/query-helpers";
import { qk } from "@/lib/query-keys";
import { getCashierDashboard } from "@/server/dashboard-functions";
import { listCashierCatalog } from "@/server/product-functions";
import { getStockOverview, listStockMoves } from "@/server/stock-functions";

const fetchCashierCatalog = passthroughQueryFn(listCashierCatalog);
const fetchCashierDashboard = passthroughQueryFn(getCashierDashboard);
const fetchStockOverview = passthroughQueryFn(getStockOverview);
const fetchStockMoves = dataQueryFn(listStockMoves);

export type CashierCatalogProduct = Awaited<
	ReturnType<typeof listCashierCatalog>
>[number];

export const cashierCatalogOptions = queryOptions({
	queryKey: qk.products.cashierCatalog,
	queryFn: () => fetchCashierCatalog(),
});

export function useCashierCatalog() {
	return useQuery(cashierCatalogOptions);
}

export const cashierDashboardOptions = queryOptions({
	queryKey: qk.dashboard.cashier,
	queryFn: () => fetchCashierDashboard(),
});

export function useCashierDashboard() {
	return useQuery(cashierDashboardOptions);
}

export const cashierStockOverviewOptions = queryOptions({
	queryKey: qk.stock.overview,
	queryFn: () => fetchStockOverview(),
});

export function useCashierStockOverview() {
	return useQuery(cashierStockOverviewOptions);
}

export const cashierStockMovesOptions = queryOptions({
	queryKey: qk.stock.moves(),
	queryFn: () => fetchStockMoves({}),
});

export function useCashierStockMoves() {
	return useQuery(cashierStockMovesOptions);
}
