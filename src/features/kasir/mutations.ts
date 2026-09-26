import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateKeys } from "@/features/shared/lib/invalidate";
import { dataQueryFn } from "@/lib/query-helpers";
import { invalidation, qk } from "@/lib/query-keys";
import { createOrder } from "@/server/order-functions";

const createOrderFn = dataQueryFn(createOrder);

/**
 * Pesanan kasir memakai stok (keluar) dan mengubah daftar menu serta dasbor.
 * Semua refresh datang dari invalidasi, bukan refetch manual.
 */
export function useCreateOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createOrderFn,
		onSuccess: () =>
			invalidateKeys(queryClient, [
				...invalidation.stock,
				...invalidation.orders,
				...invalidation.dashboard,
				qk.tables.root,
			]),
	});
}
