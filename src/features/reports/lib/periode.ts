/** Helper periode waktu-lokal untuk date picker (mirror versi UTC di report-functions). */

export function monthOf(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function weekOf(d: Date): string {
	const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	const dow = (t.getDay() + 6) % 7;
	t.setDate(t.getDate() - dow + 3); // Kamis minggu berjalan
	const y = t.getFullYear();
	const jan4 = new Date(y, 0, 4);
	const jan4Dow = (jan4.getDay() + 6) % 7;
	const mondayW1 = new Date(y, 0, 4 - jan4Dow);
	const w = Math.round((t.getTime() - mondayW1.getTime()) / 604800000) + 1;
	return `${y}-W${String(w).padStart(2, "0")}`;
}

/** Senin–Minggu minggu yang memuat tanggal. */
export function weekRangeLocal(d: Date): { start: Date; end: Date } {
	const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	const dow = (t.getDay() + 6) % 7;
	const start = new Date(t);
	start.setDate(t.getDate() - dow);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	return { start, end };
}

/** Tanggal 1 s/d akhir bulan yang memuat tanggal. */
export function monthRangeLocal(d: Date): { start: Date; end: Date } {
	return {
		start: new Date(d.getFullYear(), d.getMonth(), 1),
		end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
	};
}

export function addDays(d: Date, n: number): Date {
	const t = new Date(d);
	t.setDate(t.getDate() + n);
	return t;
}

/** Senin minggu yang memuat tanggal. */
export function mondayOf(d: Date): Date {
	const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
	return t;
}

export function sameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/** "YYYY-MM-DD" waktu lokal. */
export function toISODate(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Kode YYYY-Www jika rentang pas satu minggu ISO penuh, else null. */
export function exactWeekPeriode(range: {
	from: Date;
	to: Date;
}): string | null {
	const { start, end } = weekRangeLocal(range.from);
	if (sameDay(range.from, start) && sameDay(range.to, end))
		return weekOf(range.from);
	return null;
}

/** Kode YYYY-MM jika rentang pas satu bulan kalender penuh, else null. */
export function exactMonthPeriode(range: {
	from: Date;
	to: Date;
}): string | null {
	const { start, end } = monthRangeLocal(range.from);
	if (sameDay(range.from, start) && sameDay(range.to, end))
		return monthOf(range.from);
	return null;
}

export const fmtDay = new Intl.DateTimeFormat("id-ID", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

export const fmtDayShort = new Intl.DateTimeFormat("id-ID", {
	day: "numeric",
	month: "short",
});
