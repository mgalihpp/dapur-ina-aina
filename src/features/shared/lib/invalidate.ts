import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * `invalidation.*` di `src/lib/query-keys.ts` adalah daftar prefix, bukan satu
 * key gabungan. Di-invalidate satu per satu supaya tiap prefix tersentuh.
 */
export async function invalidateKeys(
	queryClient: QueryClient,
	keys: readonly QueryKey[],
): Promise<void> {
	await Promise.all(
		keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
	);
}
