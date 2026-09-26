import { Prisma } from "@prisma/client";
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
		tanggal: o.tanggal.toISOString(),
		kasir: o.user?.name ?? "Kasir Utama",
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

type GenerateLaporanResult = {
	id: number;
	periode: string;
	totalPenjualan: string;
	jumlahPesanan: number;
	empty: boolean;
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
		const total = totals.reduce(
			(sum, order) => sum.plus(order.total),
			new Prisma.Decimal(0),
		);

		// Periode kosong tetap disimpan Rp0 agar teraudit di daftar laporan.
		const saved = await prisma.laporanPenjualan.upsert({
			where: { periode: data.periode },
			create: { periode: data.periode, totalPenjualan: total },
			update: { totalPenjualan: total },
		});
		return {
			id: saved.id,
			periode: saved.periode,
			totalPenjualan: saved.totalPenjualan.toFixed(2),
			jumlahPesanan: totals.length,
			empty: totals.length === 0,
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
			total: pesanan
				.reduce((sum, order) => sum.plus(order.total), new Prisma.Decimal(0))
				.toFixed(2),
			pesanan,
		};
	});
