import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "./guards";
import { periodeKindOf, rangeOf } from "./periode";
import { parsePeriodeInput, parseRentangInput } from "./validators";

// BR-6: hanya pesanan selesai + pembayaran lunas.
async function queryLaporanOrders(start: Date, endExclusive: Date) {
	return prisma.pesanan.findMany({
		where: {
			status: "selesai",
			tanggal: { gte: start, lt: endExclusive },
			pembayaran: { status: "lunas" },
		},
		include: {
			user: { select: { name: true } },
			pembayaran: true,
			detail: { include: { produk: { select: { namaProduk: true } } } },
		},
		orderBy: { tanggal: "asc" },
	});
}

type LaporanOrder = Awaited<ReturnType<typeof queryLaporanOrders>>[number];

function serializeLaporanOrders(orders: LaporanOrder[]) {
	return orders.map((o) => ({
		id: o.id,
		tanggal: o.tanggal.toISOString().slice(0, 10),
		kasir: o.user.name,
		total: o.total.toString(),
		metode: o.pembayaran?.metode ?? null,
		itemCount: o.detail.reduce((s, x) => s + x.jumlah, 0),
		items: o.detail.map((x) => ({
			nama: x.produk.namaProduk,
			jumlah: x.jumlah,
			harga: x.harga.toString(),
			subtotal: x.subtotal.toString(),
		})),
	}));
}

export const listLaporan = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureAdmin();
		const rows = await prisma.laporanPenjualan.findMany({
			orderBy: { periode: "desc" },
		});
		return rows.map((r) => ({
			id: r.id,
			periode: r.periode,
			totalPenjualan: r.totalPenjualan.toString(),
			kind: periodeKindOf(r.periode),
		}));
	},
);

type GenerateLaporanResult =
	| {
			id: null;
			periode: string;
			totalPenjualan: string;
			jumlahPesanan: 0;
			empty: true;
	  }
	| {
			id: number;
			periode: string;
			totalPenjualan: string;
			jumlahPesanan: number;
			empty: false;
	  };

export const generateLaporan = createServerFn({ method: "POST" })
	.validator(parsePeriodeInput)
	.handler(async ({ data }): Promise<GenerateLaporanResult> => {
		await ensureAdmin();
		const range = rangeOf(data.periode);
		if (!range) throw new Error("Periode tidak valid");

		const totals = await prisma.pesanan.findMany({
			where: {
				status: "selesai",
				tanggal: { gte: range.start, lt: range.end },
				pembayaran: { status: "lunas" },
			},
			select: { total: true },
		});
		const total = totals.reduce((sum, o) => sum + Number(o.total), 0);
		const rounded = Math.round(total * 100) / 100;

		// Periode kosong tidak disimpan agar daftar tidak penuh baris Rp0.
		if (totals.length === 0) {
			return {
				id: null,
				periode: data.periode,
				totalPenjualan: "0.00",
				jumlahPesanan: 0,
				empty: true,
			};
		}

		const saved = await prisma.laporanPenjualan.upsert({
			where: { periode: data.periode },
			create: { periode: data.periode, totalPenjualan: rounded },
			update: { totalPenjualan: rounded },
		});
		return {
			id: saved.id,
			periode: saved.periode,
			totalPenjualan: saved.totalPenjualan.toString(),
			jumlahPesanan: totals.length,
			empty: false,
		};
	});

export const getLaporanDetail = createServerFn({ method: "GET" })
	.validator(parsePeriodeInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const range = rangeOf(data.periode);
		if (!range) throw new Error("Periode tidak valid");

		const saved = await prisma.laporanPenjualan.findUnique({
			where: { periode: data.periode },
		});
		const orders = await queryLaporanOrders(range.start, range.end);
		return {
			periode: data.periode,
			tersimpan: saved ? saved.totalPenjualan.toString() : null,
			pesanan: serializeLaporanOrders(orders),
		};
	});

/**
 * Agregasi rentang tanggal bebas (inklusif, format YYYY-MM-DD).
 * Tidak disimpan ke tb_laporan_penjualan — hanya dihitung on-the-fly.
 */
export const getLaporanRentang = createServerFn({ method: "GET" })
	.validator(parseRentangInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const start = new Date(`${data.start}T00:00:00Z`);
		const endExclusive = new Date(`${data.end}T00:00:00Z`);
		endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
		const orders = await queryLaporanOrders(start, endExclusive);
		const pesanan = serializeLaporanOrders(orders);
		return {
			start: data.start,
			end: data.end,
			jumlahPesanan: pesanan.length,
			total: pesanan.reduce((s, o) => s + Number(o.total), 0).toFixed(2),
			pesanan,
		};
	});
