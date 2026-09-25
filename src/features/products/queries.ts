import { queryOptions, useQuery } from "@tanstack/react-query";
import { dataQueryFn, passthroughQueryFn } from "@/lib/query-helpers";
import { qk } from "@/lib/query-keys";
import { getProduct, listProducts } from "@/server/product-functions";

const fetchProduct = dataQueryFn(getProduct);
const fetchProducts = passthroughQueryFn(listProducts);

export const adminProductsOptions = queryOptions({
	queryKey: qk.products.adminList,
	queryFn: () => fetchProducts(),
});

export function useAdminProducts() {
	return useQuery(adminProductsOptions);
}

export function productDetailOptions(id: string | number) {
	return queryOptions({
		queryKey: qk.products.detail(id),
		queryFn: () => fetchProduct({ id }),
	});
}

export function useProductDetail(id: string | number) {
	return useQuery(productDetailOptions(id));
}
