import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const CATEGORIES = ["Makanan Utama", "Appetizer", "Minuman"];

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "admin@dapurinaaina.id";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "InaAina123!";

type SeedProduct = {
	nama: string;
	kategori: string;
	harga: number;
	stok: number;
	gambar: string;
};

// Foto: public/menu/*.jpg (diunduh via `bun scripts/fetch-menu-images.ts`,
// sumber Wikimedia Commons — lihat public/menu/credits.json).
const PRODUCTS: SeedProduct[] = [
	// Makanan Utama
	{
		nama: "Nasi Goreng Spesial",
		kategori: "Makanan Utama",
		harga: 25000,
		stok: 40,
		gambar: "/menu/nasi-goreng-spesial.jpg",
	},
	{
		nama: "Rendang Sapi",
		kategori: "Makanan Utama",
		harga: 35000,
		stok: 25,
		gambar: "/menu/rendang-sapi.jpg",
	},
	{
		nama: "Ayam Goreng Lalapan",
		kategori: "Makanan Utama",
		harga: 25000,
		stok: 30,
		gambar: "/menu/ayam-goreng-lalapan.jpg",
	},
	{
		nama: "Sate Ayam",
		kategori: "Makanan Utama",
		harga: 30000,
		stok: 30,
		gambar: "/menu/sate-ayam.jpg",
	},
	{
		nama: "Gulai Ayam",
		kategori: "Makanan Utama",
		harga: 28000,
		stok: 20,
		gambar: "/menu/gulai-ayam.jpg",
	},
	{
		nama: "Sop Buntut",
		kategori: "Makanan Utama",
		harga: 45000,
		stok: 15,
		gambar: "/menu/sop-buntut.jpg",
	},
	// Appetizer
	{
		nama: "Tempe Mendoan",
		kategori: "Appetizer",
		harga: 15000,
		stok: 50,
		gambar: "/menu/tempe-mendoan.jpg",
	},
	{
		nama: "Tahu Gejrot",
		kategori: "Appetizer",
		harga: 12000,
		stok: 50,
		gambar: "/menu/tahu-gejrot.jpg",
	},
	{
		nama: "Pisang Goreng",
		kategori: "Appetizer",
		harga: 17000,
		stok: 35,
		gambar: "/menu/pisang-goreng.jpg",
	},
	{
		nama: "Lumpia Semarang",
		kategori: "Appetizer",
		harga: 18000,
		stok: 30,
		gambar: "/menu/lumpia-semarang.jpg",
	},
	// Minuman
	{
		nama: "Es Teh Manis",
		kategori: "Minuman",
		harga: 8000,
		stok: 100,
		gambar: "/menu/es-teh-manis.jpg",
	},
	{
		nama: "Es Jeruk",
		kategori: "Minuman",
		harga: 12000,
		stok: 80,
		gambar: "/menu/es-jeruk.jpg",
	},
	{
		nama: "Jus Alpukat",
		kategori: "Minuman",
		harga: 18000,
		stok: 40,
		gambar: "/menu/jus-alpukat.jpg",
	},
	{
		nama: "Kopi Tubruk",
		kategori: "Minuman",
		harga: 15000,
		stok: 60,
		gambar: "/menu/kopi-tubruk.jpg",
	},
	{
		nama: "Es Cendol",
		kategori: "Minuman",
		harga: 16000,
		stok: 45,
		gambar: "/menu/es-cendol.jpg",
	},
];

// Produk mock barat era awal — dihapus agar katalog 100% menu Indonesia.
const LEGACY_NAMES = ["Grill Sandwich", "Chicken Popeyes", "Bison Burgers"];

async function seedCategories(): Promise<Map<string, number>> {
	const ids = new Map<string, number>();
	for (const namaKategori of CATEGORIES) {
		const row = await prisma.kategori.upsert({
			where: { namaKategori },
			create: { namaKategori },
			update: {},
		});
		ids.set(namaKategori, row.id);
	}
	return ids;
}

async function seedProducts(kategoriIds: Map<string, number>): Promise<void> {
	await prisma.produk.deleteMany({
		where: { namaProduk: { in: LEGACY_NAMES } },
	});
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	for (const p of PRODUCTS) {
		const kategoriId = kategoriIds.get(p.kategori);
		if (!kategoriId) throw new Error(`Kategori hilang: ${p.kategori}`);
		const existing = await prisma.produk.findFirst({
			where: { namaProduk: p.nama },
		});
		if (existing) {
			await prisma.produk.update({
				where: { id: existing.id },
				data: { gambar: p.gambar, kategoriId },
			});
			console.log(`product kept: ${p.nama}`);
			continue;
		}
		const created = await prisma.produk.create({
			data: {
				namaProduk: p.nama,
				harga: p.harga,
				stok: p.stok,
				gambar: p.gambar,
				kategoriId,
			},
		});
		// Stok awal tercatat sebagai pergerakan masuk (FR-STK-1).
		await prisma.stok.create({
			data: {
				produkId: created.id,
				jumlah: p.stok,
				jenis: "masuk",
				tanggal: today,
			},
		});
		console.log(`product created: ${p.nama}`);
	}
}

async function seedKasir(): Promise<string> {
	const existing = await prisma.user.findUnique({
		where: { email: KASIR_EMAIL },
	});
	if (!existing) {
		await auth.api.signUpEmail({
			body: {
				name: "Kasir Utama",
				email: KASIR_EMAIL,
				password: KASIR_PASSWORD,
			},
		});
		console.log(`kasir signed up: ${KASIR_EMAIL}`);
	}
	const kasir = await prisma.user.update({
		where: { email: KASIR_EMAIL },
		data: { username: "kasir", role: "kasir" },
	});
	console.log(`kasir ready: ${KASIR_EMAIL}`);
	return kasir.id;
}

type SeedItem = { nama: string; jumlah: number };
type SeedOrder = {
	hariLalu: number;
	status: "diproses" | "selesai" | "dibatalkan";
	items: SeedItem[];
	bayar?: { metode: "tunai" | "non_tunai"; lunas: boolean };
};

// Pesanan contoh tersebar 4 minggu ke belakang agar dasbor & laporan ada isinya.
const ORDERS: SeedOrder[] = [
	{
		hariLalu: 0,
		status: "selesai",
		items: [
			{ nama: "Nasi Goreng Spesial", jumlah: 2 },
			{ nama: "Es Teh Manis", jumlah: 2 },
			{ nama: "Tempe Mendoan", jumlah: 1 },
		],
		bayar: { metode: "tunai", lunas: true },
	},
	{
		hariLalu: 0,
		status: "selesai",
		items: [
			{ nama: "Rendang Sapi", jumlah: 1 },
			{ nama: "Es Jeruk", jumlah: 2 },
			{ nama: "Pisang Goreng", jumlah: 1 },
		],
		bayar: { metode: "non_tunai", lunas: true },
	},
	{
		hariLalu: 1,
		status: "selesai",
		items: [
			{ nama: "Sate Ayam", jumlah: 2 },
			{ nama: "Es Jeruk", jumlah: 2 },
			{ nama: "Lumpia Semarang", jumlah: 1 },
		],
		bayar: { metode: "tunai", lunas: true },
	},
	{
		hariLalu: 3,
		status: "selesai",
		items: [
			{ nama: "Gulai Ayam", jumlah: 2 },
			{ nama: "Kopi Tubruk", jumlah: 2 },
		],
		bayar: { metode: "non_tunai", lunas: true },
	},
	{
		hariLalu: 6,
		status: "selesai",
		items: [
			{ nama: "Ayam Goreng Lalapan", jumlah: 3 },
			{ nama: "Es Teh Manis", jumlah: 3 },
			{ nama: "Tahu Gejrot", jumlah: 2 },
		],
		bayar: { metode: "tunai", lunas: true },
	},
	{
		hariLalu: 9,
		status: "selesai",
		items: [
			{ nama: "Sop Buntut", jumlah: 1 },
			{ nama: "Jus Alpukat", jumlah: 2 },
		],
		bayar: { metode: "tunai", lunas: true },
	},
	{
		hariLalu: 16,
		status: "selesai",
		items: [
			{ nama: "Rendang Sapi", jumlah: 2 },
			{ nama: "Es Cendol", jumlah: 2 },
		],
		bayar: { metode: "non_tunai", lunas: true },
	},
	{
		hariLalu: 25,
		status: "selesai",
		items: [
			{ nama: "Nasi Goreng Spesial", jumlah: 3 },
			{ nama: "Kopi Tubruk", jumlah: 3 },
		],
		bayar: { metode: "tunai", lunas: true },
	},
	{
		hariLalu: 0,
		status: "diproses",
		items: [
			{ nama: "Sate Ayam", jumlah: 1 },
			{ nama: "Es Teh Manis", jumlah: 1 },
		],
		bayar: { metode: "tunai", lunas: false },
	},
	{
		hariLalu: 0,
		status: "diproses",
		items: [{ nama: "Jus Alpukat", jumlah: 1 }],
	},
	{
		hariLalu: 2,
		status: "dibatalkan",
		items: [{ nama: "Pisang Goreng", jumlah: 2 }],
	},
];

function atNoon(daysAgo: number): Date {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	d.setHours(12, 0, 0, 0);
	return d;
}

async function seedOrders(kasirId: string): Promise<void> {
	const existing = await prisma.pesanan.count();
	if (existing > 0) {
		console.log(`orders kept: ${existing} sudah ada, seed dilewati`);
		return;
	}
	const produk = await prisma.produk.findMany();
	const byName = new Map(produk.map((x) => [x.namaProduk, x]));
	for (const o of ORDERS) {
		const tanggal = atNoon(o.hariLalu);
		await prisma.$transaction(async (tx) => {
			const lines = o.items.map((item) => {
				const prod = byName.get(item.nama);
				if (!prod) throw new Error(`Produk tidak ada: ${item.nama}`);
				if (prod.stok < item.jumlah)
					throw new Error(`Stok kurang untuk ${item.nama}`);
				const harga = Number(prod.harga.toString());
				return {
					prod,
					jumlah: item.jumlah,
					harga,
					subtotal: harga * item.jumlah,
				};
			});
			const total = lines.reduce((s, x) => s + x.subtotal, 0);
			const pesanan = await tx.pesanan.create({
				data: { userId: kasirId, tanggal, total, status: o.status },
			});
			for (const x of lines) {
				await tx.detailPesanan.create({
					data: {
						pesananId: pesanan.id,
						produkId: x.prod.id,
						jumlah: x.jumlah,
						harga: x.harga,
						subtotal: x.subtotal,
					},
				});
				await tx.produk.update({
					where: { id: x.prod.id },
					data: { stok: { decrement: x.jumlah } },
				});
				await tx.stok.create({
					data: {
						produkId: x.prod.id,
						jumlah: x.jumlah,
						jenis: "keluar",
						tanggal,
					},
				});
				x.prod.stok -= x.jumlah;
			}
			if (o.status === "dibatalkan") {
				// Stok dikembalikan + koreksi masuk (FR-ORD-3).
				for (const x of lines) {
					await tx.produk.update({
						where: { id: x.prod.id },
						data: { stok: { increment: x.jumlah } },
					});
					await tx.stok.create({
						data: {
							produkId: x.prod.id,
							jumlah: x.jumlah,
							jenis: "masuk",
							tanggal,
						},
					});
				}
			} else if (o.bayar) {
				const jumlahBayar = o.bayar.lunas ? total : Math.max(total - 5000, 0);
				await tx.pembayaran.create({
					data: {
						pesananId: pesanan.id,
						metode: o.bayar.metode,
						jumlahBayar,
						tanggal,
						status: jumlahBayar >= total ? "lunas" : "belum_lunas",
					},
				});
			}
		});
		console.log(
			`order created: ${o.status} H-${o.hariLalu} (${o.items.length} item)`,
		);
	}
}

function monthKey(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isoWeekKey(d: Date): string {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const dow = (date.getUTCDay() + 6) % 7;
	date.setUTCDate(date.getUTCDate() - dow + 3);
	const first = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
	const fDow = (first.getUTCDay() + 6) % 7;
	first.setUTCDate(first.getUTCDate() - fDow + 3);
	const week =
		1 + Math.round((date.getTime() - first.getTime()) / 86400000 / 7);
	return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function seedLaporan(): Promise<void> {
	// BR-6: hanya selesai + lunas yang diagregasi.
	const orders = await prisma.pesanan.findMany({
		where: { status: "selesai", pembayaran: { status: "lunas" } },
		select: { tanggal: true, total: true },
	});
	if (orders.length === 0) {
		console.log("laporan skipped: belum ada pesanan selesai+lunas");
		return;
	}
	const sums = new Map<string, number>();
	for (const o of orders) {
		const d = new Date(o.tanggal);
		const amount = Number(o.total.toString());
		for (const key of [monthKey(d), isoWeekKey(d)]) {
			sums.set(key, (sums.get(key) ?? 0) + amount);
		}
	}
	for (const [periode, total] of sums) {
		const rounded = Math.round(total * 100) / 100;
		await prisma.laporanPenjualan.upsert({
			where: { periode },
			create: { periode, totalPenjualan: rounded },
			update: { totalPenjualan: rounded },
		});
		console.log(`laporan upsert: ${periode} = ${rounded}`);
	}
}

async function seedAdmin(): Promise<void> {
	const existing = await prisma.user.findUnique({
		where: { email: ADMIN_EMAIL },
	});
	if (!existing) {
		await auth.api.signUpEmail({
			body: {
				name: "Administrator",
				email: ADMIN_EMAIL,
				password: ADMIN_PASSWORD,
			},
		});
		console.log(`admin signed up: ${ADMIN_EMAIL}`);
	}
	await prisma.user.update({
		where: { email: ADMIN_EMAIL },
		data: { username: "admin", role: "admin" },
	});
	console.log(`admin promoted: ${ADMIN_EMAIL}`);
}

const KASIR_EMAIL = process.env["KASIR_EMAIL"] ?? "kasir@dapurinaaina.id";
const KASIR_PASSWORD = process.env["KASIR_PASSWORD"] ?? "Kasir123!";

async function main(): Promise<void> {
	const kategoriIds = await seedCategories();
	await seedProducts(kategoriIds);
	await seedAdmin();
	const kasirId = await seedKasir();
	await seedOrders(kasirId);
	await seedLaporan();
	if (!process.env["ADMIN_PASSWORD"]) {
		console.warn(
			"Seed used the default admin password. Change it right after deploy.",
		);
	}
}

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => {
		void prisma.$disconnect();
	});
