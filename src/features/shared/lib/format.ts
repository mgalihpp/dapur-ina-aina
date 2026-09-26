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

export function fmtDate(value: string | Date): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function fmtDateTime(value: string | Date): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	const formatted = new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
	return formatted.replaceAll(".", ":");
}
