import { Prisma } from "@prisma/client";
import { createServerFn } from "@tanstack/react-start";
import type { DashboardPeriod, PeriodData } from "@/features/admin/types";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, ensureStaff } from "./guards";
import { parseDashboardPeriod } from "./validators";

function startOf(period: DashboardPeriod, now: Date): Date {
	const d = new Date(now);
	d.setHours(0, 0, 0, 0);
	if (period === "today") return d;
	if (period === "week") {
		const dow = (d.getDay() + 6) % 7; // Senin=0
		d.setDate(d.getDate() - dow);
		return d;
	}
	if (period === "month") {
		d.setDate(1);
		return d;
	}
	d.setMonth(0, 1);
	return d;
}

function bucketLabel(period: DashboardPeriod, d: Date): string {
	if (period === "today") return `${String(d.getHours()).padStart(2, "0")}.00`;
	if (period === "week")
		return d.toLocaleDateString("id-ID", { weekday: "short" });
	if (period === "month") return `Tgl ${d.getDate()}`;
	return d.toLocaleDateString("id-ID", { month: "short" });
}

// Agregasi dashboard dari tb_pesanan selesai+lunas (BR-6).
export const getDashboard = createServerFn({ method: "GET" })
	.validator(parseDashboardPeriod)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const now = new Date();
		const start = startOf(data.period, now);
		const orders = await prisma.pesanan.findMany({
			where: {
				status: "selesai",
				tanggal: { gte: start },
				pembayaran: { status: "lunas" },
			},
			select: { total: true, tanggal: true },
		});
		const details = await prisma.detailPesanan.findMany({
			where: {
				pesanan: {
					status: "selesai",
					tanggal: { gte: start },
					pembayaran: { status: "lunas" },
				},
			},
			select: {
				jumlah: true,
				subtotal: true,
				produk: {
					select: {
						namaProduk: true,
						harga: true,
						gambar: true,
						kategori: { select: { namaKategori: true } },
					},
				},
			},
		});

		const incomeByKat = new Map<string, Prisma.Decimal>();
		for (const x of details) {
			const kat = x.produk.kategori.namaKategori;
			incomeByKat.set(
				kat,
				(incomeByKat.get(kat) ?? new Prisma.Decimal(0)).plus(x.subtotal),
			);
		}
		const colors = ["#F97316", "#111827", "#E5E7EB"] as const;
		const income = [...incomeByKat.entries()].map(([label, value], i) => ({
			label,
			value: Number(value.toFixed(2)),
			color: colors[i % colors.length],
		}));

		const total = orders.reduce(
			(sum, order) => sum.plus(order.total),
			new Prisma.Decimal(0),
		);
		const dailyMap = new Map<string, Prisma.Decimal>();
		for (const o of orders) {
			const key = bucketLabel(data.period, new Date(o.tanggal));
			dailyMap.set(
				key,
				(dailyMap.get(key) ?? new Prisma.Decimal(0)).plus(o.total),
			);
		}
		const daily = [...dailyMap.entries()].map(([label, value]) => ({
			label,
			value: Number(value.toFixed(2)),
		}));

		const dishMap = new Map<
			string,
			{ name: string; price: number; orders: number; image: string | null }
		>();
		for (const x of details) {
			const name = x.produk.namaProduk;
			const cur = dishMap.get(name) ?? {
				name,
				price: Number(x.produk.harga.toString()),
				orders: 0,
				image: x.produk.gambar,
			};
			cur.orders += x.jumlah;
			dishMap.set(name, cur);
		}
		const dishes = [...dishMap.values()]
			.sort((a, b) => b.orders - a.orders)
			.slice(0, 5)
			.map((d, i) => ({ id: `d${i + 1}`, ...d }));

		const data_out: PeriodData = {
			income,
			balance: {
				total: Number(total.toFixed(2)),
				income: Number(total.toFixed(2)),
				expense: 0,
				incomeDelta: `${orders.length} pesanan lunas`,
				expenseDelta: "-",
			},
			daily,
			dishes,
		};
		return data_out;
	});

export const getCashierDashboard = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureStaff();
		const [pendingOrders, products] = await Promise.all([
			prisma.pesanan.count({ where: { status: "diproses" } }),
			prisma.produk.findMany({
				select: { id: true, namaProduk: true, stok: true, stokMinimal: true },
				orderBy: [{ stok: "asc" }, { namaProduk: "asc" }],
			}),
		]);
		const lowStock = products.filter(
			(product) => product.stok <= product.stokMinimal,
		);
		return {
			pendingOrders,
			lowStock: lowStock.map((product) => ({
				id: product.id,
				name: product.namaProduk,
				stock: product.stok,
			})),
		};
	},
);
