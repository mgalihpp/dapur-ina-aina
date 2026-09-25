function messageFrom(error: unknown): string | null {
	if (!(error instanceof Error)) return null;
	const message = error.message.trim();
	return message || null;
}

export function queryErrorMessage(
	error: unknown,
	fallback = "Terjadi kesalahan saat memuat data.",
): string {
	return messageFrom(error) ?? fallback;
}

export function mutationErrorMessage(
	error: unknown,
	fallback = "Operasi gagal. Silakan coba lagi.",
): string {
	return messageFrom(error) ?? fallback;
}
