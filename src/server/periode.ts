/** Format periode laporan: ISO week `YYYY-Www` atau bulan `YYYY-MM` (BR-6). */

export type PeriodeKind = "mingguan" | "bulanan";

const WEEK_RE = /^\d{4}-W\d{2}$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function periodeKindOf(periode: string): PeriodeKind | null {
	if (WEEK_RE.test(periode)) {
		const w = Number(periode.slice(-2));
		return w >= 1 && w <= 53 ? "mingguan" : null;
	}
	if (MONTH_RE.test(periode)) return "bulanan";
	return null;
}

/** Senin 00:00 (inklusif) s/d Senin berikutnya (eksklusif) untuk ISO week YYYY-Www. */
export function isoWeekRange(periode: string): { start: Date; end: Date } {
	const year = Number(periode.slice(0, 4));
	const week = Number(periode.slice(-2));
	// 4 Jan selalu di minggu ISO 1 → mundur ke Senin.
	const jan4 = new Date(Date.UTC(year, 0, 4));
	const jan4Dow = (jan4.getUTCDay() + 6) % 7; // Senin=0
	const mondayW1 = new Date(jan4);
	mondayW1.setUTCDate(jan4.getUTCDate() - jan4Dow);
	const start = new Date(mondayW1);
	start.setUTCDate(mondayW1.getUTCDate() + (week - 1) * 7);
	const end = new Date(start);
	end.setUTCDate(start.getUTCDate() + 7);
	return { start, end };
}

/** Tanggal 1 (inklusif) s/d tanggal 1 bulan berikut (eksklusif) untuk YYYY-MM. */
export function monthRange(periode: string): { start: Date; end: Date } {
	const year = Number(periode.slice(0, 4));
	const month = Number(periode.slice(5, 7));
	return {
		start: new Date(Date.UTC(year, month - 1, 1)),
		end: new Date(Date.UTC(year, month, 1)),
	};
}

export function rangeOf(periode: string): { start: Date; end: Date } | null {
	const kind = periodeKindOf(periode);
	if (kind === "mingguan") return isoWeekRange(periode);
	if (kind === "bulanan") return monthRange(periode);
	return null;
}
