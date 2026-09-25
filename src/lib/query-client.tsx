import {
	environmentManager,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Same-origin server functions rarely fail twice; bound the retry so a
				// broken endpoint cannot hold the screen hostage.
				retry: 2,
				// Short: stock and order totals move under the kasir, so revisit-fresh
				// matters more than refetch-savings.
				staleTime: 30_000,
				gcTime: 5 * 60_000,
			},
			mutations: {
				// Order, payment, and stock writes are not idempotent. A blind retry
				// could record a second payment or a second stock decrement.
				retry: false,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	// A module-level cache on the server would be shared by every concurrent
	// request, so one kasir could read another kasir's cached rows.
	if (environmentManager.isServer()) return makeQueryClient();
	// One client per browser tab, so a suspended first render does not throw the
	// cache away and re-fetch everything.
	browserQueryClient ??= makeQueryClient();
	return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(getQueryClient);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
