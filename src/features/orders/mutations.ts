import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateKeys } from "@/features/shared/lib/invalidate";
import { dataQueryFn } from "@/lib/query-helpers";
import { invalidation, qk } from "@/lib/query-keys";
import { deleteOrder, setOrderStatus } from "@/server/order-functions";
import { recordPayment } from "@/server/payment-functions";

const recordPaymentFn = dataQueryFn(recordPayment);
const setOrderStatusFn = dataQueryFn(setOrderStatus);
const deleteOrderFn = dataQueryFn(deleteOrder);

/** Bayaran mengubah status pembayaran → daftar/detail/dasbor/laporan. */
export function useRecordPayment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: recordPaymentFn,
		onSuccess: (result) => {
			invalidateKeys(queryClient, [
				...invalidation.orders,
				...invalidation.dashboard,
				qk.reports.root,
			]);
			toast.success(
				result.status === "lunas"
					? "Pembayaran lunas."
					: "Pembayaran dicatat (belum lunas).",
			);
		},
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
		onSuccess: (_, variables) => {
			invalidateKeys(queryClient, [
				...invalidation.orders,
				...invalidation.stock,
				...invalidation.dashboard,
				qk.reports.root,
				qk.tables.root,
			]);
			toast.success(
				variables.status === "selesai"
					? "Pesanan selesai."
					: "Pesanan dibatalkan. Stok dikembalikan.",
			);
		},
	});
}

/** Hapus permanen pesanan dibatalkan (admin). Stok sudah kembali saat pembatalan. */
export function useDeleteOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteOrderFn,
		onSuccess: () => {
			invalidateKeys(queryClient, [
				...invalidation.orders,
				...invalidation.dashboard,
				qk.reports.root,
			]);
			toast.success("Pesanan dihapus permanen.");
		},
	});
}
