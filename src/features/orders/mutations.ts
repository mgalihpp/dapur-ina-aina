import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateKeys } from "@/features/shared/lib/invalidate";
import { dataQueryFn } from "@/lib/query-helpers";
import { invalidation, qk } from "@/lib/query-keys";
import { setOrderStatus } from "@/server/order-functions";
import { recordPayment } from "@/server/payment-functions";

const recordPaymentFn = dataQueryFn(recordPayment);
const setOrderStatusFn = dataQueryFn(setOrderStatus);

/** Bayaran mengubah status pembayaran → daftar/detail/dasbor/laporan. */
export function useRecordPayment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: recordPaymentFn,
		onSuccess: () =>
			invalidateKeys(queryClient, [
				...invalidation.orders,
				...invalidation.dashboard,
				qk.reports.root,
			]),
	});
}

/**
 * Ubah status: `dibatalkan` mengembalikan stok (baris `masuk`), jadi prefix
 * stok/katalog ikut di-invalidate bersama pesanan, dasbor, dan laporan.
 */
export function useSetOrderStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setOrderStatusFn,
		onSuccess: () =>
			invalidateKeys(queryClient, [
				...invalidation.orders,
				...invalidation.stock,
				...invalidation.dashboard,
				qk.reports.root,
				qk.tables.root,
			]),
	});
}
