import { queryOptions, useQuery } from "@tanstack/react-query";
import { dataQueryFn, passthroughQueryFn } from "@/lib/query-helpers";
import { qk } from "@/lib/query-keys";
import { getCashierDashboard } from "@/server/dashboard-functions";
import { listMejaOccupancy } from "@/server/meja-functions";
import { getStockOverview, listStockMoves } from "@/server/stock-functions";

const fetchCashierDashboard = passthroughQueryFn(getCashierDashboard);
const fetchMejaOccupancy = passthroughQueryFn(listMejaOccupancy);
const fetchStockOverview = passthroughQueryFn(getStockOverview);
const fetchStockMoves = dataQueryFn(listStockMoves);

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

export const kasirMejaOccupancyOptions = queryOptions({
	queryKey: qk.tables.publicList,
	queryFn: () => fetchMejaOccupancy(),
	refetchInterval: 10_000,
});
