import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import { dataQueryFn } from "@/lib/query-helpers";
import type { OrderFilterKeyInput } from "@/lib/query-keys";
import { normalizeOrderFilter, qk } from "@/lib/query-keys";
import { getOrderDetail, listOrders } from "@/server/order-functions";

const fetchOrderList = dataQueryFn(listOrders);
const fetchOrderDetail = dataQueryFn(getOrderDetail);

export function ordersListOptions(filter: OrderFilterKeyInput = {}) {
	const normalized = normalizeOrderFilter(filter);
	return queryOptions({
		queryKey: qk.orders.list(normalized),
		queryFn: () => fetchOrderList(normalized),
		// Filter diganti sering; baris lama tetap tampil sampai hasil baru datang
		// supaya daftar tidak berkedip kosong.
		placeholderData: keepPreviousData,
	});
}

export function useOrdersList(filter?: OrderFilterKeyInput) {
	return useQuery(ordersListOptions(filter));
}

export function orderDetailOptions(id: string | null) {
	return queryOptions({
		queryKey: qk.orders.detail(id ?? ""),
		queryFn: () => fetchOrderDetail({ id: id ?? "" }),
		enabled: Boolean(id),
		retry: false,
	});
}

export function useOrderDetail(id: string | null) {
	return useQuery(orderDetailOptions(id));
}
