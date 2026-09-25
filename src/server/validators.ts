import type { DashboardPeriod } from "@/features/admin/types";
import { periodeKindOf } from "./periode";

/**
 * Validator input server function (boundary). Tipe parameter adalah bentuk
 * wire yang dikirim klien; nilai dicek saat runtime lalu dikembalikan sebagai
 * tipe domain. Tidak ada `any`/`unknown`/`as` di sini.
 */

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** id numerik; klien boleh kirim string (mis. dari state pilihan) atau number. */
export type IdInput = {
	id: string | number;
};

export function parseIdInput(input: IdInput): { id: number } {
	if (typeof input !== "object" || input === null || !("id" in input))
		throw new Error("id wajib diisi");
	const id = Number(input.id);
	if (!Number.isInteger(id)) throw new Error("id tidak valid");
	return { id };
}

export type ProductInput = {
	namaProduk: string;
	harga: number;
	stok: number;
	kategoriId: number;
	gambar: string | null;
};

export type ParsedProductInput = {
	namaProduk: string;
	harga: number;
	stok: number;
	kategoriId: number;
	gambar: string | null;
};

export function parseProductInput(input: ProductInput): ParsedProductInput {
	if (typeof input !== "object" || input === null)
		throw new Error("Input tidak valid");
	const namaProduk =
		typeof input.namaProduk === "string" ? input.namaProduk.trim() : "";
	const harga = Number(input.harga);
	const stok = Number(input.stok);
	const kategoriId = Number(input.kategoriId);
	const gambarRaw = input.gambar;
	const gambar =
		typeof gambarRaw === "string" && gambarRaw.trim() ? gambarRaw.trim() : null;
	if (!namaProduk) throw new Error("Nama produk wajib diisi.");
	if (!Number.isFinite(harga) || harga <= 0)
		throw new Error("Harga harus berupa angka lebih dari 0.");
	if (!Number.isInteger(stok) || stok < 0)
		throw new Error("Stok harus bilangan bulat >= 0.");
	if (!Number.isInteger(kategoriId) || kategoriId <= 0)
		throw new Error("Kategori wajib dipilih.");
	return { namaProduk, harga, stok, kategoriId, gambar };
}

export type UpdateProductInput = ProductInput & {
	id: string | number;
};

export function parseUpdateProductInput(
	input: UpdateProductInput,
): ParsedProductInput & { id: number } {
	return { ...parseProductInput(input), ...parseIdInput(input) };
}

export type DashboardPeriodInput = {
	period: string;
};

export function parseDashboardPeriod(input: DashboardPeriodInput): {
	period: DashboardPeriod;
} {
	if (typeof input !== "object" || input === null || !("period" in input))
		throw new Error("Periode tidak valid");
	const period = input.period;
	if (
		period !== "today" &&
		period !== "week" &&
		period !== "month" &&
		period !== "year"
	)
		throw new Error("Periode tidak valid");
	return { period };
}

export type PeriodeInput = {
	periode: string;
};

export function parsePeriodeInput(input: PeriodeInput): { periode: string } {
	if (typeof input !== "object" || input === null || !("periode" in input))
		throw new Error("periode wajib diisi");
	const periode = input.periode;
	if (typeof periode !== "string" || !periodeKindOf(periode))
		throw new Error(
			"Format periode tidak valid. Gunakan YYYY-Www atau YYYY-MM.",
		);
	return { periode };
}

export type RentangInput = {
	start: string;
	end: string;
};

export function parseRentangInput(input: RentangInput): {
	start: string;
	end: string;
} {
	if (typeof input !== "object" || input === null)
		throw new Error("Rentang wajib diisi");
	const start = input.start;
	const end = input.end;
	if (
		typeof start !== "string" ||
		typeof end !== "string" ||
		!DATE_RE.test(start) ||
		!DATE_RE.test(end)
	)
		throw new Error("Format tanggal tidak valid. Gunakan YYYY-MM-DD.");
	if (start > end) throw new Error("Tanggal mulai harus <= tanggal selesai.");
	const spanDays =
		(Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
		86400000;
	if (spanDays > 366) throw new Error("Rentang maksimal 366 hari.");
	return { start, end };
}
