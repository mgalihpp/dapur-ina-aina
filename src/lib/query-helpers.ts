/**
 * Adapter untuk server function yang dibungkus `.validator(...)`.
 * Klien mengirim input domain; transport tetap memakai bentuk `{ data }`.
 */
export function dataQueryFn<TInput, TOutput>(
	serverFn: (args: { data: TInput }) => TOutput,
): (input: TInput) => TOutput {
	return (input) => serverFn({ data: input });
}

/** Server function tanpa input dipakai langsung sebagai queryFn/mutationFn. */
export function passthroughQueryFn<TOutput>(
	serverFn: () => TOutput,
): () => TOutput {
	return serverFn;
}
