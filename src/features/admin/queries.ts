import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import { dataQueryFn, passthroughQueryFn } from "@/lib/query-helpers";
import type { StockFilterKeyInput } from "@/lib/query-keys";
import { normalizeStockFilter, qk } from "@/lib/query-keys";
import { listCategories } from "@/server/category-functions";
import { getDashboard } from "@/server/dashboard-functions";
import { listMeja } from "@/server/meja-functions";
import { getStockOverview, listStockMoves } from "@/server/stock-functions";
import { listStaffUsers } from "@/server/user-functions";
import type { DashboardPeriod } from "./types";

const fetchDashboard = dataQueryFn(getDashboard);
const fetchStockMoves = dataQueryFn(listStockMoves);
const fetchStockOverview = passthroughQueryFn(getStockOverview);
const fetchCategories = passthroughQueryFn(listCategories);
const fetchTables = passthroughQueryFn(listMeja);
const fetchStaffUsers = passthroughQueryFn(listStaffUsers);

export function adminDashboardOptions(period: DashboardPeriod) {
	return queryOptions({
		queryKey: qk.dashboard.admin(period),
		queryFn: () => fetchDashboard({ period }),
	});
}

export function useAdminDashboard(period: DashboardPeriod) {
	return useQuery(adminDashboardOptions(period));
}

export function stockOverviewOptions() {
	return queryOptions({
		queryKey: qk.stock.overview,
		queryFn: () => fetchStockOverview(),
	});
}

export function useStockOverview() {
	return useQuery(stockOverviewOptions());
}

export function stockMovesOptions(filter: StockFilterKeyInput = {}) {
	const normalized = normalizeStockFilter(filter);
	return queryOptions({
		queryKey: qk.stock.moves(normalized),
		queryFn: () => fetchStockMoves(normalized),
		// Filter riwayat diganti sering; baris lama tetap tampil sampai hasil
		// baru datang supaya tabel tidak berkedip kosong.
		placeholderData: keepPreviousData,
	});
}

export function useStockMoves(filter?: StockFilterKeyInput) {
	return useQuery(stockMovesOptions(filter));
}

export const categoriesListOptions = queryOptions({
	queryKey: qk.categories.list,
	queryFn: () => fetchCategories(),
});

export function useCategories() {
	return useQuery(categoriesListOptions);
}

export const tablesListOptions = queryOptions({
	queryKey: qk.tables.adminList,
	queryFn: () => fetchTables(),
});

export function useTables() {
	return useQuery(tablesListOptions);
}

export const staffUsersListOptions = queryOptions({
	queryKey: qk.users.list,
	queryFn: () => fetchStaffUsers(),
});

export function useStaffUsers() {
	return useQuery(staffUsersListOptions);
}
