import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateKeys } from "@/features/shared/lib/invalidate";
import { dataQueryFn } from "@/lib/query-helpers";
import { invalidation, qk } from "@/lib/query-keys";
import {
	createProduct,
	deleteProduct,
	updateProduct,
} from "@/server/product-functions";

const createProductFn = dataQueryFn(createProduct);
const updateProductFn = dataQueryFn(updateProduct);
const deleteProductFn = dataQueryFn(deleteProduct);

const detailKeys = [qk.products.detailRoot];
/** Create/delete juga mengubah stok (create menulis baris `tb_stok` pertama). */
const stockKeys = [...invalidation.stock, ...detailKeys];
const catalogKeys = [...invalidation.catalog, ...detailKeys];

export function useCreateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createProductFn,
		onSuccess: () => invalidateKeys(queryClient, stockKeys),
	});
}

export function useUpdateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateProductFn,
		onSuccess: () => invalidateKeys(queryClient, catalogKeys),
	});
}

export function useDeleteProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteProductFn,
		onSuccess: () => invalidateKeys(queryClient, stockKeys),
	});
}
