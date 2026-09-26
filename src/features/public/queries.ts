import { queryOptions, useQueries } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
	getPublicOrderDetail,
	listPublicCatalog,
	listPublicMeja,
} from "@/server/public-functions";

export const publicCatalogQueryOptions = () =>
	queryOptions({
		queryKey: qk.public.catalog,
		queryFn: listPublicCatalog,
	});

export const publicMejaQueryOptions = () =>
	queryOptions({
		queryKey: qk.tables.publicList,
		queryFn: listPublicMeja,
		refetchInterval: 10_000,
	});

export const publicOrderQueryOptions = (id: string | number) =>
	queryOptions({
		queryKey: qk.public.order(id),
		queryFn: () => getPublicOrderDetail({ data: { id } }),
		retry: false,
	});

export function usePublicOrderQueries(orderIds: readonly number[]) {
	return useQueries({
		queries: orderIds.map((id) => publicOrderQueryOptions(id)),
	});
}
