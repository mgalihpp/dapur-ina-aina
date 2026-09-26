import type { Prisma } from "@prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, ensureStaff } from "./guards";
import { assertOrderTransition } from "./order-domain";
import { parseOrderFilterInput, parseOrderStatusInput } from "./validators";

export type AdminOrderRow = {
	id: string;
	total: string;
	paymentStatus: "lunas" | "belum_lunas" | null;
	status: "diproses" | "selesai" | "dibatalkan";
	tanggal: string;
	kasir: string;
	meja: { id: number; nama: string; lantai: string } | null;
	tamu: number | null;
};

export type AdminOrderDetail = AdminOrderRow & {
	paymentMethod: "tunai" | "non_tunai" | null;
	paymentAmount: string | null;
	paymentDate: string | null;
	change: string | null;
	items: {
		id: string;
		name: string;
		qty: number;
		price: string;
		subtotal: string;
	}[];
};

type OrderRowSource = Prisma.PesananGetPayload<{
	include: {
		user: { select: { name: true } };
		pembayaran: { select: { status: true } };
		meja: { select: { id: true; nama: true; lantai: true } };
	};
}>;

function toRow(order: OrderRowSource): AdminOrderRow {
	return {
		id: String(order.id),
		total: order.total.toFixed(2),
		paymentStatus: order.pembayaran?.status ?? null,
		status: order.status,
		tanggal: order.tanggal.toISOString(),
		kasir: order.user?.name ?? "Kasir Utama",
		meja: order.meja ? { id: order.meja.id, nama: order.meja.nama, lantai: order.meja.lantai } : null,
		tamu: order.tamu,
	};
}

function dateFilter(
	value: string | undefined,
	exclusive = false,
): Date | undefined {
	if (!value) return undefined;
	const date = new Date(`${value}T00:00:00.000Z`);
	if (exclusive) date.setUTCDate(date.getUTCDate() + 1);
	return date;
}

export const listOrders = createServerFn({ method: "GET" })
	.validator(parseOrderFilterInput)
	.handler(async ({ data }) => {
		await ensureStaff();
		const rows = await prisma.pesanan.findMany({
			where: {
				status: data.status,
				tanggal:
					data.start || data.end
						? {
								gte: dateFilter(data.start),
								lt: dateFilter(data.end, true),
							}
						: undefined,
				detail: data.product
					? { some: { produk: { namaProduk: { contains: data.product } } } }
					: undefined,
			},
			include: {
				user: { select: { name: true } },
				pembayaran: { select: { status: true } },
				meja: { select: { id: true, nama: true, lantai: true } },
			},
			orderBy: [{ status: "asc" }, { id: "desc" }],
			take: 200,
		});
		return rows.map(toRow);
	});

export const getOrderDetail = createServerFn({ method: "GET" })
	.validator((input: { id: string | number }) => {
		const id = Number(input.id);
		if (!Number.isInteger(id) || id <= 0) throw new Error("id tidak valid");
		return { id };
	})
	.handler(async ({ data }) => {
		await ensureStaff();
		const order = await prisma.pesanan.findUnique({
			where: { id: data.id },
			include: {
				user: { select: { name: true } },
				pembayaran: true,
				meja: { select: { id: true, nama: true, lantai: true } },
				detail: { include: { produk: { select: { namaProduk: true } } } },
			},
		});
		if (!order) throw new Error("Pesanan tidak ditemukan.");
		return {
			...toRow(order),
			paymentMethod: order.pembayaran?.metode ?? null,
			paymentAmount: order.pembayaran?.jumlahBayar.toFixed(2) ?? null,
			paymentDate: order.pembayaran?.tanggal.toISOString() ?? null,
			change:
				order.pembayaran?.status === "lunas" &&
				order.pembayaran.metode === "tunai"
					? order.pembayaran.jumlahBayar.minus(order.total).toFixed(2)
					: null,
			items: order.detail.map((item) => ({
				id: String(item.id),
				name: item.produk.namaProduk,
				qty: item.jumlah,
				price: item.harga.toFixed(2),
				subtotal: item.subtotal.toFixed(2),
			})),
		};
	});

export const setOrderStatus = createServerFn({ method: "POST" })
	.validator(parseOrderStatusInput)
	.handler(async ({ data }) => {
		await ensureStaff();
		return prisma.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM tb_pesanan WHERE id = ${data.id} FOR UPDATE`;
			const order = await tx.pesanan.findUnique({
				where: { id: data.id },
				include: { detail: true, pembayaran: true },
			});
			if (!order) throw new Error("Pesanan tidak ditemukan.");
			assertOrderTransition({
				current: order.status,
				target: data.status,
				paymentStatus: order.pembayaran?.status ?? null,
			});
			await tx.pesanan.update({
				where: { id: data.id },
				data: { status: data.status },
			});
			if (data.status === "dibatalkan") {
				if (order.pembayaran?.status === "belum_lunas") {
					await tx.pembayaran.delete({ where: { id: order.pembayaran.id } });
				}
				for (const item of order.detail) {
					await tx.produk.update({
						where: { id: item.produkId },
						data: { stok: { increment: item.jumlah } },
					});
					await tx.stok.create({
						data: {
							produkId: item.produkId,
							jumlah: item.jumlah,
							jenis: "masuk",
							tanggal: new Date(),
						},
					});
				}
			}
			return { id: order.id, status: data.status };
		});
	});

/**
 * Hapus permanen, admin saja. Hanya pesanan `dibatalkan`: stok sudah
 * dikembalikan saat pembatalan dan tidak masuk laporan (BR-6: hanya
 * selesai+lunas). Pesanan diproses harus dibatalkan dulu; pesanan selesai
 * adalah arsip penjualan dan tidak dapat dihapus.
 */
export const deleteOrder = createServerFn({ method: "POST" })
	.validator((input: { id: string | number }) => {
		const id = Number(input.id);
		if (!Number.isInteger(id) || id <= 0) throw new Error("id tidak valid");
		return { id };
	})
	.handler(async ({ data }) => {
		await ensureAdmin();
		return prisma.$transaction(async (tx) => {
			const order = await tx.pesanan.findUnique({
				where: { id: data.id },
				select: { id: true, status: true },
			});
			if (!order) throw new Error("Pesanan tidak ditemukan.");
			if (order.status !== "dibatalkan")
				throw new Error(
					"Hanya pesanan dibatalkan yang dapat dihapus. Batalkan dulu pesanan diproses; pesanan selesai adalah arsip penjualan.",
				);
			await tx.pesanan.delete({ where: { id: data.id } });
			return { id: order.id };
		});
	});
