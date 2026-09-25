export function fmtInt(n: number): string {
	return `Rp${n.toLocaleString("id-ID")}`;
}

export function fmtMoney(n: number): string {
	const formatted = new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(n);
	return formatted.replace(/IDR/i, "Rp").replace(/\s+/g, "");
}

export function fmtDecimalMoney(value: string): string {
	const formatted = new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(value));
	return formatted.replace(/IDR/i, "Rp").replace(/\s+/g, "");
}

export const fmtRp = fmtMoney;
