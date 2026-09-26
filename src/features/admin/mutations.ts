import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateKeys } from "@/features/shared/lib/invalidate";
import { dataQueryFn } from "@/lib/query-helpers";
import { invalidation, qk } from "@/lib/query-keys";
import {
	createCategory,
	deleteCategory,
	updateCategory,
} from "@/server/category-functions";
import { createMeja, deleteMeja, renameMeja } from "@/server/meja-functions";
import { restockProduct } from "@/server/stock-functions";
import {
	createStaffUser,
	deleteStaffUser,
	updateStaffUser,
} from "@/server/user-functions";

const createCategoryFn = dataQueryFn(createCategory);
const updateCategoryFn = dataQueryFn(updateCategory);
const deleteCategoryFn = dataQueryFn(deleteCategory);
const createMejaFn = dataQueryFn(createMeja);
const renameMejaFn = dataQueryFn(renameMeja);
const deleteMejaFn = dataQueryFn(deleteMeja);
const restockFn = dataQueryFn(restockProduct);
const createStaffUserFn = dataQueryFn(createStaffUser);
const updateStaffUserFn = dataQueryFn(updateStaffUser);
const deleteStaffUserFn = dataQueryFn(deleteStaffUser);

/**
 * Nama kategori ikut tersimpan di baris produk (admin, kasir, katalog publik),
 * jadi perubahan kategori ikut me-refresh daftar produk.
 */
const categoryKeys = [
	qk.categories.root,
	qk.products.detailRoot,
	...invalidation.catalog,
];

const tableKeys = [qk.tables.root];
const userKeys = [qk.users.root];

export function useCreateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCategoryFn,
		onSuccess: () => {
			invalidateKeys(queryClient, categoryKeys);
			toast.success("Kategori ditambahkan.");
		},
	});
}

export function useUpdateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateCategoryFn,
		onSuccess: () => {
			invalidateKeys(queryClient, categoryKeys);
			toast.success("Kategori diubah.");
		},
	});
}

export function useDeleteCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteCategoryFn,
		onSuccess: () => {
			invalidateKeys(queryClient, categoryKeys);
			toast.success("Kategori dihapus.");
		},
	});
}

export function useCreateMeja() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createMejaFn,
		onSuccess: () => {
			invalidateKeys(queryClient, tableKeys);
			toast.success("Meja ditambahkan.");
		},
	});
}

export function useRenameMeja() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: renameMejaFn,
		onSuccess: () => {
			invalidateKeys(queryClient, tableKeys);
			toast.success("Meja diubah.");
		},
	});
}

export function useDeleteMeja() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteMejaFn,
		onSuccess: () => {
			invalidateKeys(queryClient, tableKeys);
			toast.success("Meja dihapus.");
		},
	});
}

/** Restock menulis baris `tb_stok` dan mengubah stok di semua daftar produk. */
export function useRestockProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: restockFn,
		onSuccess: () => {
			invalidateKeys(queryClient, invalidation.stock);
			toast.success("Stok ditambahkan.");
		},
	});
}

export function useCreateStaffUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createStaffUserFn,
		onSuccess: () => {
			invalidateKeys(queryClient, userKeys);
			toast.success("Pengguna ditambahkan.");
		},
	});
}

export function useUpdateStaffUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateStaffUserFn,
		onSuccess: () => {
			invalidateKeys(queryClient, userKeys);
			toast.success("Pengguna diubah.");
		},
	});
}

export function useDeleteStaffUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteStaffUserFn,
		onSuccess: () => {
			invalidateKeys(queryClient, userKeys);
			toast.success("Pengguna dihapus.");
		},
	});
}
