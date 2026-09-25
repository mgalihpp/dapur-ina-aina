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
	if (!Number.isInteger(id) || id <= 0) throw new Error("id tidak valid");
	return { id };
}

export type OrderInput = {
	items: { productId: string | number; quantity: number }[];
};

export function parseOrderInput(input: OrderInput): {
	items: { productId: number; quantity: number }[];
} {
	if (
		typeof input !== "object" ||
		input === null ||
		!Array.isArray(input.items)
	)
		throw new Error("Input pesanan tidak valid.");
	if (input.items.length === 0)
		throw new Error("Pesanan harus berisi minimal satu produk.");
	if (input.items.length > 100)
		throw new Error("Maksimal 100 jenis produk per pesanan.");
	const items = input.items.map((item) => {
		if (typeof item !== "object" || item === null)
			throw new Error("Produk tidak valid.");
		if (
			typeof item.productId !== "string" &&
			typeof item.productId !== "number"
		)
			throw new Error("Produk tidak valid.");
		const productId = Number(item.productId);
		if (!Number.isInteger(productId) || productId <= 0)
			throw new Error("Produk tidak valid.");
		if (
			typeof item.quantity !== "number" ||
			!Number.isInteger(item.quantity) ||
			item.quantity <= 0
		)
			throw new Error("Jumlah produk harus bilangan bulat lebih dari 0.");
		return { productId, quantity: item.quantity };
	});
	if (new Set(items.map((item) => item.productId)).size !== items.length)
		throw new Error("Produk yang sama tidak boleh diulang.");
	return { items };
}

export type PaymentInput = {
	orderId: string | number;
	method: string;
	amount: string;
};

export function parsePaymentInput(input: PaymentInput): {
	orderId: number;
	method: "tunai" | "non_tunai";
	amount: string;
} {
	if (typeof input !== "object" || input === null)
		throw new Error("Input pembayaran tidak valid.");
	const { id: orderId } = parseIdInput({ id: input.orderId });
	if (input.method !== "tunai" && input.method !== "non_tunai")
		throw new Error("Metode pembayaran tidak valid.");
	const amount = typeof input.amount === "string" ? input.amount.trim() : "";
	if (!/^\d{1,8}(\.\d{1,2})?$/.test(amount))
		throw new Error("Jumlah pembayaran tidak valid.");
	if (Number(amount) <= 0)
		throw new Error("Jumlah pembayaran harus lebih dari 0.");
	return { orderId, method: input.method, amount };
}

export type OrderFilterInput = {
	start?: string;
	end?: string;
	status?: string;
	product?: string;
};

type OrderStatus = "diproses" | "selesai" | "dibatalkan";

function isCalendarDate(value: string): boolean {
	if (!DATE_RE.test(value)) return false;
	const date = new Date(`${value}T00:00:00.000Z`);
	return date.toISOString().slice(0, 10) === value;
}

export function parseOrderFilterInput(input: OrderFilterInput) {
	if (typeof input !== "object" || input === null)
		throw new Error("Filter pesanan tidak valid.");
	const start = readOptionalString(input.start, "Tanggal mulai");
	const end = readOptionalString(input.end, "Tanggal selesai");
	const statusInput = readOptionalString(input.status, "Status");
	const product = readOptionalString(input.product, "Nama produk")?.slice(
		0,
		100,
	);
	if ((start && !isCalendarDate(start)) || (end && !isCalendarDate(end)))
		throw new Error("Format tanggal tidak valid. Gunakan YYYY-MM-DD.");
	if (start && end && start > end)
		throw new Error("Tanggal mulai harus <= tanggal selesai.");
	if (
		statusInput &&
		statusInput !== "diproses" &&
		statusInput !== "selesai" &&
		statusInput !== "dibatalkan"
	)
		throw new Error("Status pesanan tidak valid.");
	const status: OrderStatus | undefined =
		statusInput === "diproses" ||
		statusInput === "selesai" ||
		statusInput === "dibatalkan"
			? statusInput
			: undefined;
	return { start, end, status, product };
}

export type OrderStatusInput = {
	id: string | number;
	status: string;
};

export function parseOrderStatusInput(input: OrderStatusInput): {
	id: number;
	status: "selesai" | "dibatalkan";
} {
	const { id } = parseIdInput(input);
	if (input.status !== "selesai" && input.status !== "dibatalkan")
		throw new Error("Status pesanan tidak valid.");
	return { id, status: input.status };
}

export type StockInput = {
	productId: string | number;
	quantity: number;
};

export function parseStockInput(input: StockInput): {
	productId: number;
	quantity: number;
} {
	if (typeof input !== "object" || input === null)
		throw new Error("Input stok tidak valid.");
	const { id: productId } = parseIdInput({ id: input.productId });
	if (!Number.isInteger(input.quantity) || input.quantity <= 0)
		throw new Error("Jumlah stok harus bilangan bulat lebih dari 0.");
	return { productId, quantity: input.quantity };
}

export type StockFilterInput = {
	productId?: string | number;
	type?: string;
	start?: string;
	end?: string;
};

export function parseStockFilterInput(input: StockFilterInput) {
	if (typeof input !== "object" || input === null)
		throw new Error("Filter stok tidak valid.");
	const productId =
		input.productId !== undefined
			? parseIdInput({ id: input.productId }).id
			: undefined;
	const typeInput = readOptionalString(input.type, "Jenis pergerakan");
	const start = readOptionalString(input.start, "Tanggal mulai");
	const end = readOptionalString(input.end, "Tanggal selesai");
	if (typeInput && typeInput !== "masuk" && typeInput !== "keluar")
		throw new Error("Jenis pergerakan stok tidak valid.");
	const type: "masuk" | "keluar" | undefined =
		typeInput === "masuk" || typeInput === "keluar" ? typeInput : undefined;
	if ((start && !isCalendarDate(start)) || (end && !isCalendarDate(end)))
		throw new Error("Format tanggal tidak valid. Gunakan YYYY-MM-DD.");
	if (start && end && start > end)
		throw new Error("Tanggal mulai harus <= tanggal selesai.");
	return { productId, type, start, end };
}

function readOptionalString(
	value: string | undefined,
	label: string,
): string | undefined {
	if (value === undefined) return undefined;
	if (typeof value !== "string") throw new Error(`${label} tidak valid.`);
	return value.trim() || undefined;
}

export type CategoryInput = {
	namaKategori: string;
};

export function parseCategoryInput(input: CategoryInput): {
	namaKategori: string;
} {
	if (typeof input !== "object" || input === null)
		throw new Error("Input kategori tidak valid.");
	const namaKategori =
		typeof input.namaKategori === "string" ? input.namaKategori.trim() : "";
	if (!namaKategori) throw new Error("Nama kategori wajib diisi.");
	if (namaKategori.length > 50)
		throw new Error("Nama kategori maksimal 50 karakter.");
	return { namaKategori };
}

export type UpdateCategoryInput = CategoryInput & {
	id: string | number;
};

export function parseUpdateCategoryInput(input: UpdateCategoryInput) {
	return { ...parseCategoryInput(input), ...parseIdInput(input) };
}

export type StaffRole = "admin" | "kasir";

type StaffUserInput = {
	name: string;
	email: string;
	username: string;
	password: string;
	role: string;
};

function parseStaffFields(input: StaffUserInput, passwordRequired: boolean) {
	if (typeof input !== "object" || input === null)
		throw new Error("Input pengguna tidak valid.");
	const name = typeof input.name === "string" ? input.name.trim() : "";
	const email =
		typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
	const username =
		typeof input.username === "string"
			? input.username.trim().toLowerCase()
			: "";
	const password = typeof input.password === "string" ? input.password : "";
	if (!name || name.length > 100)
		throw new Error("Nama wajib diisi (maksimal 100 karakter).");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		throw new Error("Alamat email tidak valid.");
	if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username))
		throw new Error(
			"Username harus 3–50 karakter: huruf, angka, titik, garis bawah, atau strip.",
		);
	if (passwordRequired && password.length < 8)
		throw new Error("Kata sandi minimal 8 karakter.");
	if (password && (password.length < 8 || password.length > 128))
		throw new Error("Kata sandi harus 8–128 karakter.");
	if (input.role !== "admin" && input.role !== "kasir")
		throw new Error("Peran pengguna tidak valid.");
	const role: StaffRole = input.role === "admin" ? "admin" : "kasir";
	return { name, email, username, password, role };
}

export function parseCreateUserInput(input: StaffUserInput) {
	return parseStaffFields(input, true);
}

export type UpdateUserInput = StaffUserInput & { id: string };

export function parseUpdateUserInput(input: UpdateUserInput) {
	const fields = parseStaffFields(input, false);
	if (typeof input.id !== "string" || !input.id.trim())
		throw new Error("Pengguna tidak valid.");
	return { id: input.id.trim(), ...fields };
}

export function parseDeleteUserInput(input: { id: string }) {
	if (typeof input !== "object" || input === null)
		throw new Error("Pengguna tidak valid.");
	const id = typeof input.id === "string" ? input.id.trim() : "";
	if (!id) throw new Error("Pengguna tidak valid.");
	return { id };
}

export type ProductInput = {
	namaProduk: string;
	harga: string | number;
	stok: number;
	kategoriId: number;
	gambar: string | null;
};

export type ParsedProductInput = {
	namaProduk: string;
	harga: string;
	stok: number;
	kategoriId: number;
	gambar: string | null;
};

export function parseProductInput(input: ProductInput): ParsedProductInput {
	if (typeof input !== "object" || input === null)
		throw new Error("Input tidak valid");
	const namaProduk =
		typeof input.namaProduk === "string" ? input.namaProduk.trim() : "";
	const harga =
		typeof input.harga === "string" ? input.harga.trim() : String(input.harga);
	const stok = input.stok;
	const kategoriId = input.kategoriId;
	const gambarRaw = input.gambar;
	const gambar =
		typeof gambarRaw === "string" && gambarRaw.trim() ? gambarRaw.trim() : null;
	if (!namaProduk) throw new Error("Nama produk wajib diisi.");
	if (!/^\d{1,8}(\.\d{1,2})?$/.test(harga) || Number(harga) <= 0)
		throw new Error("Harga harus maksimal 2 angka desimal dan lebih dari 0.");
	if (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0)
		throw new Error("Stok harus bilangan bulat >= 0.");
	if (
		typeof kategoriId !== "number" ||
		!Number.isInteger(kategoriId) ||
		kategoriId <= 0
	)
		throw new Error("Kategori wajib dipilih.");
	return { namaProduk, harga, stok, kategoriId, gambar };
}

export type UpdateProductInput = Omit<ProductInput, "stok"> & {
	id: string | number;
};

export function parseUpdateProductInput(
	input: UpdateProductInput,
): Omit<ParsedProductInput, "stok"> & { id: number } {
	const parsed = parseProductInput({ ...input, stok: 0 });
	return {
		namaProduk: parsed.namaProduk,
		harga: parsed.harga,
		kategoriId: parsed.kategoriId,
		gambar: parsed.gambar,
		...parseIdInput(input),
	};
}

export type MejaInput = {
	nama: string;
	lantai: string;
};

export function parseMejaInput(input: MejaInput): {
	nama: string;
	lantai: string;
} {
	if (typeof input !== "object" || input === null)
		throw new Error("Input meja tidak valid.");
	const nama = typeof input.nama === "string" ? input.nama.trim() : "";
	const lantai = typeof input.lantai === "string" ? input.lantai.trim() : "";
	if (!nama) throw new Error("Nama meja wajib diisi.");
	if (nama.length > 20) throw new Error("Nama meja maksimal 20 karakter.");
	if (!lantai) throw new Error("Lantai wajib diisi.");
	if (lantai.length > 20) throw new Error("Nama lantai maksimal 20 karakter.");
	return { nama, lantai };
}

export type UpdateMejaInput = MejaInput & {
	id: string | number;
};

export function parseUpdateMejaInput(input: UpdateMejaInput) {
	return { ...parseMejaInput(input), ...parseIdInput(input) };
}

export type GuestPaymentMethod = "tunai" | "non_tunai";

export type PublicOrderInput = OrderInput & {
	meja?: string | null;
	tamu?: number | null;
	paymentMethod?: string;
};

export function parsePublicOrderInput(input: PublicOrderInput): {
	items: { productId: number; quantity: number }[];
	meja: string | null;
	tamu: number | null;
	paymentMethod: GuestPaymentMethod;
} {
	const { items } = parseOrderInput(input);
	if (typeof input !== "object" || input === null || !("items" in input))
		throw new Error("Input pesanan tidak valid.");
	const raw = input.meja;
	let meja: string | null = null;
	if (raw !== undefined && raw !== null) {
		if (typeof raw !== "string") throw new Error("Nama meja tidak valid.");
		const trimmed = raw.trim();
		if (trimmed) {
			if (trimmed.length > 20)
				throw new Error("Nama meja maksimal 20 karakter.");
			meja = trimmed;
		}
	}
	const rawTamu = input.tamu;
	let tamu: number | null = null;
	if (rawTamu !== undefined && rawTamu !== null) {
		if (typeof rawTamu !== "number" || !Number.isInteger(rawTamu))
			throw new Error("Jumlah tamu tidak valid.");
		if (rawTamu < 1 || rawTamu > 20) throw new Error("Jumlah tamu harus 1–20.");
		tamu = rawTamu;
	}
	const paymentMethod = input.paymentMethod ?? "tunai";
	if (paymentMethod !== "tunai" && paymentMethod !== "non_tunai")
		throw new Error("Metode pembayaran tidak valid.");
	return { items, meja, tamu, paymentMethod };
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
